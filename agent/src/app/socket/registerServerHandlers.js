function registerServerHandlers({ socket, state, answers, heartbeat, sse, serverUrl }) {
  socket.on('server:block-internet', () => sse.broadcast('block-internet', {}));
  socket.on('server:unblock-internet', () => sse.broadcast('unblock-internet', {}));
  socket.on('server:reactivate', ({ token }) => sse.broadcast('reactivate', { token }));
  socket.on('server:message', ({ text }) => sse.broadcast('message', { text }));
  socket.on('server:exam-ended', () => {
    state.patch({ status: 'ended' });
    heartbeat.stop();
    sse.broadcast('exam-ended', {});
  });

  socket.onReconnect(() => {
    const current = state.getState();
    answers.flush(current.sessionId, current.token, serverUrl);
  });
}

module.exports = { registerServerHandlers };
