import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// Detect if real Firebase credentials are provided in environment
export const isFirebaseConfigured = Boolean(
  rawApiKey && rawApiKey.trim() !== '' && !rawApiKey.includes('YourFirebaseApiKey')
);

// Fallback configuration prevents fatal crashes on static environments (e.g. GitHub Pages) before env vars are populated
const firebaseConfig = {
  apiKey: isFirebaseConfigured ? rawApiKey : 'AIzaSyEvNearUDummyKeyForPreviewOnly123',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'evnearu-prod.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'evnearu-prod',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'evnearu-prod.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890'
};

let app = null;
let auth = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} catch (error) {
  console.warn('[Firebase] Warning during initialization:', error.message);
}

export { app, auth };
export default app;
