import User from '../models/User.js';
import { verifyIdToken } from '../config/firebaseAdmin.js';

// @desc    Sync authenticated Firebase user into MongoDB
// @route   POST /api/auth/sync
// @access  Private (Firebase Bearer token)
export const syncFirebaseUser = async (req, res, next) => {
  try {
    const { name, phone, vehicles, avatar } = req.body;
    const user = req.user; // populated by protect middleware

    if (name && (!user.name || user.name === 'EV User')) user.name = name;
    if (phone && !user.phone) user.phone = phone;
    if (avatar && !user.avatar) user.avatar = avatar;
    if (vehicles && vehicles.length > 0 && user.vehicles.length === 0) user.vehicles = vehicles;

    await user.save();

    res.json({
      success: true,
      message: 'User profile synced successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user after Firebase creation
// @route   POST /api/auth/register
// @access  Public (Requires valid Firebase ID token in header or body)
export const registerUser = async (req, res, next) => {
  try {
    const { idToken, name, email, phone, vehicles } = req.body;
    const authHeader = req.headers.authorization;
    const token = idToken || (authHeader && authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Registration requires a valid Firebase authentication ID token.'
      });
    }

    // Verify token with Firebase Admin
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;
    const verifiedEmail = (decoded.email || email || '').toLowerCase();
    const verifiedPhone = decoded.phone_number || phone || '';

    if (!uid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase authentication token.'
      });
    }

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, ...(verifiedEmail ? [{ email: verifiedEmail }] : [])]
    });

    if (user) {
      user.firebaseUid = uid;
      if (name) user.name = name;
      if (verifiedPhone) user.phone = verifiedPhone;
      if (vehicles) user.vehicles = vehicles;
      await user.save();
    } else {
      user = await User.create({
        firebaseUid: uid,
        name: name || (verifiedEmail ? verifiedEmail.split('@')[0] : 'EV User'),
        email: verifiedEmail || `${uid}@evnearu.local`,
        phone: verifiedPhone,
        avatar: decoded.picture || '',
        isEmailVerified: Boolean(decoded.email_verified),
        isPhoneVerified: Boolean(decoded.phone_number),
        authProvider: 'firebase',
        vehicles: vehicles || []
      });
    }

    res.status(201).json({
      success: true,
      message: 'Account registered and persisted successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login / Verify Firebase session
// @route   POST /api/auth/login
// @access  Public (Requires Firebase ID token)
export const loginUser = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const authHeader = req.headers.authorization;
    const token = idToken || (authHeader && authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : null);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Authentication requires a valid Firebase ID token.'
      });
    }

    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    let user = await User.findOne({ firebaseUid: uid });
    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email.toLowerCase() });
      if (user) {
        user.firebaseUid = uid;
        await user.save();
      }
    }

    if (!user) {
      // Create user record on initial login
      user = await User.create({
        firebaseUid: uid,
        name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'EV User'),
        email: decoded.email ? decoded.email.toLowerCase() : `${uid}@evnearu.local`,
        phone: decoded.phone_number || '',
        avatar: decoded.picture || '',
        isEmailVerified: Boolean(decoded.email_verified),
        isPhoneVerified: Boolean(decoded.phone_number),
        authProvider: 'firebase',
        vehicles: []
      });
    }

    res.json({
      success: true,
      message: 'Logged in successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private (Firebase Bearer token)
export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & vehicles
// @route   PUT /api/auth/profile
// @access  Private (Firebase Bearer token)
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, vehicles, savedLocations, payoutBankDetails } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (vehicles) user.vehicles = vehicles;
    if (savedLocations) user.savedLocations = savedLocations;
    if (payoutBankDetails) user.payoutBankDetails = { ...user.payoutBankDetails, ...payoutBankDetails };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};
