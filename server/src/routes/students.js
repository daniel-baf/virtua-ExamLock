const { Router } = require('express');
const { db } = require('../firebase');
const { requireRole } = require('../auth');
const { logEvent } = require('../events');

const router = Router();

async function ownsStudent(teacherUid, uid) {
  const doc = await db().collection('students').doc(uid).get();
  if (!doc.exists) return null;
  const sessionDoc = await db().collection('sessions').doc(doc.data().sessionId).get();
  if (!sessionDoc.exists || sessionDoc.data().teacherId !== teacherUid) return null;
  return doc;
}

// POST /api/student/:uid/admit
router.post('/:uid/admit', requireRole('teacher'), async (req, res) => {
  const doc = await ownsStudent(req.user.uid, req.params.uid);
  if (!doc) return res.status(404).json({ error: 'not_found' });

  const session = await db().collection('sessions').doc(doc.data().sessionId).get();
  const { whitelist = [], blockInternet = false } = session.data();

  await db().collection('students').doc(req.params.uid).update({
    status: 'admitted',
    admittedAt: Date.now(),
  });

  await logEvent(doc.data().sessionId, 'admit', { admittedBy: req.user.uid }, req.params.uid);

  req.app.get('io').to(`student:${req.params.uid}`).emit('server:admitted', {
    whitelist,
    blockInternet,
    whitelistVersion: session.data().whitelistVersion ?? 0,
  });

  res.json({ ok: true });
});

// POST /api/student/:uid/kick
router.post('/:uid/kick', requireRole('teacher'), async (req, res) => {
  const { reason = 'expelled' } = req.body;
  const doc = await ownsStudent(req.user.uid, req.params.uid);
  if (!doc) return res.status(404).json({ error: 'not_found' });

  await db().collection('students').doc(req.params.uid).update({
    status: 'kicked',
    kickedAt: Date.now(),
  });

  await logEvent(doc.data().sessionId, 'kick', { reason, kickedBy: req.user.uid }, req.params.uid);

  req.app.get('io').to(`student:${req.params.uid}`).emit('server:kicked', { reason });
  res.json({ ok: true });
});

// POST /api/student/:uid/readmit
router.post('/:uid/readmit', requireRole('teacher'), async (req, res) => {
  const doc = await ownsStudent(req.user.uid, req.params.uid);
  if (!doc) return res.status(404).json({ error: 'not_found' });

  const session = await db().collection('sessions').doc(doc.data().sessionId).get();
  const { whitelist = [], blockInternet = false } = session.data();

  const attempts = (doc.data().attempts ?? 0) + 1;
  await db().collection('students').doc(req.params.uid).update({
    status: 'admitted',
    admittedAt: Date.now(),
    attempts,
  });

  await logEvent(doc.data().sessionId, 'readmit', { attempt: attempts, by: req.user.uid }, req.params.uid);

  req.app.get('io').to(`student:${req.params.uid}`).emit('server:admitted', {
    whitelist,
    blockInternet,
    whitelistVersion: session.data().whitelistVersion ?? 0,
  });

  res.json({ ok: true, attempts });
});

// POST /api/student/:uid/screenshot  — request on-demand capture
router.post('/:uid/screenshot', requireRole('teacher'), async (req, res) => {
  const doc = await ownsStudent(req.user.uid, req.params.uid);
  if (!doc) return res.status(404).json({ error: 'not_found' });

  const requestId = Date.now().toString();
  await logEvent(doc.data().sessionId, 'screenshot-requested', { requestId }, req.params.uid);
  req.app.get('io').to(`student:${req.params.uid}`).emit('server:capture-now', { requestId });

  res.json({ ok: true, requestId });
});

// GET /api/student/:uid/screenshots  — latest screenshots for live monitor
router.get('/:uid/screenshots', requireRole('teacher'), async (req, res) => {
  const doc = await ownsStudent(req.user.uid, req.params.uid);
  if (!doc) return res.status(404).json({ error: 'not_found' });

  const sessionId = doc.data().sessionId;
  const snap = await db()
    .collection('screenshots')
    .where('sessionId', '==', sessionId)
    .orderBy('takenAt', 'desc')
    .limit(500)
    .get();

  const screenshots = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(sc => sc.studentId === req.params.uid)
    .slice(0, 100);

  res.json({ screenshots });
});

// POST /api/student/:uid/message
router.post('/:uid/message', requireRole('teacher'), async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text_required' });
  const doc = await ownsStudent(req.user.uid, req.params.uid);
  if (!doc) return res.status(404).json({ error: 'not_found' });

  req.app.get('io').to(`student:${req.params.uid}`).emit('server:message', { text });
  res.json({ ok: true });
});

module.exports = router;
