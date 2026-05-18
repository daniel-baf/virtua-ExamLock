const { v4: uuidv4 } = require('uuid');
const { db } = require('../../../firebase');
const { logEvent } = require('../../../events');
const { getMonitoringSettings, normalizeStreamConfig } = require('../../../monitoringConfig');
const { activeDomains, defaultWhitelist, normalizeWhitelist } = require('../../../networkDefaults');

const HEARTBEAT_INTERVAL_MS = 15_000;
const HEARTBEAT_TIMEOUT_MS = HEARTBEAT_INTERVAL_MS * 3;

function isHeartbeatExpired(student, now = Date.now()) {
  return student.status === 'admitted'
    && Number.isFinite(student.lastHeartbeat)
    && now - student.lastHeartbeat > HEARTBEAT_TIMEOUT_MS;
}

async function createSession({ teacherId, name, timeLimit = 90, endsAt, whitelist = [], blockInternet = true }) {
  if (!name) {
    const error = new Error('name_required');
    error.statusCode = 400;
    throw error;
  }

  const sessionId = uuidv4();
  const code = generateCode();
  const now = Date.now();
  const end = endsAt ? new Date(endsAt).getTime() : now + timeLimit * 60 * 1000;
  const monitoringSettings = await getMonitoringSettings(db());
  const normalizedWhitelist = normalizeWhitelist(whitelist);

  await db().collection('sessions').doc(sessionId).set({
    name,
    code,
    teacherId,
    active: true,
    timeLimit,
    startedAt: now,
    endsAt: end,
    whitelist: normalizedWhitelist,
    blockInternet,
    whitelistVersion: 0,
    streamConfig: monitoringSettings.streamConfig,
  });

  return { sessionId, code };
}

function getNetworkDefaults() {
  return { whitelist: defaultWhitelist() };
}

async function listTeacherSessions(teacherId) {
  const snap = await db()
    .collection('sessions')
    .where('teacherId', '==', teacherId)
    .get();

  const sessions = snap.docs.map(doc => mapSession(doc.id, doc.data()));
  sessions.sort((left, right) => right.createdAt - left.createdAt);
  return { sessions };
}

async function getTeacherSessionSummary(sessionId, teacherId) {
  const sessionDoc = await getOwnedSession(sessionId, teacherId);
  return { session: mapSession(sessionDoc.id, sessionDoc.data()) };
}

async function getPublicSessionByCode(code) {
  const sessionDoc = await findActiveSessionByCode(code);
  const data = sessionDoc.data();
  return { sessionId: sessionDoc.id, name: data.name, endsAt: data.endsAt };
}

async function joinSession({ code, user }) {
  const uid = user.uid;
  const sessionDoc = await findActiveSessionByCode(code);
  const session = sessionDoc.data();
  const sessionId = sessionDoc.id;

  if (Date.now() > session.endsAt) {
    const error = new Error('session_expired');
    error.statusCode = 410;
    throw error;
  }

  const existingDoc = await db().collection('students').doc(uid).get();
  const existing = existingDoc.exists ? existingDoc.data() : null;
  const existingInSession = existing?.sessionId === sessionId;

  if (existingInSession && existing?.status === 'kicked') {
    const error = new Error('kicked');
    error.statusCode = 403;
    throw error;
  }

  if (existingInSession && existing?.status === 'closed') {
    const error = new Error('closed');
    error.statusCode = 403;
    throw error;
  }

  const now = Date.now();
  const isNew = !existingDoc.exists;
  const reconnecting = existingInSession && (
    existing?.status === 'offline'
    || isHeartbeatExpired(existing, now)
  );
  const attempts = isNew || !existingInSession
    ? 0
    : (existing.attempts ?? 0) + (reconnecting ? 1 : 0);

  await db().collection('students').doc(uid).set({
    uid,
    email: user.email ?? '',
    sessionId,
    status: 'admitted',
    joinedAt: existingInSession ? (existing.joinedAt ?? now) : now,
    admittedAt: now,
    lastHeartbeat: now,
    offlineAt: null,
    closeReason: null,
    attempts,
    internetBlocked: session.blockInternet ?? false,
  }, { merge: true });

  await logEvent(sessionId, reconnecting ? 'reconnected' : 'join', {
    email: user.email,
    attempt: attempts,
  }, uid);

  return { sessionId, status: 'admitted', endsAt: session.endsAt };
}

