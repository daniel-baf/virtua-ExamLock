const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function capture() {
  const tmpFile = path.join(os.tmpdir(), `examlock_${Date.now()}.jpg`);
  try {
    const x11Env = { ...process.env, DISPLAY: ':0', XAUTHORITY: '/home/examuser/.Xauthority' };
    try {
      execSync(`grim -t jpeg -q 70 "${tmpFile}"`, { env: x11Env, stdio: 'pipe' });
    } catch {
      execSync(`scrot -q 70 "${tmpFile}"`, { env: x11Env, stdio: 'pipe' });
    }
    return fs.readFileSync(tmpFile).toString('base64');
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

module.exports = { capture };
