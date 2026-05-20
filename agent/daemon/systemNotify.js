const { spawn } = require('child_process');

function showSystemNotification(title, body) {
  const proc = spawn('notify-send', ['-u', 'critical', '-i', 'dialog-information', title, body], {
    detached: true,
    stdio: 'ignore',
  });
  proc.on('error', () => {});
  proc.unref();
}

module.exports = { showSystemNotification };
