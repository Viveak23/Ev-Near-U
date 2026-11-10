import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

let firebaseAdminInitialized = false;

export const initFirebaseAdmin = () => {
  if (firebaseAdminInitialized || admin.apps.length > 0) {
    return admin.app();
  }

  try {
    // 1. Check for Service Account JSON string in env
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseAdminInitialized = true;
      console.log('[FirebaseAdmin] Initialized via FIREBASE_SERVICE_ACCOUNT env string');
      return admin.app();
    }

    // 2. Check for Service Account file path in env
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
      const serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseAdminInitialized = true;
      console.log('[FirebaseAdmin] Initialized via FIREBASE_SERVICE_ACCOUNT_PATH');
      return admin.app();
    }

    // 3. Check for distinct env vars (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      firebaseAdminInitialized = true;
      console.log('[FirebaseAdmin] Initialized via individual credentials env vars');
      return admin.app();
    }

    // 4. Fallback to default application credentials if available
    admin.initializeApp();
    firebaseAdminInitialized = true;
    console.log('[FirebaseAdmin] Initialized with default application credentials');
    return admin.app();
  } catch (error) {
    console.warn(`[FirebaseAdmin] Warning during initialization: ${error.message}. Verification will check token structure.`);
    return null;
  }
};

/**
 * Verify a Firebase ID Token sent from client Authorization: Bearer <idToken>
 * @param {string} token - The raw Firebase ID token
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
export const verifyIdToken = async (token) => {
  initFirebaseAdmin();

  if (admin.apps.length === 0) {
    throw new Error('Firebase Admin SDK is not configured with credentials on the server. Please set FIREBASE_SERVICE_ACCOUNT in environment.');
  }

  return await admin.auth().verifyIdToken(token);
};

export default admin;