async function listSessionStudents(sessionId, teacherId) {
  await getOwnedSession(sessionId, teacherId);

  const snap = await db().collection('students').where('sessionId', '==', sessionId).get();
  const now = Date.now();
  const updates = [];
  const students = snap.docs.map(doc => {
    const student = { uid: doc.id, ...doc.data() };
    if (!isHeartbeatExpired(student, now)) return student;

    const offlineAt = now;
    updates.push(doc.ref.update({ status: 'offline', streamReady: false, offlineAt }));
    return { ...student, status: 'offline', streamReady: false, offlineAt };
  });

  await Promise.all(updates);
  return { students };
}

async function requestSessionScreenshots(sessionId, teacherId, io) {
  await getOwnedSession(sessionId, teacherId);

  const snap = await db().collection('students').where('sessionId', '==', sessionId).get();
  const requestId = Date.now().toString();
  const activeStatuses = new Set(['admitted']);
  const students = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  const targets = students.filter(student => activeStatuses.has(student.status));
  const skipped = students.length - targets.length;

  targets.forEach(student => {
    io.to(`student:${student.uid}`).emit('server:capture-now', {
      requestId: `${requestId}_${student.uid}`,
    });
  });

  await logEvent(sessionId, 'screenshot-all-requested', {
    requestId,
    requested: targets.length,
    skipped,
  });

  return { ok: true, requestId, requested: targets.length, skipped };
}

async function updateWhitelist({ sessionId, teacherId, domains = [], blockInternet = false, io }) {
  const sessionDoc = await getOwnedSession(sessionId, teacherId);
  const version = (sessionDoc.data().whitelistVersion ?? 0) + 1;
  const whitelist = normalizeWhitelist(domains);

  await sessionDoc.ref.update({ whitelist, blockInternet, whitelistVersion: version });

  io.to(`session:${sessionId}`).emit('server:whitelist', {
    whitelist: activeDomains(whitelist),
    blockInternet,
    version,
  });

  await logEvent(sessionId, 'whitelist-applied', {
    domains: activeDomains(whitelist),
    configuredDomains: whitelist,
    blockInternet,
  });

  return { ok: true, version };
}

async function getSessionAudit(sessionId, teacherId) {
  const sessionDoc = await getOwnedSession(sessionId, teacherId);

  const [studentsSnap, eventsSnap, screenshotsSnap] = await Promise.all([
    db().collection('students').where('sessionId', '==', sessionId).get(),
    db().collection('events').where('sessionId', '==', sessionId).orderBy('ts').get(),
    db().collection('screenshots').where('sessionId', '==', sessionId).orderBy('takenAt').get(),
  ]);

  const students = studentsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  const events = eventsSnap.docs.map(doc => doc.data());
  const screenshots = screenshotsSnap.docs.map(doc => doc.data());

  const studentMap = {};
  students.forEach(student => {
    studentMap[student.uid] = {
      ...student,
      timeline: events.filter(event => event.studentUid === student.uid),
      screenshots: screenshots.filter(screenshot => screenshot.studentId === student.uid),
    };
  });

  return {
    session: {
      name: sessionDoc.data().name,
      startedAt: sessionDoc.data().startedAt,
      endsAt: sessionDoc.data().endsAt,
    },
    totals: {
      registered: students.length,
      admitted: students.filter(student => student.admittedAt).length,
      kicked: students.filter(student => student.status === 'kicked').length,
      currentlyConnected: students.filter(student => student.status === 'admitted').length,
    },
    students: Object.values(studentMap),
  };
}

function mapSession(sessionId, data) {
  return {
    sessionId,
    name: data.name,
    code: data.code,
    active: data.active,
    createdAt: data.startedAt,
    endsAt: data.endsAt,
    whitelist: normalizeWhitelist(data.whitelist ?? []),
    blockInternet: data.blockInternet ?? true,
    streamConfig: normalizeStreamConfig(data.streamConfig),
  };
}

async function getOwnedSession(sessionId, teacherId) {
  const sessionDoc = await db().collection('sessions').doc(sessionId).get();
  if (!sessionDoc.exists) {
    const error = new Error('not_found');
    error.statusCode = 404;
    throw error;
  }
  if (sessionDoc.data().teacherId !== teacherId) {
    const error = new Error('forbidden');
    error.statusCode = 403;
    throw error;
  }
  return sessionDoc;
}

async function findActiveSessionByCode(code) {
  const snap = await db()
    .collection('sessions')
    .where('code', '==', code)
    .where('active', '==', true)
    .limit(1)
    .get();

  if (snap.empty) {
    const error = new Error('session_not_found');
    error.statusCode = 404;
    throw error;
  }

  return snap.docs[0];
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

module.exports = {
  createSession,
  getNetworkDefaults,
  listTeacherSessions,
  getTeacherSessionSummary,
  getPublicSessionByCode,
  joinSession,
  listSessionStudents,
  requestSessionScreenshots,
  updateWhitelist,
  getSessionAudit,
};
