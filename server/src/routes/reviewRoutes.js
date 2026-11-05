import express from 'express';
import {
  submitReview,
  getChargerReviews,
  respondToReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, submitReview);
router.get('/charger/:chargerId', getChargerReviews);
router.put('/:id/response', protect, respondToReview);

export default router;
