import { verifyIdToken } from '../config/firebaseAdmin.js';
import User from '../models/User.js';

/**
 * Authentication middleware that verifies Firebase ID tokens.
 * Extracts the token from `Authorization: Bearer <token>`,
 * validates it with Firebase Admin SDK, extracts UID,
 * finds the MongoDB User document, and attaches it to `req.user`.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Missing Firebase authentication token.'
    });
  }

  try {
    // 1. Verify token with Firebase Admin
    const decodedToken = await verifyIdToken(token);
    const { uid, email, phone_number, name, picture, email_verified } = decodedToken;

    if (!uid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase authentication token (no UID).'
      });
    }

    // 2. Identify the corresponding user in MongoDB by firebaseUid
    let user = await User.findOne({ firebaseUid: uid });

    // If not found by firebaseUid, check by email to link existing accounts
    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.firebaseUid = uid;
        if (email_verified) user.isEmailVerified = true;
        await user.save();
      }
    }

    // If still not found, create new user document from verified Firebase claims
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        name: name || (email ? email.split('@')[0] : 'EV User'),
        email: email ? email.toLowerCase() : `${uid}@evnearu.local`,
        phone: phone_number || '',
        avatar: picture || '',
        isEmailVerified: Boolean(email_verified),
        isPhoneVerified: Boolean(phone_number),
        authProvider: 'firebase',
        vehicles: []
      });
      console.log(`[Auth] Created MongoDB profile for Firebase UID: ${uid}`);
    }

    req.firebaseUser = decodedToken;
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid, expired, or unverified authentication token. Please log in again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
