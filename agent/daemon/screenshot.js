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

function capture(options = {}) {
  const { log } = require('./logger');
  const tmpFile = path.join(os.tmpdir(), `examlock_${Date.now()}.jpg`);
  const examUid = getExamUid();
  const normalizedOptions = { ...normalizeOptions(options), asBinary: options.asBinary === true };

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
        // captured via grim
        return readCapture(tmpFile, normalizedOptions);
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
      execFileSync('runuser', ['-u', EXAM_USER, '--', 'scrot', '-z', '-q', '70', tmpFile], { env: xEnv, stdio: 'pipe' });
    } else {
      execFileSync('scrot', ['-z', '-q', '70', tmpFile], { env: xEnv, stdio: 'pipe' });
    }
    // captured via scrot
    return readCapture(tmpFile, normalizedOptions);
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

function readCapture(filePath, options) {
  const toResult = (buf) => options.asBinary ? buf : buf.toString('base64');

  if (!options.maxWidth || !options.maxHeight) {
    return toResult(fs.readFileSync(filePath));
  }

  const resizedPath = `${filePath}.stream.jpg`;

  try {
    resizeImage(filePath, resizedPath, options);
    return toResult(fs.readFileSync(resizedPath));
  } catch {
    return toResult(fs.readFileSync(filePath));
  } finally {
    try { fs.unlinkSync(resizedPath); } catch {}
  }
}

function resizeImage(inputPath, outputPath, options) {
  const sizeArg = `${options.maxWidth}x${options.maxHeight}>`;
  const qualityArg = String(options.quality ?? 70);

  if (commandExists('magick')) {
    execFileSync('magick', [inputPath, '-resize', sizeArg, '-quality', qualityArg, outputPath], { stdio: 'pipe' });
    return;
  }

  if (commandExists('convert')) {
    execFileSync('convert', [inputPath, '-resize', sizeArg, '-quality', qualityArg, outputPath], { stdio: 'pipe' });
    return;
  }

  throw new Error('no_image_resizer_available');
}

function commandExists(command) {
  try {
    execFileSync('which', [command], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function normalizeOptions(options) {
  const maxWidth = Number(options.maxWidth);
  const maxHeight = Number(options.maxHeight);
  const quality = Number(options.quality);

  return {
    maxWidth: Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : null,
    maxHeight: Number.isFinite(maxHeight) && maxHeight > 0 ? maxHeight : null,
    quality: Number.isFinite(quality) && quality > 0 ? quality : 70,
  };
}

module.exports = { capture };
