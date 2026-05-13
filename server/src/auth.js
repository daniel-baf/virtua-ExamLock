const { auth } = require('./firebase');

function requireRole(role) {
  return async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'missing_token' });
    }
    try {
      const decoded = await auth().verifyIdToken(header.slice(7));
      if (decoded.role !== role) {
        return res.status(403).json({ error: 'wrong_role' });
      }
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: 'invalid_token' });
    }
  };
}

module.exports = { requireRole };
