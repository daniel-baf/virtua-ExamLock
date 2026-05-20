const { randomUUID } = require('crypto');
const { normalizeWhitelist } = require('../../../networkDefaults');

const BUILTIN_PRESETS = [
  {
    id: '__builtin_python',
    name: 'Python',
    builtin: true,
    domains: [
      { domain: 'docs.python.org', enabled: true, source: 'default' },
      { domain: 'www.python.org', enabled: true, source: 'default' },
      { domain: 'pypi.org', enabled: true, source: 'default' },
      { domain: 'files.pythonhosted.org', enabled: true, source: 'default' },
      { domain: 'bootstrap.pypa.io', enabled: true, source: 'default' },
    ],
  },
];

const COLLECTION = 'domainPresets';

function validatePreset({ name, domains }) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    const err = new Error('name_required');
    err.statusCode = 400;
    throw err;
  }
  if (!Array.isArray(domains) || domains.length === 0) {
    const err = new Error('domains_required');
    err.statusCode = 400;
    throw err;
  }
}

async function listPresets(db) {
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'asc').get();
  const custom = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), builtin: false }));
  return [...BUILTIN_PRESETS, ...custom];
}

async function createPreset(db, { name, domains }, actorUid) {
  validatePreset({ name, domains });
  const id = randomUUID();
  const payload = {
    name: String(name).trim(),
    domains: normalizeWhitelist(domains),
    createdBy: actorUid,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.collection(COLLECTION).doc(id).set(payload);
  return { id, ...payload, builtin: false };
}

async function updatePreset(db, id, { name, domains }, actorUid) {
  if (id.startsWith('__builtin_')) {
    const err = new Error('cannot_modify_builtin');
    err.statusCode = 400;
    throw err;
  }
  validatePreset({ name, domains });
  const payload = {
    name: String(name).trim(),
    domains: normalizeWhitelist(domains),
    updatedBy: actorUid,
    updatedAt: Date.now(),
  };
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    const err = new Error('preset_not_found');
    err.statusCode = 404;
    throw err;
  }
  await ref.set(payload, { merge: true });
  return { id, ...snap.data(), ...payload, builtin: false };
}

async function deletePreset(db, id) {
  if (id.startsWith('__builtin_')) {
    const err = new Error('cannot_delete_builtin');
    err.statusCode = 400;
    throw err;
  }
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    const err = new Error('preset_not_found');
    err.statusCode = 404;
    throw err;
  }
  await ref.delete();
}

module.exports = { listPresets, createPreset, updatePreset, deletePreset };
