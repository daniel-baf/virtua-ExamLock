const { io } = require('socket.io-client');

let socket = null;
let onReconnectCallback = null;

function connect(serverUrl, token) {
  socket = io(serverUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnectionDelay: 2000,
    reconnectionDelayMax: 15000,
  });

  socket.on('connect', () => {
    console.log('socket connected');
    if (onReconnectCallback) onReconnectCallback();
  });

  socket.on('disconnect', reason => console.log('socket disconnected:', reason));
  socket.on('connect_error', err => console.error('socket error:', err.message));

  return socket;
}

function emit(event, data) {
  socket?.emit(event, data);
}

function on(event, handler) {
  socket?.on(event, handler);
}

function onReconnect(cb) {
  onReconnectCallback = cb;
}

function isConnected() {
  return socket?.connected ?? false;
}

module.exports = { connect, emit, on, onReconnect, isConnected };
