const jwt = require('jsonwebtoken');
const { auth } = require('./firebase');

// Validates Firebase ID token from Authorization: Bearer <token>
async function requireTeacher(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_token' });
  }
  try {
    const decoded = await auth().verifyIdToken(header.slice(7));
    req.teacher = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}

// Validates short-lived JWT issued to a container for a specific session
function requireContainer(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_token' });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    if (payload.type !== 'container') throw new Error('wrong_type');
    req.session = payload;
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}

// Issues a container token valid until session endsAt
function issueContainerToken(sessionId, studentId, endsAt) {
  return jwt.sign(
    { type: 'container', sessionId, studentId },
    process.env.JWT_SECRET,
    { expiresIn: Math.floor((endsAt - Date.now()) / 1000) }
  );
}

module.exports = { requireTeacher, requireContainer, issueContainerToken };
