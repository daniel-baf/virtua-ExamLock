const fs = require('fs');

function readExamlockConfig() {
  const cfg = {};
  try {
    const raw = fs.readFileSync('/etc/examlock.conf', 'utf8');
    raw.split('\n').forEach(line => {
      const eq = line.indexOf('=');
      if (eq < 0) return;
      cfg[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    });
  } catch {}
  return cfg;
}

const fileConfig = readExamlockConfig();

function getConfigValue(key, fallback = undefined) {
  return process.env[key] ?? fileConfig[key] ?? fallback;
}

module.exports = {
  config: fileConfig,
  EXAM_USER: getConfigValue('EXAMLOCK_USER', 'user'),
  SERVER_URL: getConfigValue('SERVER_URL'),
  FIREBASE_API_KEY: getConfigValue('FIREBASE_API_KEY'),
  SCREENSHOT_INTERVAL_MS: Number(getConfigValue('SCREENSHOT_INTERVAL_MS', 300_000)),
  LIVE_STREAM_INTERVAL_MS: Number(getConfigValue('LIVE_STREAM_INTERVAL_MS', 1000)),
  LIVE_STREAM_MAX_WIDTH: Number(getConfigValue('LIVE_STREAM_MAX_WIDTH', 1280)),
  LIVE_STREAM_MAX_HEIGHT: Number(getConfigValue('LIVE_STREAM_MAX_HEIGHT', 720)),
};
