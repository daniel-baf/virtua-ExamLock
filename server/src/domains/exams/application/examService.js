const { v4: uuidv4 } = require('uuid');
const { db } = require('../../../firebase');

async function createQuestions(sessionId, questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    const error = new Error('questions_required');
    error.statusCode = 400;
    throw error;
  }

  const batch = db().batch();
  const ids = [];
  questions.forEach((question, index) => {
    const id = uuidv4();
    ids.push(id);
    batch.set(db().collection('questions').doc(id), {
      sessionId,
      order: question.order ?? index,
      type: question.type,
      text: question.text,
      options: question.options ?? null,
      correctAnswer: question.correctAnswer ?? null,
    });
  });
  await batch.commit();

  return { ids };
}

async function listQuestions(sessionId, session) {
  if (session.sessionId !== sessionId) {
    const error = new Error('forbidden');
    error.statusCode = 403;
    throw error;
  }

  const snap = await db()
    .collection('questions')
    .where('sessionId', '==', sessionId)
    .orderBy('order')
    .get();

  return {
    questions: snap.docs.map(doc => {
      const question = doc.data();
      return {
        id: doc.id,
        order: question.order,
        type: question.type,
        text: question.text,
        options: question.options,
      };
    }),
  };
}

async function saveAnswer(sessionId, session, { questionId, answer, nonce }) {
  if (session.sessionId !== sessionId) {
    const error = new Error('forbidden');
    error.statusCode = 403;
    throw error;
  }

  if (!questionId || answer === undefined) {
    const error = new Error('missing_fields');
    error.statusCode = 400;
    throw error;
  }

  const existing = await db()
    .collection('answers')
    .where('studentId', '==', session.studentId)
    .where('questionId', '==', questionId)
    .limit(1)
    .get();

  if (!existing.empty) {
    await existing.docs[0].ref.update({ answer, savedAt: Date.now(), nonce: nonce ?? null });
    return { updated: true };
  }

  await db().collection('answers').add({
    sessionId,
    studentId: session.studentId,
    questionId,
    answer,
    savedAt: Date.now(),
    nonce: nonce ?? null,
  });

  return { saved: true };
}

module.exports = {
  createQuestions,
  listQuestions,
  saveAnswer,
};
