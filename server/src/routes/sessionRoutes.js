import express from 'express';
import {
  startSession,
  updateTelemetry,
  stopSession,
  getSessionById,
  getActiveSession,
  getSessionHistory
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/active', protect, getActiveSession);
router.get('/history', protect, getSessionHistory);
router.post('/start', protect, startSession);
router.get('/:id', protect, getSessionById);
router.post('/:id/readings', protect, updateTelemetry);
router.post('/:id/stop', protect, stopSession);

export default router;
