#!/usr/bin/env node

const path = require('path');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.examlock') });

const CONFIRM_TEXT = 'RESET_EXAMLOCK_TEST_DATA';
const COLLECTIONS = ['sessions', 'students', 'events', 'screenshots', 'questions', 'answers'];
const BATCH_SIZE = 400;

const args = new Set(process.argv.slice(2));
const includeAuthUsers = args.has('--auth-users');
const yes = args.has('--yes') || process.env.CONFIRM_RESET === CONFIRM_TEXT;

const projectId = process.env.GCP_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const bucketName = process.env.GCS_BUCKET || (projectId ? `${projectId}-examlock-screenshots` : undefined);

if (!projectId) {
  fail('Missing GCP_PROJECT_ID or FIREBASE_PROJECT_ID.');
}
if (!bucketName) {
  fail('Missing GCS_BUCKET and cannot infer it without project id.');
}
if (!yes) {
  fail(`Refusing to reset test data. Re-run with --yes or CONFIRM_RESET=${CONFIRM_TEXT}.`);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId,
  storageBucket: bucketName,
});

const db = admin.firestore();
const bucket = admin.storage().bucket(bucketName);

main().catch(err => {
  console.error('[reset] failed:', err);
  process.exit(1);
});

async function main() {
  console.log(`[reset] Project: ${projectId}`);
  console.log(`[reset] Bucket:  ${bucketName}`);
  console.log(`[reset] Auth:    ${includeAuthUsers ? 'DELETE USERS' : 'skip users'}`);

  for (const collection of COLLECTIONS) {
    const deleted = await deleteCollection(collection);
    console.log(`[reset] Firestore ${collection}: ${deleted} deleted`);
  }

  const filesDeleted = await deleteBucketFiles();
  console.log(`[reset] Bucket objects: ${filesDeleted} deleted`);

  if (includeAuthUsers) {
    const usersDeleted = await deleteAuthUsers();
    console.log(`[reset] Auth users: ${usersDeleted} deleted`);
  }

  console.log('[reset] Done.');
}

async function deleteCollection(collectionName) {
  let total = 0;

  while (true) {
    const snap = await db.collection(collectionName).limit(BATCH_SIZE).get();
    if (snap.empty) return total;

    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    total += snap.size;
  }
}

async function deleteBucketFiles() {
  let total = 0;
  let pageToken;

  do {
    const [files, , response] = await bucket.getFiles({
      autoPaginate: false,
      maxResults: 500,
      pageToken,
    });

    await Promise.all(files.map(file => file.delete({ ignoreNotFound: true })));
    total += files.length;
    pageToken = response?.nextPageToken;
  } while (pageToken);

  return total;
}

async function deleteAuthUsers() {
  let total = 0;
  let pageToken;

  do {
    const result = await admin.auth().listUsers(1000, pageToken);
    const uids = result.users.map(user => user.uid);
    if (uids.length > 0) {
      const deleted = await admin.auth().deleteUsers(uids);
      total += deleted.successCount;
      if (deleted.failureCount > 0) {
        console.warn(`[reset] Auth delete failures: ${deleted.failureCount}`);
      }
    }
    pageToken = result.pageToken;
  } while (pageToken);

  return total;
}

function fail(message) {
  console.error(`[reset] ${message}`);
  console.error('');
  console.error('Usage:');
  console.error('  CONFIRM_RESET=RESET_EXAMLOCK_TEST_DATA node server/scripts/reset-test-data.js');
  console.error('  CONFIRM_RESET=RESET_EXAMLOCK_TEST_DATA node server/scripts/reset-test-data.js --auth-users');
  process.exit(1);
}
