const { Router } = require('express');
const { requireRole } = require('../auth');
const sessionService = require('../domains/sessions/application/sessionService');

const router = Router();

// POST /api/session/create
router.post('/create', requireRole('teacher'), async (req, res) => {
  try {
    const result = await sessionService.createSession({
      teacherId: req.user.uid,
      ...req.body,
    });
    res.json(result);
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

// GET /api/session/network-defaults — institutional default whitelist
router.get('/network-defaults', requireRole('teacher'), async (_req, res) => {
  res.json(sessionService.getNetworkDefaults());
});

// GET /api/session  — list sessions for authenticated teacher
router.get('/', requireRole('teacher'), async (req, res) => {
  res.json(await sessionService.listTeacherSessions(req.user.uid));
});

// GET /api/session/id/:id  — teacher session summary
router.get('/id/:id', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await sessionService.getTeacherSessionSummary(req.params.id, req.user.uid));
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

// GET /api/session/:code  — validate code before join (public)
router.get('/:code', async (req, res) => {
  try {
    res.json(await sessionService.getPublicSessionByCode(req.params.code));
  } catch (error) {
    const responseError = error.message === 'session_not_found' ? 'not_found' : error.message;
    res.status(error.statusCode ?? 500).json({ error: responseError });
  }
});

// POST /api/session/:code/join  — student joins (Firebase ID token required, role=student)
router.post('/:code/join', requireRole('student'), async (req, res) => {
  try {
    res.json(await sessionService.joinSession({ code: req.params.code, user: req.user }));
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

// GET /api/session/:id/students  — teacher monitor
router.get('/:id/students', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await sessionService.listSessionStudents(req.params.id, req.user.uid));
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

// POST /api/session/:id/screenshot-all  — request screenshots from all active students
router.post('/:id/screenshot-all', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await sessionService.requestSessionScreenshots(req.params.id, req.user.uid, req.app.get('io')));
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

// PUT /api/session/:id/whitelist  — teacher updates whitelist, broadcasts to all students
router.put('/:id/whitelist', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await sessionService.updateWhitelist({
      sessionId: req.params.id,
      teacherId: req.user.uid,
      ...req.body,
      io: req.app.get('io'),
    }));
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

// GET /api/session/:id/audit  — post-exam audit data
router.get('/:id/audit', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await sessionService.getSessionAudit(req.params.id, req.user.uid));
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

module.exports = router;
