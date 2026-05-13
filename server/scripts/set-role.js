#!/usr/bin/env node
// Usage: node set-role.js <email> <teacher|student>
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const admin = require('firebase-admin');

const [email, role] = process.argv.slice(2);
if (!email || !['teacher', 'student'].includes(role)) {
  console.error('Usage: node set-role.js <email> <teacher|student>');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GCP_PROJECT_ID,
});

(async () => {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { role });
  console.log(`Set role="${role}" for ${email} (uid: ${user.uid})`);
  process.exit(0);
})().catch(err => {
  console.error(err.message);
  process.exit(1);
});
