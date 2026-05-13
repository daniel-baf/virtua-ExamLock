const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../firebase');
const { requireTeacher } = require('../auth');

const router = Router();

// POST /api/student/:id/reactivate  — teacher generates one-time token
router.post('/:id/reactivate', requireTeacher, async (req, res) => {
  const ref = db().collection('students').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ error: 'not_found' });

  const token = uuidv4();
  await ref.update({ reactivationToken: token, status: 'reactivating' });

  // Socket.IO instance injected by index.js
  const io = req.app.get('io');
  io.to(`student:${req.params.id}`).emit('server:reactivate', { token });

  res.json({ token });
});

// POST /api/student/:id/block-internet
router.post('/:id/block-internet', requireTeacher, async (req, res) => {
  await db().collection('students').doc(req.params.id).update({ internetBlocked: true });
  req.app.get('io').to(`student:${req.params.id}`).emit('server:block-internet');
  res.json({ ok: true });
});

// POST /api/student/:id/unblock-internet
router.post('/:id/unblock-internet', requireTeacher, async (req, res) => {
  await db().collection('students').doc(req.params.id).update({ internetBlocked: false });
  req.app.get('io').to(`student:${req.params.id}`).emit('server:unblock-internet');
  res.json({ ok: true });
});

// POST /api/student/:id/message
router.post('/:id/message', requireTeacher, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text_required' });
  req.app.get('io').to(`student:${req.params.id}`).emit('server:message', { text });
  res.json({ ok: true });
});

module.exports = router;
