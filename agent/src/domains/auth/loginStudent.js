const { activateSession } = require('../session/sessionService');
const { flushAnswers } = require('../answers/answerQueueService');
const {
  connectToServer,
  registerServerHandlers,
  startHeartbeat,
} = require('../monitoring/serverCommandService');

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
  activateSession(state, data);

  connectToServer(serverUrl, data.token);
  startHeartbeat();
  await flushAnswers(state, serverUrl);
  registerServerHandlers({ state, sse, serverUrl });

  return { ok: true, sessionId: data.sessionId, endsAt: data.endsAt, remainingMs: data.remainingMs };
}

module.exports = { loginStudent };
