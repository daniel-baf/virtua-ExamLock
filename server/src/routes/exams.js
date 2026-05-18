const { Router } = require('express');
const { requireTeacher, requireContainer } = require('../auth');
const examService = require('../domains/exams/application/examService');

const router = Router();

// POST /api/exam/:sessionId/questions  — teacher creates questions
router.post('/:sessionId/questions', requireTeacher, async (req, res) => {
  try {
    res.json(await examService.createQuestions(req.params.sessionId, req.body.questions));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

// GET /api/exam/:sessionId  — container fetches questions (container token required)
router.get('/:sessionId', requireContainer, async (req, res) => {
  try {
    res.json(await examService.listQuestions(req.params.sessionId, req.session));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

// POST /api/exam/:sessionId/answer
router.post('/:sessionId/answer', requireContainer, async (req, res) => {
  try {
    res.json(await examService.saveAnswer(req.params.sessionId, req.session, req.body));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

module.exports = router;
