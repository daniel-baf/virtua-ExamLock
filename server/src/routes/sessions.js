const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../firebase');
const { requireRole } = require('../auth');
const { logEvent } = require('../events');

const router = Router();

// POST /api/session/create
router.post('/create', requireRole('teacher'), async (req, res) => {
  const { name, timeLimit = 90, endsAt, whitelist = [], blockInternet = true } = req.body;
  if (!name) return res.status(400).json({ error: 'name_required' });

  const sessionId = uuidv4();
  const code = generateCode();
  const now = Date.now();
  const end = endsAt ? new Date(endsAt).getTime() : now + timeLimit * 60 * 1000;

  await db().collection('sessions').doc(sessionId).set({
    name,
    code,
    teacherId: req.user.uid,
    active: true,
    timeLimit,
    startedAt: now,
    endsAt: end,
    whitelist,
    blockInternet,
    whitelistVersion: 0,
  });

  res.json({ sessionId, code });
});

// GET /api/session  — list sessions for authenticated teacher
router.get('/', requireRole('teacher'), async (req, res) => {
  const snap = await db()
    .collection('sessions')
    .where('teacherId', '==', req.user.uid)
    .get();

  const sessions = snap.docs.map(d => {
    const data = d.data();
    return {
      sessionId: d.id,
      name: data.name,
      code: data.code,
      active: data.active,
      createdAt: data.startedAt,
      endsAt: data.endsAt,
    };
  });

  sessions.sort((a, b) => b.createdAt - a.createdAt);
  res.json({ sessions });
});

// GET /api/session/:code  — validate code before join (public)
router.get('/:code', async (req, res) => {
  const snap = await db()
    .collection('sessions')
    .where('code', '==', req.params.code)
    .where('active', '==', true)
    .limit(1)
    .get();

  if (snap.empty) return res.status(404).json({ error: 'not_found' });

  const doc = snap.docs[0];
  const data = doc.data();
  res.json({ sessionId: doc.id, name: data.name, endsAt: data.endsAt });
});

// POST /api/session/:code/join  — student joins (Firebase ID token required, role=student)
router.post('/:code/join', requireRole('student'), async (req, res) => {
  const uid = req.user.uid;
  const code = req.params.code;

  const snap = await db()
    .collection('sessions')
    .where('code', '==', code)
    .where('active', '==', true)
    .limit(1)
    .get();

  if (snap.empty) return res.status(404).json({ error: 'session_not_found' });

  const sessionDoc = snap.docs[0];
  const session = sessionDoc.data();
  const sessionId = sessionDoc.id;

  if (Date.now() > session.endsAt) {
    return res.status(410).json({ error: 'session_expired' });
  }

  const existingDoc = await db().collection('students').doc(uid).get();
  if (existingDoc.exists && existingDoc.data().status === 'kicked') {
    return res.status(403).json({ error: 'kicked' });
  }

  const now = Date.now();
  const isNew = !existingDoc.exists;

  await db().collection('students').doc(uid).set({
    uid,
    email: req.user.email ?? '',
    sessionId,
    status: 'waiting',
    joinedAt: now,
    lastHeartbeat: now,
    attempts: isNew ? 0 : (existingDoc.data().attempts ?? 0),
    internetBlocked: false,
  }, { merge: true });

  await logEvent(sessionId, 'join', { email: req.user.email }, uid);

  res.json({ sessionId, status: 'waiting' });
});

// GET /api/session/:id/students  — teacher monitor
router.get('/:id/students', requireRole('teacher'), async (req, res) => {
  const sessionId = req.params.id;
  const sessionDoc = await db().collection('sessions').doc(sessionId).get();
  if (!sessionDoc.exists) return res.status(404).json({ error: 'not_found' });
  if (sessionDoc.data().teacherId !== req.user.uid) return res.status(403).json({ error: 'forbidden' });

  const snap = await db().collection('students').where('sessionId', '==', sessionId).get();
  const students = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  res.json({ students });
});

// PUT /api/session/:id/whitelist  — teacher updates whitelist, broadcasts to all students
router.put('/:id/whitelist', requireRole('teacher'), async (req, res) => {
  const { domains = [], blockInternet = false } = req.body;
  const sessionRef = db().collection('sessions').doc(req.params.id);
  const doc = await sessionRef.get();
  if (!doc.exists) return res.status(404).json({ error: 'not_found' });
  if (doc.data().teacherId !== req.user.uid) return res.status(403).json({ error: 'forbidden' });

  const version = (doc.data().whitelistVersion ?? 0) + 1;
  await sessionRef.update({ whitelist: domains, blockInternet, whitelistVersion: version });

  req.app.get('io').to(`session:${req.params.id}`).emit('server:whitelist', {
    whitelist: domains,
    blockInternet,
    version,
  });

  await logEvent(req.params.id, 'whitelist-applied', { domains, blockInternet });
  res.json({ ok: true, version });
});

// GET /api/session/:id/audit  — post-exam audit data
router.get('/:id/audit', requireRole('teacher'), async (req, res) => {
  const sessionId = req.params.id;
  const sessionDoc = await db().collection('sessions').doc(sessionId).get();
  if (!sessionDoc.exists) return res.status(404).json({ error: 'not_found' });
  if (sessionDoc.data().teacherId !== req.user.uid) return res.status(403).json({ error: 'forbidden' });

  const [studentsSnap, eventsSnap, screenshotsSnap] = await Promise.all([
    db().collection('students').where('sessionId', '==', sessionId).get(),
    db().collection('events').where('sessionId', '==', sessionId).orderBy('ts').get(),
    db().collection('screenshots').where('sessionId', '==', sessionId).orderBy('takenAt').get(),
  ]);

  const students = studentsSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
  const events = eventsSnap.docs.map(d => d.data());
  const screenshots = screenshotsSnap.docs.map(d => d.data());

  const studentMap = {};
  students.forEach(s => {
    studentMap[s.uid] = {
      ...s,
      timeline: events.filter(e => e.studentUid === s.uid),
      screenshots: screenshots.filter(sc => sc.studentId === s.uid),
    };
  });

  res.json({
    session: {
      name: sessionDoc.data().name,
      startedAt: sessionDoc.data().startedAt,
      endsAt: sessionDoc.data().endsAt,
    },
    totals: {
      registered: students.length,
      admitted: students.filter(s => s.admittedAt).length,
      kicked: students.filter(s => s.status === 'kicked').length,
      currentlyConnected: students.filter(s => s.status === 'admitted').length,
    },
    students: Object.values(studentMap),
  });
});

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

module.exports = router;
