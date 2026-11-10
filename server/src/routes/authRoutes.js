import express from 'express';
import {
  registerUser,
  loginUser,
  syncFirebaseUser,
  getMe,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/sync', protect, syncFirebaseUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
