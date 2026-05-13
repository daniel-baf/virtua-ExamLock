const jwt = require('jsonwebtoken');
const { db, storage } = require('./firebase');

const HEARTBEAT_TIMEOUT_MS = 30_000; // declare offline after 30s missed

module.exports = function registerSocket(io) {
  // Per-student timeout handles
  const heartbeatTimers = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('missing_token'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.session = payload;
      next();
    } catch {
      next(new Error('invalid_token'));
    }
  });

  io.on('connection', socket => {
    const { type, sessionId, studentId } = socket.session ?? {};

    if (type === 'container') {
      handleStudent(socket, sessionId, studentId, io, heartbeatTimers);
    } else if (type === 'teacher') {
      handleTeacher(socket, sessionId, io);
    } else {
      socket.disconnect(true);
    }
  });
};

// ── Student (container) ──────────────────────────────────────────────────────

function handleStudent(socket, sessionId, studentId, io, timers) {
  socket.join(`student:${studentId}`);
  socket.join(`session:${sessionId}`);

  resetHeartbeat(studentId, sessionId, io, timers);

  db().collection('students').doc(studentId).update({
    status: 'active',
    connectedAt: Date.now(),
    lastHeartbeat: Date.now(),
  });

  io.to(`teachers:${sessionId}`).emit('monitor:student-joined', { studentId });

  socket.on('student:heartbeat', () => {
    db().collection('students').doc(studentId).update({ lastHeartbeat: Date.now() });
    resetHeartbeat(studentId, sessionId, io, timers);
  });

  socket.on('student:screenshot', async ({ imageBase64 }) => {
    const url = await uploadImage(imageBase64, `${sessionId}/${studentId}/screen_${Date.now()}.jpg`);
    if (!url) return;
    await db().collection('screenshots').add({ studentId, sessionId, url, takenAt: Date.now(), type: 'screen' });
    io.to(`teachers:${sessionId}`).emit('monitor:screenshot-update', { studentId, url });
  });

  socket.on('student:camera', async ({ imageBase64 }) => {
    const url = await uploadImage(imageBase64, `${sessionId}/${studentId}/cam_${Date.now()}.jpg`);
    if (!url) return;
    await db().collection('screenshots').add({ studentId, sessionId, url, takenAt: Date.now(), type: 'camera' });
    io.to(`teachers:${sessionId}`).emit('monitor:camera-update', { studentId, url });
  });

  socket.on('student:closed', async ({ reason }) => {
    clearTimer(studentId, timers);
    await db().collection('students').doc(studentId).update({
      status: 'closed',
      closedAt: Date.now(),
      closeReason: reason ?? 'unknown',
    });
    io.to(`teachers:${sessionId}`).emit('monitor:student-closed', { studentId, reason });
  });

  socket.on('disconnect', () => {
    clearTimer(studentId, timers);
    db().collection('students').doc(studentId).update({ status: 'offline' });
    io.to(`teachers:${sessionId}`).emit('monitor:student-offline', { studentId });
  });
}

// ── Teacher ──────────────────────────────────────────────────────────────────

function handleTeacher(socket, sessionId, io) {
  socket.join(`teachers:${sessionId}`);

  socket.on('teacher:end-exam', async () => {
    await db().collection('sessions').doc(sessionId).update({ active: false });
    io.to(`session:${sessionId}`).emit('server:exam-ended');
  });

  // block/unblock/reactivate/message handled via REST (routes/students.js)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function resetHeartbeat(studentId, sessionId, io, timers) {
  clearTimer(studentId, timers);
  const t = setTimeout(() => {
    db().collection('students').doc(studentId).update({ status: 'offline' });
    io.to(`teachers:${sessionId}`).emit('monitor:student-offline', { studentId });
  }, HEARTBEAT_TIMEOUT_MS);
  timers.set(studentId, t);
}

function clearTimer(studentId, timers) {
  if (timers.has(studentId)) {
    clearTimeout(timers.get(studentId));
    timers.delete(studentId);
  }
}

async function uploadImage(imageBase64, path) {
  try {
    const buf = Buffer.from(imageBase64, 'base64');
    const file = storage().file(path);
    await file.save(buf, { contentType: 'image/jpeg', resumable: false });
    await file.makePublic();
    return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${path}`;
  } catch (err) {
    console.error('upload failed:', err.message);
    return null;
  }
}
