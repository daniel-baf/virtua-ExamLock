const { db } = require('../../../firebase');
const { logEvent } = require('../../../events');

const HEARTBEAT_INTERVAL_MS = 15_000;
const HEARTBEAT_TIMEOUT_MS = HEARTBEAT_INTERVAL_MS * 3;

function resetHeartbeat(uid, sessionId, io, timers, socketId, { replace = false } = {}) {
  const current = timers.get(uid);
  if (current && current.socketId !== socketId && !replace) return false;
  clearTimer(uid, timers);
  const timer = setTimeout(() => {
    const active = timers.get(uid);
    if (!active || active.socketId !== socketId) return;
    timers.delete(uid);
    markStudentOffline(uid, sessionId, io);
  }, HEARTBEAT_TIMEOUT_MS);
  timers.set(uid, { timer, socketId });
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

module.exports = {
  resetHeartbeat,
  clearTimer,
};
