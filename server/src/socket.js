const { db, storage, auth } = require('./firebase');
const { logEvent } = require('./events');
const { normalizeStreamConfig } = require('./monitoringConfig');
const { activeDomains } = require('./networkDefaults');

const HEARTBEAT_INTERVAL_MS = 15_000;
const HEARTBEAT_TIMEOUT_MS = HEARTBEAT_INTERVAL_MS * 3;

module.exports = function registerSocket(io) {
  const heartbeatTimers = new Map();

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('missing_token'));
    try {
      const decoded = await auth().verifyIdToken(token);
      if (!decoded.role) return next(new Error('no_role'));
      socket.user = decoded;
      return next();
    } catch (err) {
      console.error('[socket] auth failed:', err.message);
      next(new Error('invalid_token'));
    }
  });

  io.on('connection', async socket => {
    const { role, uid } = socket.user;

    if (role === 'student') {
      const sessionCode = socket.handshake.query?.sessionCode;
      if (!sessionCode) return socket.disconnect(true);

      const snap = await db().collection('sessions')
        .where('code', '==', sessionCode)
        .where('active', '==', true)
        .limit(1)
        .get();
      if (snap.empty) return socket.disconnect(true);

      const sessionId = snap.docs[0].id;
      const studentDoc = await db().collection('students').doc(uid).get();
      if (!studentDoc.exists || studentDoc.data().sessionId !== sessionId) {
        return socket.disconnect(true);
      }
      if (['closed', 'kicked'].includes(studentDoc.data().status)) return socket.disconnect(true);

      handleStudent(socket, sessionId, uid, io, heartbeatTimers);
    } else if (role === 'teacher') {
      const sessionId = socket.handshake.query?.sessionId;
      if (!sessionId) return socket.disconnect(true);
      const sessionDoc = await db().collection('sessions').doc(sessionId).get();
      if (!sessionDoc.exists || sessionDoc.data().teacherId !== uid) return socket.disconnect(true);
      handleTeacher(socket, sessionId, io);
    } else {
      socket.disconnect(true);
    }
  });
};

