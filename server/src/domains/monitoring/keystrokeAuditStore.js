// In-memory keystroke chunk store: sessionId → uid → chunk[]
// Each chunk: { text, startedAt, endedAt }
// Data lost on server restart — acceptable since exams run continuously.

const store = new Map();

function appendChunk(sessionId, uid, chunk) {
  if (!chunk?.text) return;
  if (!store.has(sessionId)) store.set(sessionId, new Map());
  const session = store.get(sessionId);
  if (!session.has(uid)) session.set(uid, []);
  session.get(uid).push(chunk);
}

function getSession(sessionId) {
  const session = store.get(sessionId);
  if (!session) return [];
  return Array.from(session.entries()).map(([uid, chunks]) => ({ uid, chunks }));
}

function clearSession(sessionId) {
  store.delete(sessionId);
}

module.exports = { appendChunk, getSession, clearSession };
