import Booking from '../models/Booking.js';
import Charger from '../models/Charger.js';
import { calculateBill } from '../utils/billing.js';

const generateBookingId = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'EVB-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Create a new booking for a charger
// @route   POST /api/bookings
// @access  Private (Seeker)
export const createBooking = async (req, res, next) => {
  try {
    const { chargerId, startTime, durationHours, estimatedKWh, vehicle, notes } = req.body;

    if (!chargerId || !startTime || !durationHours) {
      return res.status(400).json({
        success: false,
        message: 'Please provide chargerId, start time, and duration'
      });
    }

    const charger = await Charger.findById(chargerId);
    if (!charger) {
      return res.status(404).json({ success: false, message: 'Charger not found' });
    }

    if (charger.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Charger is currently ${charger.status} and cannot be booked.`
      });
    }

    // Security rule: Prevent users from booking their own chargers
    if (charger.host.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own charger.'
      });
    }

    const start = new Date(startTime);
    const durationNum = parseFloat(durationHours);
    const end = new Date(start.getTime() + durationNum * 60 * 60 * 1000);

    // Validate that startTime is not in the past (allowing 5 min buffer)
    if (start.getTime() < Date.now() - 5 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: 'Booking start time cannot be in the past'
      });
    }

    // Availability validation: Check for overlapping bookings
    const overlapping = await Booking.findOne({
      charger: chargerId,
      status: { $in: ['Pending', 'Confirmed', 'In Progress'] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: 'This charger is already booked for the selected time window. Please choose another slot.'
      });
    }

    // Calculate estimated energy if not explicitly supplied
    // E.g. expected charging power * duration * 0.85 efficiency factor
    let calculatedKWh = Number(estimatedKWh) || 0;
    if (calculatedKWh <= 0) {
      calculatedKWh = Number((charger.powerKW * durationNum * 0.85).toFixed(2));
    }

    // Compute estimated bill
    const bill = calculateBill({
      energyConsumedKWh: calculatedKWh,
      durationMinutes: durationNum * 60,
      pricePerKWh: charger.pricing.pricePerKWh,
      pricePerHour: charger.pricing.pricePerHour,
      timeFeeEnabled: charger.pricing.timeFeeEnabled
    });

    const bookingId = generateBookingId();

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      host: charger.host,
      charger: charger._id,
      startTime: start,
      endTime: end,
      durationHours: durationNum,
      estimatedKWh: calculatedKWh,
      estimatedCost: {
        energyCharge: bill.energyCharge,
        timeCharge: bill.timeCharge,
        subtotal: bill.subtotal,
        platformFee: bill.platformFee,
        taxes: bill.taxes,
        totalEstimated: bill.finalAmount,
        currency: 'INR'
      },
      vehicle: vehicle || {
        make: req.user.vehicles?.[0]?.make || 'EV',
        model: req.user.vehicles?.[0]?.model || 'Electric Car',
        licensePlate: req.user.vehicles?.[0]?.licensePlate || ''
      },
      status: 'Confirmed',
      notes: notes || ''
    });

    // Populate charger and host details
    await booking.populate('charger');
    await booking.populate('host', 'name email phone avatar isHostVerified');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check charger availability for a specific date
// @route   GET /api/bookings/check-availability
// @access  Public
export const checkAvailability = async (req, res, next) => {
  try {
    const { chargerId, date } = req.query;

    if (!chargerId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide chargerId and date'
      });
    }

    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const bookedSlots = await Booking.find({
      charger: chargerId,
      status: { $in: ['Pending', 'Confirmed', 'In Progress'] },
      startTime: { $lt: endOfDay },
      endTime: { $gt: startOfDay }
    }).select('startTime endTime status bookingId');

    res.json({
      success: true,
      chargerId,
      date,
      bookedSlots
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings (as Seeker)
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('charger')
      .populate('host', 'name email phone avatar isHostVerified')
      .sort('-startTime');

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get host charger bookings (as Host)
// @route   GET /api/bookings/host-bookings
// @access  Private (Host)
export const getHostBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { host: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('charger')
      .populate('user', 'name email phone avatar vehicles')
      .sort('-startTime');

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('charger')
      .populate('host', 'name email phone avatar isHostVerified')
      .populate('user', 'name email phone avatar vehicles');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify authorized user
    const userId = req.user._id.toString();
    const isOwner = booking.user._id.toString() === userId;
    const isHost = booking.host._id.toString() === userId;

    if (!isOwner && !isHost) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You do not have access to this booking.'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const userId = req.user._id.toString();
    if (booking.user.toString() !== userId && booking.host.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking.'
      });
    }

    if (booking.status === 'Completed' || booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}.`
      });
    }

    booking.status = 'Cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    booking.cancelledBy = req.user._id;

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};
