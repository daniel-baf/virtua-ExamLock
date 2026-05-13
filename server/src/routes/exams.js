const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../firebase');
const { requireTeacher, requireContainer } = require('../auth');

const router = Router();

// POST /api/exam/:sessionId/questions  — teacher creates questions
router.post('/:sessionId/questions', requireTeacher, async (req, res) => {
  const { questions } = req.body; // array of question objects
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'questions_required' });
  }

  const batch = db().batch();
  const ids = [];
  questions.forEach((q, i) => {
    const id = uuidv4();
    ids.push(id);
    batch.set(db().collection('questions').doc(id), {
      sessionId: req.params.sessionId,
      order: q.order ?? i,
      type: q.type, // 'multiple_choice' | 'true_false' | 'free_text' | 'code'
      text: q.text,
      options: q.options ?? null,
      correctAnswer: q.correctAnswer ?? null,
    });
  });
  await batch.commit();

  res.json({ ids });
});

// GET /api/exam/:sessionId  — container fetches questions (container token required)
router.get('/:sessionId', requireContainer, async (req, res) => {
  if (req.session.sessionId !== req.params.sessionId) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const snap = await db()
    .collection('questions')
    .where('sessionId', '==', req.params.sessionId)
    .orderBy('order')
    .get();

  const questions = snap.docs.map(d => {
    const q = d.data();
    return {
      id: d.id,
      order: q.order,
      type: q.type,
      text: q.text,
      options: q.options,
      // never send correctAnswer to container
    };
  });

  res.json({ questions });
});

// POST /api/exam/:sessionId/answer
router.post('/:sessionId/answer', requireContainer, async (req, res) => {
  if (req.session.sessionId !== req.params.sessionId) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const { questionId, answer, nonce } = req.body;
  if (!questionId || answer === undefined) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  // Idempotency: one answer per (studentId, questionId)
  const existing = await db()
    .collection('answers')
    .where('studentId', '==', req.session.studentId)
    .where('questionId', '==', questionId)
    .limit(1)
    .get();

  if (!existing.empty) {
    // Update existing answer
    await existing.docs[0].ref.update({ answer, savedAt: Date.now(), nonce: nonce ?? null });
    return res.json({ updated: true });
  }

  await db().collection('answers').add({
    sessionId: req.params.sessionId,
    studentId: req.session.studentId,
    questionId,
    answer,
    savedAt: Date.now(),
    nonce: nonce ?? null,
  });

  res.json({ saved: true });
});

module.exports = router;
