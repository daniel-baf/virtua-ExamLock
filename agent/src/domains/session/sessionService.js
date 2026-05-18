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
  return state.patch({ ...payload, status: 'active' });
}

function endSession(state) {
  return state.patch({ status: 'ended' });
}

function getPublicState(state) {
  const current = state.getState();
  return { status: current.status, endsAt: current.endsAt ?? null };
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
