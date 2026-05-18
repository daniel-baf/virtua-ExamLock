const socketClient = require('../../../socket');
const heartbeat = require('../../../heartbeat');
const { endSession } = require('../session/sessionService');
const { flushAnswers } = require('../answers/answerQueueService');

function connectToServer(serverUrl, token) {
  socketClient.connect(serverUrl, token);
}

function startHeartbeat() {
  heartbeat.start();
}

function stopHeartbeat() {
  heartbeat.stop();
}

function emitClosed(studentId, reason) {
  socketClient.emit('student:closed', { studentId, reason });
}

function emitCapture(type, studentId, imageBase64) {
  const event = type === 'camera' ? 'student:camera' : 'student:screenshot';
  socketClient.emit(event, { studentId, imageBase64 });
}

function isConnected() {
  return socketClient.isConnected();
}

function registerServerHandlers({ state, sse, serverUrl }) {
  socketClient.on('server:block-internet', () => sse.broadcast('block-internet', {}));
  socketClient.on('server:unblock-internet', () => sse.broadcast('unblock-internet', {}));
  socketClient.on('server:reactivate', ({ token }) => sse.broadcast('reactivate', { token }));
  socketClient.on('server:message', ({ text }) => sse.broadcast('message', { text }));
  socketClient.on('server:exam-ended', () => {
    endSession(state);
    stopHeartbeat();
    sse.broadcast('exam-ended', {});
  });

  socketClient.onReconnect(() => {
    flushAnswers(state, serverUrl);
  });
}

module.exports = {
  connectToServer,
  startHeartbeat,
  stopHeartbeat,
  emitClosed,
  emitCapture,
  isConnected,
  registerServerHandlers,
};
