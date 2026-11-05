import Charger from '../models/Charger.js';
import Booking from '../models/Booking.js';
import ChargingSession from '../models/ChargingSession.js';
import Payment from '../models/Payment.js';

// @desc    Get dashboard metrics for current user (both host & seeker roles)
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Host metrics
    const hostedChargersCount = await Charger.countDocuments({ host: userId });
    const activeListingsCount = await Charger.countDocuments({ host: userId, status: 'Active' });

    const hostSuccessfulPayments = await Payment.find({ host: userId, status: 'Success' });
    const hostGrossEarnings = hostSuccessfulPayments.reduce((acc, p) => acc + (p.hostEarnings.grossAmount || 0), 0);
    const hostNetEarnings = hostSuccessfulPayments.reduce((acc, p) => acc + (p.hostEarnings.netHostPayout || 0), 0);

    // Seeker metrics
    const upcomingBookingsCount = await Booking.countDocuments({
      user: userId,
      status: { $in: ['Confirmed', 'Pending'] },
      startTime: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
    });

    const activeSessionsCount = await ChargingSession.countDocuments({
      $or: [{ user: userId }, { host: userId }],
      status: 'In Progress'
    });

    const completedSessionsCount = await ChargingSession.countDocuments({
      user: userId,
      status: 'Completed'
    });

    const seekerPayments = await Payment.find({ user: userId, status: 'Success' });
    const totalSpent = seekerPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Energy stats
    const seekerSessions = await ChargingSession.find({ user: userId, status: 'Completed' });
    const totalEnergyChargedKWh = seekerSessions.reduce((acc, s) => acc + (s.energyConsumedKWh || 0), 0);

    // Upcoming bookings list
    const upcomingBookings = await Booking.find({
      $or: [{ user: userId }, { host: userId }],
      status: { $in: ['Confirmed', 'In Progress'] }
    })
      .populate('charger')
      .populate('host', 'name avatar phone')
      .populate('user', 'name avatar phone')
      .sort('startTime')
      .limit(5);

    // Active session if any
    const activeSession = await ChargingSession.findOne({
      $or: [{ user: userId }, { host: userId }],
      status: 'In Progress'
    })
      .populate('charger')
      .populate('host', 'name avatar phone')
      .populate('user', 'name avatar phone');

    res.json({
      success: true,
      stats: {
        host: {
          totalListings: hostedChargersCount,
          activeListings: activeListingsCount,
          grossRevenue: Number(hostGrossEarnings.toFixed(2)),
          netEarnings: Number(hostNetEarnings.toFixed(2)),
          currency: 'INR'
        },
        seeker: {
          upcomingBookingsCount,
          activeSessionsCount,
          completedSessionsCount,
          totalSpent: Number(totalSpent.toFixed(2)),
          totalEnergyChargedKWh: Number(totalEnergyChargedKWh.toFixed(2)),
          currency: 'INR'
        },
        upcomingBookings,
        activeSession
      }
    });
  } catch (error) {
    next(error);
  }
};
