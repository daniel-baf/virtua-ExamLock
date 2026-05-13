const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function capture() {
  const tmpFile = path.join(os.tmpdir(), `examlock_${Date.now()}.jpg`);
  try {
    try {
      // Wayland
      execSync(`grim -t jpeg -q 70 "${tmpFile}"`, { stdio: 'pipe' });
    } catch {
      // X11 fallback
      execSync(`scrot -q 70 "${tmpFile}"`, { stdio: 'pipe' });
    }
    return fs.readFileSync(tmpFile).toString('base64');
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

module.exports = { capture };
