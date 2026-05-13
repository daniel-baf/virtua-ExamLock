const socket = require('./socket');

let timer = null;

function start() {
  if (timer) return;
  timer = setInterval(() => {
    socket.emit('student:heartbeat', { timestamp: Date.now() });
  }, 10_000);
}

function stop() {
  if (timer) { clearInterval(timer); timer = null; }
}

module.exports = { start, stop };
