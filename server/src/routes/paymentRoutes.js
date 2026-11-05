import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getInvoice,
  getPaymentHistory,
  getHostEarnings,
  requestPayout
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.get('/invoice/:id', protect, getInvoice);
router.get('/history', protect, getPaymentHistory);
router.get('/host-earnings', protect, getHostEarnings);
router.post('/request-payout', protect, requestPayout);

export default router;
