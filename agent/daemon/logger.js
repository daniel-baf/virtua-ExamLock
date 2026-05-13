const fs = require('fs');

const LOG_PATH = '/var/log/examlock/agent.log';
try { fs.mkdirSync('/var/log/examlock', { recursive: true }); } catch {}
const stream = fs.createWriteStream(LOG_PATH, { flags: 'a' });

function log(tag, ...args) {
  const line = `[${new Date().toISOString()}] [${tag}] ${args.map(a =>
    typeof a === 'string' ? a : JSON.stringify(a)
  ).join(' ')}\n`;
  stream.write(line);
  process.stdout.write(line);
}

module.exports = { log };
