const { db } = require('./firebase');

async function logEvent(sessionId, type, payload = {}, studentUid = null) {
  await db().collection('events').add({ sessionId, studentUid, type, payload, ts: Date.now() });
}

module.exports = { logEvent };
