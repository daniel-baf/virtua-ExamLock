const fs = require('fs');

const QUEUE_FILE = '/tmp/answers.json';

function loadQueue() {
  try { return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8')); }
  catch { return []; }
}

function saveQueue(q) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(q));
}

// Upsert by questionId — last answer wins
function enqueue(questionId, answer) {
  const q = loadQueue();
  const idx = q.findIndex(a => a.questionId === questionId);
  const entry = { questionId, answer, nonce: `${Date.now()}-${Math.random()}` };
  if (idx >= 0) q[idx] = entry; else q.push(entry);
  saveQueue(q);
}

// Flush all queued answers to server, remove on success
async function flush(sessionId, token, serverUrl) {
  const q = loadQueue();
  if (q.length === 0) return;

  const remaining = [];
  for (const entry of q) {
    try {
      const res = await fetch(`${serverUrl}/api/exam/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(entry),
      });
      if (!res.ok) remaining.push(entry);
    } catch {
      remaining.push(entry);
    }
  }
  saveQueue(remaining);
}

module.exports = { enqueue, flush };
