function createSessionState() {
  let state = {
    studentId: null,
    sessionId: null,
    token: null,
    questions: [],
    status: 'idle',
    endsAt: null,
    localEndsAt: null,
  };

  return {
    getState: () => state,
    patch: (partial) => {
      state = { ...state, ...partial };
      return state;
    },
    replaceQuestions: (questions) => {
      state = { ...state, questions };
      return state;
    },
  };
}

module.exports = { createSessionState };
