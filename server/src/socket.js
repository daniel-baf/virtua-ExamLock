const { authenticateSocket, resolveStudentSession, resolveTeacherSession } = require('./domains/monitoring/socket/socketAuth');
const { handleStudentSocket } = require('./domains/monitoring/socket/studentSocketHandler');
const { handleTeacherSocket } = require('./domains/monitoring/socket/teacherSocketHandler');

module.exports = function registerSocket(io) {
  const heartbeatTimers = new Map();

  io.use(authenticateSocket);

  io.on('connection', async socket => {
    const { role } = socket.user;

    if (role === 'student') {
      const resolved = await resolveStudentSession(socket);
      if (!resolved) return socket.disconnect(true);
      handleStudentSocket(socket, resolved.sessionId, io, heartbeatTimers);
    } else if (role === 'teacher') {
      const resolved = await resolveTeacherSession(socket);
      if (!resolved) return socket.disconnect(true);
      handleTeacherSocket(socket, resolved.sessionId, io);
    } else {
      socket.disconnect(true);
    }
  });
};
