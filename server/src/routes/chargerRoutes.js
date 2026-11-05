import express from 'express';
import {
  createCharger,
  getNearbyChargers,
  getChargerById,
  getMyChargers,
  updateCharger,
  deleteCharger
} from '../controllers/chargerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/nearby', getNearbyChargers);
router.get('/my-listings', protect, getMyChargers);
router.post('/', protect, createCharger);
router.get('/:id', getChargerById);
router.put('/:id', protect, updateCharger);
router.delete('/:id', protect, deleteCharger);

export default router;
