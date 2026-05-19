const { auth, db } = require('../../../firebase');

const VALID_ROLES = ['admin', 'teacher', 'student'];

async function listUsers(pageToken) {
  const result = await auth().listUsers(100, pageToken || undefined);
  return {
    users: result.users.map(mapAuthUser),
    nextPageToken: result.pageToken ?? null,
  };
}

async function createUser({ email, password, role, displayName }, actorUid) {
  if (!email || !password || !role || !VALID_ROLES.includes(role)) {
    const error = new Error('invalid_params');
    error.statusCode = 400;
    throw error;
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
      createdBy: actorUid,
    });
    return { uid: user.uid };
  } catch (err) {
    const error = new Error(err.code === 'auth/email-already-exists' ? 'email_exists' : err.message);
    error.statusCode = 400;
    throw error;
  }
}

async function updateUser(uid, { role, displayName, disabled }) {
  if (role !== undefined && !VALID_ROLES.includes(role)) {
    const error = new Error('invalid_role');
    error.statusCode = 400;
    throw error;
  }

  if (role !== undefined && role !== 'admin') {
    await ensureNotLastAdmin(uid);
  }

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

  return { ok: true };
}

async function deleteUser(uid) {
  await ensureNotLastAdmin(uid);
  await auth().deleteUser(uid);
  await db().collection('users').doc(uid).delete();
  return { ok: true };
}

async function ensureNotLastAdmin(uid) {
  const snap = await db().collection('users').where('role', '==', 'admin').get();
  const adminUids = snap.docs.map(doc => doc.id);
  if (adminUids.length === 1 && adminUids[0] === uid) {
    const error = new Error('last_admin');
    error.statusCode = 400;
    throw error;
  }
}

function mapAuthUser(user) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? '',
    role: user.customClaims?.role ?? null,
    disabled: user.disabled,
  };
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