async function handleStudent(socket, sessionId, uid, io, timers) {
  socket.join(`student:${uid}`);
  socket.join(`session:${sessionId}`);

  resetHeartbeat(uid, sessionId, io, timers, socket.id, { replace: true });

  const [sessSnap, stuSnap] = await Promise.all([
    db().collection('sessions').doc(sessionId).get(),
    db().collection('students').doc(uid).get(),
  ]);
  const session = sessSnap.data() ?? {};
  const student = stuSnap.data() ?? {};

  const now = Date.now();
  await db().collection('students').doc(uid).update({
    status: 'admitted',
    lastHeartbeat: now,
    offlineAt: null,
  });

  io.to(`teachers:${sessionId}`).emit('monitor:student-joined', {
    uid,
    name: student.email ?? uid.slice(0, 8),
    status: 'admitted',
    lastHeartbeat: now,
    offlineAt: null,
  });

  // Always push current whitelist so the agent can apply it (covers first-connect and reconnects)
  socket.emit('server:admitted', {
    whitelist: activeDomains(session.whitelist ?? []),
    blockInternet: session.blockInternet ?? false,
    endsAt: session.endsAt,
    whitelistVersion: session.whitelistVersion ?? 0,
    streamConfig: normalizeStreamConfig(session.streamConfig),
  });

  if (teacherCount(io, sessionId) > 0) {
    io.to(`student:${uid}`).emit('server:monitor-start');
    io.to(`teachers:${sessionId}`).emit('monitor:stream-status', { uid, status: 'connecting' });
  }

  socket.on('student:heartbeat', () => {
    if (!resetHeartbeat(uid, sessionId, io, timers, socket.id)) return;
    const heartbeatAt = Date.now();
    db().collection('students').doc(uid).update({
      status: 'admitted',
      lastHeartbeat: heartbeatAt,
      offlineAt: null,
    });
  });

  socket.on('student:screenshot', async ({ jpegB64, requestId }) => {
    const url = await uploadImage(jpegB64, `${sessionId}/${uid}/screen_${Date.now()}.jpg`);
    if (!url) {
      await logEvent(sessionId, 'screenshot-error', { requestId, error: 'upload_failed' }, uid);
      io.to(`teachers:${sessionId}`).emit('monitor:screenshot-error', { uid, error: 'upload_failed' });
      return;
    }
    await db().collection('students').doc(uid).update({ screenUrl: url, lastScreenshotAt: Date.now() });
    await db().collection('screenshots').add({ studentId: uid, sessionId, url, takenAt: Date.now(), type: 'screen' });
    await logEvent(sessionId, 'screenshot-received', { requestId, url }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:screenshot-update', { uid, url });
  });

  socket.on('student:screenshot-error', async ({ requestId, error }) => {
    const message = String(error ?? 'unknown_capture_error').slice(0, 500);
    await logEvent(sessionId, 'screenshot-error', { requestId, error: message }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:screenshot-error', { uid, error: message });
  });

  socket.on('student:stream-ready', async () => {
    const streamReadyAt = Date.now();
    await db().collection('students').doc(uid).update({ streamReady: true, streamReadyAt });
    await logEvent(sessionId, 'stream-ready', { streamReadyAt }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:stream-ready', { uid });
  });

  socket.on('student:stream-started', async () => {
    await logEvent(sessionId, 'stream-started', { startedAt: Date.now() }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:stream-started', { uid });
  });

  socket.on('student:monitor-frame', ({ jpegB64, takenAt }) => {
    if (!jpegB64) return;
    io.to(`teachers:${sessionId}`).emit('monitor:stream-frame', { uid, jpegB64, takenAt: takenAt ?? Date.now() });
  });

  socket.on('student:stream-error', async ({ error }) => {
    const message = String(error ?? 'unknown_stream_error').slice(0, 500);
    await logEvent(sessionId, 'stream-error', { error: message }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:stream-error', { uid, error: message });
    io.to(`teachers:${sessionId}`).emit('monitor:stream-status', { uid, status: 'error', error: message });
  });

  socket.on('student:stream-stopped', async () => {
    await logEvent(sessionId, 'stream-stopped', { stoppedAt: Date.now() }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:stream-stopped', { uid });
    io.to(`teachers:${sessionId}`).emit('monitor:stream-status', { uid, status: 'ready' });
  });

  socket.on('student:closed', async ({ reason }) => {
    const current = timers.get(uid);
    if (current && current.socketId !== socket.id) return;
    clearTimer(uid, timers);
    await db().collection('students').doc(uid).update({
      status: 'closed',
      closedAt: Date.now(),
      closeReason: reason ?? 'unknown',
    });
    await logEvent(sessionId, 'closed', { reason }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:student-closed', { uid, reason });
  });
}

function handleTeacher(socket, sessionId, io) {
  socket.join(`teachers:${sessionId}`);

  startSessionMonitor(io, sessionId).catch(err => {
    console.error('[socket] monitor start failed:', err.message);
  });

  socket.on('teacher:end-exam', async () => {
    await db().collection('sessions').doc(sessionId).update({ active: false });
    await logEvent(sessionId, 'exam-ended', {});
    io.to(`session:${sessionId}`).emit('server:exam-ended');
  });

  socket.on('disconnect', () => {
    stopSessionMonitorIfIdle(io, sessionId).catch(err => {
      console.error('[socket] monitor stop failed:', err.message);
    });
  });
}

function resetHeartbeat(uid, sessionId, io, timers, socketId, { replace = false } = {}) {
  const current = timers.get(uid);
  if (current && current.socketId !== socketId && !replace) return false;
  clearTimer(uid, timers);
  const t = setTimeout(() => {
    const current = timers.get(uid);
    if (!current || current.socketId !== socketId) return;
    timers.delete(uid);
    markStudentOffline(uid, sessionId, io);
  }, HEARTBEAT_TIMEOUT_MS);
  timers.set(uid, { timer: t, socketId });
  return true;
}

function clearTimer(uid, timers, socketId = null) {
  const current = timers.get(uid);
  if (!current) return false;
  if (socketId && current.socketId !== socketId) return false;
  clearTimeout(current.timer);
  timers.delete(uid);
  return true;
}

async function markStudentOffline(uid, sessionId, io) {
  const current = await db().collection('students').doc(uid).get();
  const status = current.data()?.status;
  if (status === 'closed' || status === 'kicked' || status === 'offline') return;

  const offlineAt = Date.now();
  await db().collection('students').doc(uid).update({
    status: 'offline',
    streamReady: false,
    offlineAt,
  });
  await logEvent(sessionId, 'offline', { offlineAt }, uid);
  io.to(`teachers:${sessionId}`).emit('monitor:student-offline', { uid, offlineAt });
  io.to(`student:${uid}`).emit('server:monitor-stop');
}

async function startSessionMonitor(io, sessionId) {
  const snap = await db().collection('students')
    .where('sessionId', '==', sessionId)
    .where('status', '==', 'admitted')
    .get();

  snap.docs.forEach(doc => {
    io.to(`student:${doc.id}`).emit('server:monitor-start');
    io.to(`teachers:${sessionId}`).emit('monitor:stream-status', { uid: doc.id, status: 'connecting' });
  });
}

async function stopSessionMonitorIfIdle(io, sessionId) {
  if (teacherCount(io, sessionId) > 0) return;

  const snap = await db().collection('students')
    .where('sessionId', '==', sessionId)
    .where('status', '==', 'admitted')
    .get();

  snap.docs.forEach(doc => {
    io.to(`student:${doc.id}`).emit('server:monitor-stop');
    io.to(`teachers:${sessionId}`).emit('monitor:stream-status', { uid: doc.id, status: 'ready' });
  });
}

function teacherCount(io, sessionId) {
  return io.sockets.adapter.rooms.get(`teachers:${sessionId}`)?.size ?? 0;
}

async function uploadImage(jpegB64, filePath) {
  try {
    const buf = Buffer.from(jpegB64, 'base64');
    const file = storage().file(filePath);
    await file.save(buf, { contentType: 'image/jpeg', resumable: false });
    return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filePath}`;
  } catch (err) {
    console.error('[upload] failed:', err.message);
    return null;
  }
}
