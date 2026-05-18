const { Router } = require('express');
const { requireRole } = require('../auth');
const studentService = require('../domains/students/application/studentService');

const router = Router();

// POST /api/student/:uid/admit
router.post('/:uid/admit', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await studentService.admitStudent(req.user.uid, req.params.uid, req.app.get('io')));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

// POST /api/student/:uid/kick
router.post('/:uid/kick', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await studentService.kickStudent(req.user.uid, req.params.uid, req.body.reason ?? 'expelled', req.app.get('io')));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

// POST /api/student/:uid/readmit
router.post('/:uid/readmit', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await studentService.readmitStudent(req.user.uid, req.params.uid, req.app.get('io')));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

// POST /api/student/:uid/screenshot  — request on-demand capture
router.post('/:uid/screenshot', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await studentService.requestScreenshot(req.user.uid, req.params.uid, req.app.get('io')));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

// GET /api/student/:uid/screenshots  — latest screenshots for live monitor
router.get('/:uid/screenshots', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await studentService.listScreenshots(req.user.uid, req.params.uid));
  } catch (err) {
    console.error('[screenshots] failed:', err.message);
    res.status(err.statusCode ?? 500).json({ error: err.statusCode ? err.message : 'screenshots_failed' });
  }
});

// GET /api/student/:uid/screenshot-image?path=... — authenticated image proxy
router.get('/:uid/screenshot-image', requireRole('teacher'), async (req, res) => {
  try {
    const buf = await studentService.loadScreenshotImage(req.user.uid, req.params.uid, String(req.query.path ?? ''));
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(buf);
  } catch (err) {
    console.error('[screenshot-image] failed:', err.message);
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

// POST /api/student/:uid/message
router.post('/:uid/message', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await studentService.sendMessage(req.user.uid, req.params.uid, req.body.text, req.app.get('io')));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

module.exports = router;
