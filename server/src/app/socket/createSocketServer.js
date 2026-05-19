const { Server } = require('socket.io');
const registerSocketHandlers = require('./registerSocketHandlers');

function createSocketServer(httpServer, allowedOrigins) {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
      methods: ['GET', 'POST'],
    },
  });

  registerSocketHandlers(io);
  return io;
}

module.exports = { createSocketServer };
