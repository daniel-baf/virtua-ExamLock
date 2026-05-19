const { db } = require('../../../firebase');
const { logEvent } = require('../../../events');

async function handleTeacherSocket(socket, sessionId, io) {
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

module.exports = { handleTeacherSocket };
