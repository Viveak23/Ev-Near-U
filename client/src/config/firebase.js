import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Real production Firebase configuration for EvNearU
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAhi6YZUKF-FKRbeWgch5Q-zyezekRuDk0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ev-near-u.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ev-near-u",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ev-near-u.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "108347211771",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:108347211771:web:8f41a9564243946bffd55e",
  measurementId: "G-PB78VTBR3Q"
};

export const isFirebaseConfigured = true;

let app = null;
let auth = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} catch (error) {
  console.error('[Firebase] Initialization error:', error.message);
}

export { app, auth };
export default app;
