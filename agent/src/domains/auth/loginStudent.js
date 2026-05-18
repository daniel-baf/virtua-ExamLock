const socketClient = require('../../../socket');
const heartbeat = require('../../../heartbeat');
const answers = require('../../../answers');
const { registerServerHandlers } = require('../../app/socket/registerServerHandlers');

async function loginStudent({ studentName, sessionCode, serverUrl, state, sse }) {
  const joinRes = await fetch(`${serverUrl}/api/session/${sessionCode}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentName }),
  });

  if (!joinRes.ok) {
    const errorBody = await joinRes.json().catch(() => ({}));
    const error = new Error(errorBody.error ?? 'join_failed');
    error.statusCode = joinRes.status;
    throw error;
  }

  const data = await joinRes.json();
  state.patch({ ...data, status: 'active' });

  socketClient.connect(serverUrl, data.token);
  heartbeat.start();
  answers.flush(data.sessionId, data.token, serverUrl);
  registerServerHandlers({ socket: socketClient, state, answers, heartbeat, sse, serverUrl });

  return { ok: true, sessionId: data.sessionId, endsAt: data.endsAt };
}

module.exports = { loginStudent };
