import ChargingSession from '../models/ChargingSession.js';
import Booking from '../models/Booking.js';
import Charger from '../models/Charger.js';
import { calculateBill } from '../utils/billing.js';

const generateSessionId = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'EVS-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Start an authorized charging session
// @route   POST /api/sessions/start
// @access  Private (Seeker or Host)
export const startSession = async (req, res, next) => {
  try {
    const { bookingId, initialSOC = 20, targetSOC = 90, telemetrySource = 'Simulated Telemetry' } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required to start a session' });
    }

    const booking = await Booking.findById(bookingId).populate('charger');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify authorized user: must be the booking seeker or the charger host
    const userId = req.user._id.toString();
    if (booking.user.toString() !== userId && booking.host.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the booked user or host can initiate charging.'
      });
    }

    if (booking.status === 'Cancelled' || booking.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot start session. Booking status is ${booking.status}.`
      });
    }

    // Check if an active session already exists for this booking
    const existingSession = await ChargingSession.findOne({
      booking: booking._id,
      status: 'In Progress'
    });

    if (existingSession) {
      return res.json({
        success: true,
        message: 'Resumed existing active charging session',
        session: existingSession
      });
    }

    const charger = booking.charger;
    const sessionId = generateSessionId();

    const session = await ChargingSession.create({
      sessionId,
      booking: booking._id,
      user: booking.user,
      host: booking.host,
      charger: charger._id,
      status: 'In Progress',
      startTime: new Date(),
      currentPowerKW: charger.powerKW,
      energyConsumedKWh: 0,
      telemetrySource,
      initialSOC: Number(initialSOC) || 20,
      currentSOC: Number(initialSOC) || 20,
      targetSOC: Number(targetSOC) || 90,
      pricingSnapshot: {
        pricePerKWh: charger.pricing.pricePerKWh,
        pricePerHour: charger.pricing.pricePerHour || 0,
        timeFeeEnabled: Boolean(charger.pricing.timeFeeEnabled),
        platformFeePercent: 5,
        taxPercent: 18
      },
      telemetryReadings: [
        {
          timestamp: new Date(),
          powerKW: charger.powerKW,
          energyKWh: 0,
          voltage: charger.chargingMethod === 'DC' ? 400 : 230,
          current: Number(((charger.powerKW * 1000) / (charger.chargingMethod === 'DC' ? 400 : 230)).toFixed(1)),
          soc: Number(initialSOC) || 20
        }
      ]
    });

    booking.status = 'In Progress';
    await booking.save();

    await session.populate('charger');
    await session.populate('host', 'name email phone avatar isHostVerified');
    await session.populate('user', 'name email phone avatar');

    res.status(201).json({
      success: true,
      message: 'Charging session started successfully',
      session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update live telemetry readings for active session
// @route   POST /api/sessions/:id/readings
// @access  Private
export const updateTelemetry = async (req, res, next) => {
  try {
    const { energyConsumedKWh, currentPowerKW, soc, voltage, current, manualEntry } = req.body;

    const session = await ChargingSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status !== 'In Progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot update telemetry. Session is already ${session.status}.`
      });
    }

    const elapsedMinutes = Math.max(1, Math.round((Date.now() - new Date(session.startTime).getTime()) / 60000));
    session.durationMinutes = elapsedMinutes;

    if (energyConsumedKWh !== undefined) {
      session.energyConsumedKWh = Number(Number(energyConsumedKWh).toFixed(2));
    }
    if (currentPowerKW !== undefined) {
      session.currentPowerKW = Number(Number(currentPowerKW).toFixed(2));
    }
    if (soc !== undefined) {
      session.currentSOC = Math.min(100, Math.max(0, Number(soc)));
    }
    if (manualEntry) {
      session.telemetrySource = 'Manual Meter Entry';
    }

    // Append telemetry reading snapshot (keep last 100)
    session.telemetryReadings.push({
      timestamp: new Date(),
      powerKW: session.currentPowerKW,
      energyKWh: session.energyConsumedKWh,
      voltage: voltage || 230,
      current: current || 16,
      soc: session.currentSOC
    });

    if (session.telemetryReadings.length > 100) {
      session.telemetryReadings.shift();
    }

    // Update real-time calculated bill preview
    const previewBill = calculateBill({
      energyConsumedKWh: session.energyConsumedKWh,
      durationMinutes: session.durationMinutes,
      pricePerKWh: session.pricingSnapshot.pricePerKWh,
      pricePerHour: session.pricingSnapshot.pricePerHour,
      timeFeeEnabled: session.pricingSnapshot.timeFeeEnabled,
      platformFeePercent: session.pricingSnapshot.platformFeePercent,
      taxPercent: session.pricingSnapshot.taxPercent
    });

    session.finalBill = previewBill;
    await session.save();

    res.json({
      success: true,
      session,
      runningBill: previewBill
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stop charging session & calculate final bill
// @route   POST /api/sessions/:id/stop
// @access  Private
export const stopSession = async (req, res, next) => {
  try {
    const { finalEnergyKWh, reason } = req.body;

    const session = await ChargingSession.findById(req.params.id)
      .populate('charger')
      .populate('host', 'name email phone avatar isHostVerified')
      .populate('user', 'name email phone avatar');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const userId = req.user._id.toString();
    if (session.user._id.toString() !== userId && session.host._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the session participant or host can stop charging.'
      });
    }

    if (session.status === 'Completed' || session.status === 'Payment Pending') {
      return res.json({
        success: true,
        message: 'Session was already stopped',
        session
      });
    }

    const endTime = new Date();
    const durationMinutes = Math.max(1, Math.round((endTime.getTime() - new Date(session.startTime).getTime()) / 60000));

    // Determine final energy: either passed from manual meter or accumulated telemetry
    let energyKWh = session.energyConsumedKWh;
    if (finalEnergyKWh !== undefined && Number(finalEnergyKWh) > 0) {
      energyKWh = Number(Number(finalEnergyKWh).toFixed(2));
    } else if (energyKWh <= 0) {
      // Calculate realistic estimate if stopped early with zero readings
      const hours = durationMinutes / 60;
      energyKWh = Number((session.charger.powerKW * hours * 0.9).toFixed(2));
    }

    // Calculate final bill according to mandatory formula
    const bill = calculateBill({
      energyConsumedKWh: energyKWh,
      durationMinutes,
      pricePerKWh: session.pricingSnapshot.pricePerKWh,
      pricePerHour: session.pricingSnapshot.pricePerHour,
      timeFeeEnabled: session.pricingSnapshot.timeFeeEnabled,
      platformFeePercent: session.pricingSnapshot.platformFeePercent || 5,
      taxPercent: session.pricingSnapshot.taxPercent || 18
    });

    session.endTime = endTime;
    session.durationMinutes = durationMinutes;
    session.energyConsumedKWh = energyKWh;
    session.currentPowerKW = 0;
    session.status = 'Payment Pending';
    session.finalBill = bill;

    await session.save();

    // Update booking status
    await Booking.findByIdAndUpdate(session.booking, { status: 'In Progress' });

    res.json({
      success: true,
      message: 'Charging stopped. Final bill generated successfully.',
      session,
      finalBill: bill
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session details by ID
// @route   GET /api/sessions/:id
// @access  Private
export const getSessionById = async (req, res, next) => {
  try {
    const session = await ChargingSession.findById(req.params.id)
      .populate('charger')
      .populate('host', 'name email phone avatar isHostVerified')
      .populate('user', 'name email phone avatar');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const userId = req.user._id.toString();
    if (session.user._id.toString() !== userId && session.host._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You do not have access to this session.'
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active session for current user (Seeker or Host)
// @route   GET /api/sessions/active
// @access  Private
export const getActiveSession = async (req, res, next) => {
  try {
    const session = await ChargingSession.findOne({
      $or: [{ user: req.user._id }, { host: req.user._id }],
      status: { $in: ['In Progress', 'Payment Pending'] }
    })
      .populate('charger')
      .populate('host', 'name email phone avatar isHostVerified')
      .populate('user', 'name email phone avatar')
      .sort('-createdAt');

    res.json({
      success: true,
      session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session history
// @route   GET /api/sessions/history
// @access  Private
export const getSessionHistory = async (req, res, next) => {
  try {
    const { role } = req.query; // 'seeker' or 'host' or both
    let query = {};

    if (role === 'host') {
      query.host = req.user._id;
    } else if (role === 'seeker') {
      query.user = req.user._id;
    } else {
      query.$or = [{ user: req.user._id }, { host: req.user._id }];
    }

    const sessions = await ChargingSession.find(query)
      .populate('charger')
      .populate('host', 'name email avatar')
      .populate('user', 'name email avatar')
      .populate('paymentId')
      .sort('-createdAt');

    res.json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    next(error);
  }
};
