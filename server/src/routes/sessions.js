const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../firebase');
const { requireTeacher } = require('../auth');

const router = Router();

// POST /api/session/create
// Body: { name, timeLimit (minutes), endsAt (ISO) }
router.post('/create', requireTeacher, async (req, res) => {
  const { name, timeLimit = 90, endsAt } = req.body;
  if (!name) return res.status(400).json({ error: 'name_required' });

  const sessionId = uuidv4();
  const code = generateCode();
  const now = Date.now();
  const end = endsAt ? new Date(endsAt).getTime() : now + timeLimit * 60 * 1000;

  await db().collection('sessions').doc(sessionId).set({
    name,
    code,
    teacherId: req.teacher.uid,
    active: true,
    timeLimit,
    startedAt: now,
    endsAt: end,
  });

  res.json({ sessionId, code });
});

// GET /api/sessions  — list all sessions for the authenticated teacher
router.get('/', requireTeacher, async (req, res) => {
  const snap = await db()
    .collection('sessions')
    .where('teacherId', '==', req.teacher.uid)
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

// GET /api/session/:code  — validate code before join
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

// POST /api/session/:code/join
// Body: { studentName }
router.post('/:code/join', async (req, res) => {
  const { studentName } = req.body;
  if (!studentName) return res.status(400).json({ error: 'studentName_required' });

  const snap = await db()
    .collection('sessions')
    .where('code', '==', req.params.code)
    .where('active', '==', true)
    .limit(1)
    .get();

  if (snap.empty) return res.status(404).json({ error: 'session_not_found' });

  const sessionDoc = snap.docs[0];
  const session = sessionDoc.data();

  if (Date.now() > session.endsAt) {
    return res.status(410).json({ error: 'session_expired' });
  }

  const studentId = uuidv4();
  await db().collection('students').doc(studentId).set({
    name: studentName,
    sessionId: sessionDoc.id,
    status: 'active',
    connectedAt: Date.now(),
    closedAt: null,
    internetBlocked: false,
    reactivationToken: null,
    lastHeartbeat: Date.now(),
  });

  const { issueContainerToken } = require('../auth');
  const token = issueContainerToken(sessionDoc.id, studentId, session.endsAt);

  res.json({ studentId, sessionId: sessionDoc.id, token, endsAt: session.endsAt });
});

// GET /api/session/:id/students  — current students in session for monitor
router.get('/:id/students', requireTeacher, async (req, res) => {
  const snap = await db()
    .collection('students')
    .where('sessionId', '==', req.params.id)
    .get();
  const students = snap.docs.map(d => ({ studentId: d.id, ...d.data() }));
  res.json({ students });
});

// GET /api/session/:id/results  — teacher only
router.get('/:id/results', requireTeacher, async (req, res) => {
  const sessionId = req.params.id;

  const [studentsSnap, answersSnap, questionsSnap] = await Promise.all([
    db().collection('students').where('sessionId', '==', sessionId).get(),
    db().collection('answers').where('sessionId', '==', sessionId).get(),
    db().collection('questions').where('sessionId', '==', sessionId).orderBy('order').get(),
  ]);

  const students = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const answers = answersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const questions = questionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  res.json({ students, answers, questions });
});

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

module.exports = router;
