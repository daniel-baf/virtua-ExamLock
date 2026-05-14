const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { EXAM_USER } = require('./config');

function getExamUid() {
  try {
    return execFileSync('id', ['-u', EXAM_USER], { stdio: 'pipe' }).toString().trim();
  } catch { return null; }
}

function capture() {
  const { log } = require('./logger');
  const tmpFile = path.join(os.tmpdir(), `examlock_${Date.now()}.jpg`);
  const examUid = getExamUid();

  const errors = [];

  // Try Wayland (grim) as the desktop user so it can reach their Wayland socket.
  if (examUid) {
    const waylandSocket = detectWaylandSocket(examUid);
    if (waylandSocket) {
      try {
        execFileSync('runuser', ['-u', EXAM_USER, '--', 'grim', '-t', 'jpeg', '-q', '70', tmpFile], {
          env: {
            ...process.env,
            WAYLAND_DISPLAY: waylandSocket,
            XDG_RUNTIME_DIR: `/run/user/${examUid}`,
          },
          stdio: 'pipe',
        });
        log('screenshot', 'captured via grim (wayland)');
        return fs.readFileSync(tmpFile).toString('base64');
      } catch (err) {
        errors.push(`grim: ${err.stderr?.toString().trim() || err.message}`);
      } finally {
        try { fs.unlinkSync(tmpFile); } catch {}
      }
    }
  }

  // Try X11 (scrot) as the desktop user.
  const xauthority = `/home/${EXAM_USER}/.Xauthority`;
  const xEnv = {
    ...process.env,
    DISPLAY: ':0',
    XAUTHORITY: xauthority,
  };
  try {
    if (examUid) {
      execFileSync('runuser', ['-u', EXAM_USER, '--', 'scrot', '-q', '70', tmpFile], { env: xEnv, stdio: 'pipe' });
    } else {
      execFileSync('scrot', ['-q', '70', tmpFile], { env: xEnv, stdio: 'pipe' });
    }
    log('screenshot', 'captured via scrot (x11)');
    return fs.readFileSync(tmpFile).toString('base64');
  } catch (err) {
    errors.push(`scrot: ${err.stderr?.toString().trim() || err.message}`);
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }

  const msg = `capture failed — ${errors.join(' | ')}`;
  log('screenshot', 'ERROR', msg);
  throw new Error(msg);
}

function detectWaylandSocket(examUid) {
  // Check common socket names inside the user's XDG_RUNTIME_DIR
  const runtimeDir = `/run/user/${examUid}`;
  for (const name of ['wayland-0', 'wayland-1']) {
    try {
      fs.accessSync(path.join(runtimeDir, name));
      return name;
    } catch {}
  }
  return null;
}

module.exports = { capture };
