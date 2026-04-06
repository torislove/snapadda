import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let db;
let fAdmin = admin;

// Highly defensive initialization for local vs production
const isLocal = process.env.npm_lifecycle_event === 'start' || process.env.LOCAL_DEV === 'true';
const hasCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS || !!process.env.FIREBASE_SERVICE_ACCOUNT;

if (process.env.DB_FIREBASE_URL) {
  try {
    // on production/GCP, applicationDefault() works automatically. 
    // locally, it hangs if no JSON key is found. Skip locally if no creds.
    if (isLocal && !hasCredentials) {
      console.warn("⚠️ Firebase Admin: Local dev detected without credentials. Skipping RTDB sync to prevent hangs.");
    } else {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          databaseURL: process.env.DB_FIREBASE_URL
        });
      }
      db = admin.database();
      console.log("✅ Firebase Admin initialized");
    }
  } catch (err) {
    console.error("❌ Firebase Admin init failed:", err.message);
  }
} else {
  console.warn("⚠️ DB_FIREBASE_URL missing. Real-time sync disabled.");
}

export { db, fAdmin };
