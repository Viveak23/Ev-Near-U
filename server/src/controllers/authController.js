import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id, rememberMe = false) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_ev_near_u_jwt_key_2026_secure',
    {
      expiresIn: rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '7d')
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword, termsAccepted } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (termsAccepted === false) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the terms and conditions'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: userExists.email === email.toLowerCase()
          ? 'An account with this email address already exists'
          : 'An account with this mobile number already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      termsAccepted: true,
      vehicles: [
        {
          make: 'Tata',
          model: 'Nexon EV',
          year: 2024,
          batteryCapacityKWh: 40.5,
          connectorType: 'CCS2',
          licensePlate: 'KA 01 EV 1234',
          isPrimary: true
        }
      ]
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        vehicles: user.vehicles,
        savedLocations: user.savedLocations,
        isHostVerified: user.isHostVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number and password'
      });
    }

    // Find user by email or phone
    const cleanId = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: cleanId }, { phone: identifier.trim() }]
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/phone and password.'
      });
    }

    const token = generateToken(user._id, rememberMe);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        vehicles: user.vehicles,
        savedLocations: user.savedLocations,
        isHostVerified: user.isHostVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & vehicles
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, vehicles, savedLocations, payoutBankDetails } = req.body;

    const user = await User.findById(req.user._id);
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
