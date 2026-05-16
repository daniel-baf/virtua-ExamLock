const { Router } = require('express');
const { auth, db } = require('../firebase');
const { requireRole } = require('../auth');

const router = Router();
const requireAdmin = requireRole('admin');

const VALID_ROLES = ['admin', 'teacher', 'student'];

router.get('/', requireAdmin, async (req, res) => {
  try {
    const pageToken = req.query.pageToken || undefined;
    const result = await auth().listUsers(100, pageToken);
    const users = result.users.map(u => ({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName ?? '',
      role: u.customClaims?.role ?? null,
      disabled: u.disabled,
    }));
    res.json({ users, nextPageToken: result.pageToken ?? null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { email, password, role, displayName } = req.body;
  if (!email || !password || !role || !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'invalid_params' });
  }
  try {
    const user = await auth().createUser({ email, password, displayName: displayName ?? '' });
    await auth().setCustomUserClaims(user.uid, { role });
    await db().collection('users').doc(user.uid).set({
      email,
      displayName: displayName ?? '',
      role,
      disabled: false,
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid,
    });
    res.status(201).json({ uid: user.uid });
  } catch (err) {
    const code = err.code === 'auth/email-already-exists' ? 'email_exists' : err.message;
    res.status(400).json({ error: code });
  }
});

router.patch('/:uid', requireAdmin, async (req, res) => {
  const { uid } = req.params;
  const { role, displayName, disabled } = req.body;

  if (role !== undefined && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'invalid_role' });
  }

  if (role !== undefined && role !== 'admin') {
    const snap = await db().collection('users').where('role', '==', 'admin').get();
    const adminUids = snap.docs.map(d => d.id);
    if (adminUids.length === 1 && adminUids[0] === uid) {
      return res.status(400).json({ error: 'last_admin' });
    }
  }

  try {
    const authUpdate = {};
    if (displayName !== undefined) authUpdate.displayName = displayName;
    if (disabled !== undefined) authUpdate.disabled = disabled;
    if (Object.keys(authUpdate).length) await auth().updateUser(uid, authUpdate);
    if (role !== undefined) await auth().setCustomUserClaims(uid, { role });

    const dbUpdate = {};
    if (role !== undefined) dbUpdate.role = role;
    if (displayName !== undefined) dbUpdate.displayName = displayName;
    if (disabled !== undefined) dbUpdate.disabled = disabled;
    if (Object.keys(dbUpdate).length) {
      await db().collection('users').doc(uid).set(dbUpdate, { merge: true });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:uid', requireAdmin, async (req, res) => {
  const { uid } = req.params;

  const snap = await db().collection('users').where('role', '==', 'admin').get();
  const adminUids = snap.docs.map(d => d.id);
  if (adminUids.length === 1 && adminUids[0] === uid) {
    return res.status(400).json({ error: 'last_admin' });
  }

  try {
    await auth().deleteUser(uid);
    await db().collection('users').doc(uid).delete();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
