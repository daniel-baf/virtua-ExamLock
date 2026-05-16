#!/usr/bin/env node
// Usage: node bootstrap-admin.js <email> <password>
// Or via env: ADMIN_EMAIL=... ADMIN_PASSWORD=... node bootstrap-admin.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const admin = require('firebase-admin');

const email = process.argv[2] || process.env.ADMIN_EMAIL;
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Usage: node bootstrap-admin.js <email> <password>');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GCP_PROJECT_ID,
});

const db = admin.firestore();

(async () => {
  let uid;
  try {
    const user = await admin.auth().getUserByEmail(email);
    uid = user.uid;
    console.log(`User exists: ${uid}`);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') throw err;
    const user = await admin.auth().createUser({ email, password, displayName: 'Admin' });
    uid = user.uid;
    console.log(`Created user: ${uid}`);
  }

  await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
  await db.collection('users').doc(uid).set({
    email,
    displayName: 'Admin',
    role: 'admin',
    disabled: false,
    createdAt: new Date().toISOString(),
    createdBy: 'bootstrap',
  }, { merge: true });

  console.log(`Admin listo: ${email} (uid: ${uid})`);
  process.exit(0);
})().catch(err => {
  console.error(err.message);
  process.exit(1);
});
