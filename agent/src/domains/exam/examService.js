const { requireActiveSession, cacheQuestions, endSession } = require('../session/sessionService');
const { enqueueAnswer, flushAnswers } = require('../answers/answerQueueService');
const {
  emitClosed,
  isConnected,
  stopHeartbeat,
} = require('../monitoring/serverCommandService');

async function getQuestions({ serverUrl, state }) {
  const current = requireActiveSession(state);

  if (current.questions.length > 0) return { questions: current.questions };

  const response = await fetch(`${serverUrl}/api/exam/${current.sessionId}`, {
    headers: { Authorization: `Bearer ${current.token}` },
  });
  const data = await response.json();
  cacheQuestions(state, data.questions);
  return { questions: state.getState().questions };
}

async function queueAnswer({ questionId, answer, serverUrl, state }) {
  if (!questionId || answer === undefined) {
    const error = new Error('missing_fields');
    error.statusCode = 400;
    throw error;
  }

  enqueueAnswer(questionId, answer);
  if (isConnected()) {
    await flushAnswers(state, serverUrl);
  }

  return { queued: true };
}

async function submitExam({ serverUrl, state, sse }) {
  const current = requireActiveSession(state);

  await flushAnswers(state, serverUrl);
  emitClosed(current.studentId, 'submitted');
  stopHeartbeat();
  endSession(state);
  sse.broadcast('exam-ended', {});
  return { ok: true };
}

module.exports = { getQuestions, queueAnswer, submitExam };
