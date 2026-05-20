const { db, storage } = require('../../../firebase');
const { logEvent } = require('../../../events');
const { normalizeStreamConfig } = require('../../../monitoringConfig');
const { activeDomains } = require('../../../networkDefaults');
const { sessionTimePayload } = require('../../sessions/application/sessionService');

async function admitStudent(teacherUid, uid, io) {
  const doc = await getOwnedStudent(teacherUid, uid);
  const session = await db().collection('sessions').doc(doc.data().sessionId).get();
  const { whitelist = [], blockInternet = false } = session.data();

  await db().collection('students').doc(uid).update({
    status: 'admitted',
    admittedAt: Date.now(),
  });

  await logEvent(doc.data().sessionId, 'admit', { admittedBy: teacherUid }, uid);

  io.to(`student:${uid}`).emit('server:admitted', {
    whitelist: activeDomains(whitelist),
    blockInternet,
    ...sessionTimePayload(session.data().endsAt),
    whitelistVersion: session.data().whitelistVersion ?? 0,
    streamConfig: normalizeStreamConfig(session.data().streamConfig),
  });

  return { ok: true };
}

async function kickStudent(teacherUid, uid, reason, io) {
  const doc = await getOwnedStudent(teacherUid, uid);

  await db().collection('students').doc(uid).update({
    status: 'kicked',
    kickedAt: Date.now(),
  });

  await logEvent(doc.data().sessionId, 'kick', { reason, kickedBy: teacherUid }, uid);
  io.to(`student:${uid}`).emit('server:kicked', { reason });
  return { ok: true };
}

async function readmitStudent(teacherUid, uid, io) {
  const doc = await getOwnedStudent(teacherUid, uid);
  const session = await db().collection('sessions').doc(doc.data().sessionId).get();
  const { whitelist = [], blockInternet = false } = session.data();

  const attempts = (doc.data().attempts ?? 0) + 1;
  await db().collection('students').doc(uid).update({
    status: 'admitted',
    admittedAt: Date.now(),
    attempts,
  });

  await logEvent(doc.data().sessionId, 'readmit', { attempt: attempts, by: teacherUid }, uid);

  io.to(`student:${uid}`).emit('server:admitted', {
    whitelist: activeDomains(whitelist),
    blockInternet,
    ...sessionTimePayload(session.data().endsAt),
    whitelistVersion: session.data().whitelistVersion ?? 0,
    streamConfig: normalizeStreamConfig(session.data().streamConfig),
  });

  return { ok: true, attempts };
}

async function requestScreenshot(teacherUid, uid, io) {
  const doc = await getOwnedStudent(teacherUid, uid);
  const requestId = Date.now().toString();
  await logEvent(doc.data().sessionId, 'screenshot-requested', { requestId }, uid);
  io.to(`student:${uid}`).emit('server:capture-now', { requestId });
  return { ok: true, requestId };
}

async function listScreenshots(teacherUid, uid) {
  const doc = await getOwnedStudent(teacherUid, uid);
  const sessionId = doc.data().sessionId;
  const snap = await db().collection('screenshots').where('studentId', '==', uid).get();

  return {
    screenshots: snap.docs
      .map(item => ({ id: item.id, ...item.data() }))
      .filter(screenshot => screenshot.sessionId === sessionId)
      .sort((left, right) => (right.takenAt ?? 0) - (left.takenAt ?? 0))
      .slice(0, 100),
  };
}

async function loadScreenshotImage(teacherUid, uid, filePath) {
  const doc = await getOwnedStudent(teacherUid, uid);
  const sessionId = doc.data().sessionId;
  const expectedPrefix = `${sessionId}/${uid}/`;
  if (!filePath.startsWith(expectedPrefix) || filePath.includes('..')) {
    const error = new Error('forbidden');
    error.statusCode = 403;
    throw error;
  }

  try {
    const [buffer] = await storage().file(filePath).download();
    return buffer;
  } catch (_err) {
    const error = new Error('image_not_found');
    error.statusCode = 404;
    throw error;
  }
}

async function sendMessage(teacherUid, uid, text, io) {
  if (!text) {
    const error = new Error('text_required');
    error.statusCode = 400;
    throw error;
  }

  const doc = await getOwnedStudent(teacherUid, uid);
  await logEvent(
    doc.data().sessionId,
    'message-sent',
    { text: String(text).slice(0, 500), sentBy: teacherUid },
    uid,
  );
  io.to(`student:${uid}`).emit('server:message', { text });
  return { ok: true };
}

async function getOwnedStudent(teacherUid, uid) {
  const doc = await db().collection('students').doc(uid).get();
  if (!doc.exists) {
    const error = new Error('not_found');
    error.statusCode = 404;
    throw error;
  }

  const sessionDoc = await db().collection('sessions').doc(doc.data().sessionId).get();
  if (!sessionDoc.exists || sessionDoc.data().teacherId !== teacherUid) {
    const error = new Error('not_found');
    error.statusCode = 404;
    throw error;
  }

  return doc;
}

module.exports = {
  admitStudent,
  kickStudent,
  readmitStudent,
  requestScreenshot,
  listScreenshots,
  loadScreenshotImage,
  sendMessage,
  getOwnedStudent,
};
