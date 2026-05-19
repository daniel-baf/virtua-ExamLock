const { auth, db } = require('../../../firebase');

async function authenticateSocket(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('missing_token'));
  try {
    const decoded = await auth().verifyIdToken(token);
    if (!decoded.role) return next(new Error('no_role'));
    socket.user = decoded;
    return next();
  } catch (err) {
    console.error('[socket] auth failed:', err.message);
    next(new Error('invalid_token'));
  }
}

async function resolveStudentSession(socket) {
  const sessionCode = socket.handshake.query?.sessionCode;
  if (!sessionCode) return null;

  const snap = await db().collection('sessions')
    .where('code', '==', sessionCode)
    .where('active', '==', true)
    .limit(1)
    .get();
  if (snap.empty) return null;

  const sessionId = snap.docs[0].id;
  const studentDoc = await db().collection('students').doc(socket.user.uid).get();
  if (!studentDoc.exists || studentDoc.data().sessionId !== sessionId) return null;
  if (['closed', 'kicked'].includes(studentDoc.data().status)) return null;

  return { sessionId };
}

async function resolveTeacherSession(socket) {
  const sessionId = socket.handshake.query?.sessionId;
  if (!sessionId) return null;
  const sessionDoc = await db().collection('sessions').doc(sessionId).get();
  if (!sessionDoc.exists || sessionDoc.data().teacherId !== socket.user.uid) return null;
  return { sessionId };
}

module.exports = {
  authenticateSocket,
  resolveStudentSession,
  resolveTeacherSession,
};
