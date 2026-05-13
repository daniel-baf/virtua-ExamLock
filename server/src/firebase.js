const admin = require('firebase-admin');

let app;

function getApp() {
  if (!app) {
    app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.GCP_PROJECT_ID,
      storageBucket: process.env.GCS_BUCKET,
    });
  }
  return app;
}

function db() {
  getApp();
  return admin.firestore();
}

function storage() {
  getApp();
  return admin.storage().bucket();
}

function auth() {
  getApp();
  return admin.auth();
}

module.exports = { db, storage, auth };
