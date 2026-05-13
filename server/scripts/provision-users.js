#!/usr/bin/env node
// One-off: creates Firebase users and sets role custom claims.
// Usage: node provision-users.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GCP_PROJECT_ID,
});

const USERS = [
  { email: 'daniel@vantumst.com', password: 'examlock2026', displayName: 'Daniel', role: 'teacher' },
  { email: 'danibaufu@gmail.com',  password: 'examlock2026', displayName: 'Dani',   role: 'student' },
];

(async () => {
  for (const u of USERS) {
    let user;
    try {
      user = await admin.auth().getUserByEmail(u.email);
      console.log(`exists  ${u.email} (${user.uid})`);
    } catch {
      user = await admin.auth().createUser({
        email: u.email,
        password: u.password,
        displayName: u.displayName,
        emailVerified: true,
      });
      console.log(`created ${u.email} (${user.uid})`);
    }
    await admin.auth().setCustomUserClaims(user.uid, { role: u.role });
    console.log(`  → role=${u.role}`);
  }
  console.log('done');
  process.exit(0);
})().catch(err => {
  console.error(err.message);
  process.exit(1);
});
