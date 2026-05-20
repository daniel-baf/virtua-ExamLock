function requireActiveSession(state) {
  const current = state.getState();
  if (!current.token) {
    const error = new Error('not_joined');
    error.statusCode = 401;
    throw error;
  }
  return current;
}

function activateSession(state, payload) {
  const remaining = Number(payload?.remainingMs);
  const localEndsAt = Number.isFinite(remaining)
    ? Date.now() + Math.max(0, remaining)
    : null;
  return state.patch({ ...payload, localEndsAt, status: 'active' });
}

function endSession(state) {
  return state.patch({ status: 'ended' });
}

function getPublicState(state) {
  const current = state.getState();
  const remainingMs = current.localEndsAt
    ? Math.max(0, current.localEndsAt - Date.now())
    : null;
  return { status: current.status, endsAt: current.endsAt ?? null, remainingMs };
}

function cacheQuestions(state, questions) {
  return state.replaceQuestions(questions ?? []);
}

module.exports = {
  requireActiveSession,
  activateSession,
  endSession,
  getPublicState,
  cacheQuestions,
};
