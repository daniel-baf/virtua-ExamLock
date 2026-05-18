const socketClient = require('../../../socket');
const heartbeat = require('../../../heartbeat');
const answers = require('../../../answers');

async function getQuestions({ serverUrl, state }) {
  const current = state.getState();
  if (!current.token) {
    const error = new Error('not_joined');
    error.statusCode = 401;
    throw error;
  }

  if (current.questions.length > 0) return { questions: current.questions };

  const response = await fetch(`${serverUrl}/api/exam/${current.sessionId}`, {
    headers: { Authorization: `Bearer ${current.token}` },
  });
  const data = await response.json();
  state.replaceQuestions(data.questions ?? []);
  return { questions: state.getState().questions };
}

async function queueAnswer({ questionId, answer, serverUrl, state }) {
  if (!questionId || answer === undefined) {
    const error = new Error('missing_fields');
    error.statusCode = 400;
    throw error;
  }

  answers.enqueue(questionId, answer);
  if (socketClient.isConnected()) {
    const current = state.getState();
    await answers.flush(current.sessionId, current.token, serverUrl);
  }

  return { queued: true };
}

async function submitExam({ serverUrl, state, sse }) {
  const current = state.getState();
  if (!current.token) {
    const error = new Error('not_joined');
    error.statusCode = 401;
    throw error;
  }

  await answers.flush(current.sessionId, current.token, serverUrl);
  socketClient.emit('student:closed', { studentId: current.studentId, reason: 'submitted' });
  heartbeat.stop();
  state.patch({ status: 'ended' });
  sse.broadcast('exam-ended', {});
  return { ok: true };
}

module.exports = { getQuestions, queueAnswer, submitExam };
