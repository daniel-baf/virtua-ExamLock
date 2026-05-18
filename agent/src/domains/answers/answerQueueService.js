const answers = require('../../../answers');

function enqueueAnswer(questionId, answer) {
  answers.enqueue(questionId, answer);
}

async function flushAnswers(state, serverUrl) {
  const current = state.getState();
  if (!current.sessionId || !current.token) return;
  await answers.flush(current.sessionId, current.token, serverUrl);
}

module.exports = {
  enqueueAnswer,
  flushAnswers,
};
