const fs = require('fs');

const LOG_PATH = '/var/log/examlock/agent.log';
try { fs.mkdirSync('/var/log/examlock', { recursive: true }); fs.chmodSync('/var/log/examlock', 0o755); } catch {}
const stream = fs.createWriteStream(LOG_PATH, { flags: 'a', mode: 0o644 });
try { fs.chmodSync(LOG_PATH, 0o644); } catch {}

let _forwarder = null;

function setLogForwarder(fn) {
  _forwarder = fn;
}

function log(tag, ...args) {
  const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
  const line = `[${new Date().toISOString()}] [${tag}] ${msg}\n`;
  stream.write(line);
  process.stdout.write(line);
  if (_forwarder) _forwarder(tag, msg);
}

module.exports = { log, setLogForwarder };
