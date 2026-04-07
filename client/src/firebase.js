import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_RTDB_URL
};

// Initialize Firebase
let app;
let db;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app, import.meta.env.VITE_RTDB_URL);
    console.log("Firebase initialized successfully");
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
} else {
  console.warn("Firebase configuration missing. Real-time features will be disabled.");
}

export { db };
