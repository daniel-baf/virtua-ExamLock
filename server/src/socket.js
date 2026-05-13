const { db, storage, auth } = require('./firebase');
const { logEvent } = require('./events');

const HEARTBEAT_TIMEOUT_MS = 30_000;

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
      if (studentDoc.data().status === 'kicked') return socket.disconnect(true);

      handleStudent(socket, sessionId, uid, io, heartbeatTimers);
    } else if (role === 'teacher') {
      const sessionId = socket.handshake.query?.sessionId;
      if (!sessionId) return socket.disconnect(true);
      handleTeacher(socket, sessionId, io);
    } else {
      socket.disconnect(true);
    }
  });
};

function handleStudent(socket, sessionId, uid, io, timers) {
  socket.join(`student:${uid}`);
  socket.join(`session:${sessionId}`);

  resetHeartbeat(uid, sessionId, io, timers);

  db().collection('students').doc(uid).update({
    lastHeartbeat: Date.now(),
  }).then(async () => {
    const doc = await db().collection('students').doc(uid).get();
    const name = doc.data()?.email ?? uid.slice(0, 8);
    io.to(`teachers:${sessionId}`).emit('monitor:student-joined', { uid, name, status: doc.data()?.status });
  });

  socket.on('student:heartbeat', () => {
    db().collection('students').doc(uid).update({ lastHeartbeat: Date.now() });
    resetHeartbeat(uid, sessionId, io, timers);
  });

  socket.on('student:screenshot', async ({ jpegB64, requestId }) => {
    const url = await uploadImage(jpegB64, `${sessionId}/${uid}/screen_${Date.now()}.jpg`);
    if (!url) return;
    await db().collection('students').doc(uid).update({ screenUrl: url, lastScreenshotAt: Date.now() });
    await db().collection('screenshots').add({ studentId: uid, sessionId, url, takenAt: Date.now(), type: 'screen' });
    await logEvent(sessionId, 'screenshot-received', { requestId, url }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:screenshot-update', { uid, url });
  });

  socket.on('student:closed', async ({ reason }) => {
    clearTimer(uid, timers);
    await db().collection('students').doc(uid).update({
      status: 'closed',
      closedAt: Date.now(),
    });
    await logEvent(sessionId, 'closed', { reason }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:student-closed', { uid, reason });
  });

  socket.on('disconnect', () => {
    clearTimer(uid, timers);
    db().collection('students').doc(uid).update({ status: 'offline' });
    logEvent(sessionId, 'offline', {}, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:student-offline', { uid });
  });
}

function handleTeacher(socket, sessionId, io) {
  socket.join(`teachers:${sessionId}`);

  socket.on('teacher:end-exam', async () => {
    await db().collection('sessions').doc(sessionId).update({ active: false });
    await logEvent(sessionId, 'exam-ended', {});
    io.to(`session:${sessionId}`).emit('server:exam-ended');
  });
}

function resetHeartbeat(uid, sessionId, io, timers) {
  clearTimer(uid, timers);
  const t = setTimeout(() => {
    db().collection('students').doc(uid).update({ status: 'offline' });
    logEvent(sessionId, 'offline', {}, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:student-offline', { uid });
  }, HEARTBEAT_TIMEOUT_MS);
  timers.set(uid, t);
}

function clearTimer(uid, timers) {
  if (timers.has(uid)) {
    clearTimeout(timers.get(uid));
    timers.delete(uid);
  }
}

async function uploadImage(jpegB64, filePath) {
  try {
    const buf = Buffer.from(jpegB64, 'base64');
    const file = storage().file(filePath);
    await file.save(buf, { contentType: 'image/jpeg', resumable: false });
    return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filePath}`;
  } catch (err) {
    console.error('upload failed:', err.message);
    return null;
  }
}
