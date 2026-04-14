import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging";

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

let app;
let db = null;
let messaging = null;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
    const rtdbUrl = import.meta.env.VITE_RTDB_URL || firebaseConfig.databaseURL;
    if (rtdbUrl && rtdbUrl !== 'undefined') {
      db = getDatabase(app, rtdbUrl);
      console.log("Firebase RTDB initialized:", rtdbUrl);
    } else {
      console.warn("RTDB URL missing or invalid. Sync features will be limited.");
    }
    
    // Initialize Messaging
    messaging = getMessaging(app);
    console.log("Firebase Messaging initialized");
    
  } catch (err) {
    console.error("Firebase startup failure:", err);
  }
} else {
  console.warn("Firebase configuration missing. Real-time features will be disabled.");
}

export { app, db, messaging };
