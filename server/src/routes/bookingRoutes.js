import express from 'express';
import {
  createBooking,
  checkAvailability,
  getMyBookings,
  getHostBookings,
  getBookingById,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/check-availability', checkAvailability);
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/host-bookings', protect, getHostBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

export default router;
