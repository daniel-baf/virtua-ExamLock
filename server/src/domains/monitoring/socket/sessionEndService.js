const { db } = require('../../../firebase');
const { logEvent } = require('../../../events');

// sessionEndTimers: Map<sessionId, TimeoutHandle>

async function scheduleSessionEnd(sessionId, endsAt, io, sessionEndTimers) {
  if (!endsAt || sessionEndTimers.has(sessionId)) return;

  const delay = endsAt - Date.now();
  if (delay <= 0) {
    await endSessionNow(sessionId, io, sessionEndTimers);
    return;
  }

  const timer = setTimeout(
    () => endSessionNow(sessionId, io, sessionEndTimers).catch(err =>
      console.error('[sessionEnd] auto-end failed:', err.message)
    ),
    delay
  );
  sessionEndTimers.set(sessionId, timer);
}

async function endSessionNow(sessionId, io, sessionEndTimers) {
  clearSessionEndTimer(sessionId, sessionEndTimers);
  await db().collection('sessions').doc(sessionId).update({ active: false });
  await logEvent(sessionId, 'exam-ended', { reason: 'time_expired' });
  io.to(`session:${sessionId}`).emit('server:exam-ended');
}

function clearSessionEndTimer(sessionId, sessionEndTimers) {
  const timer = sessionEndTimers.get(sessionId);
  if (timer) {
    clearTimeout(timer);
    sessionEndTimers.delete(sessionId);
  }
}

module.exports = { scheduleSessionEnd, clearSessionEndTimer };
