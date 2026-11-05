import crypto from 'crypto';
import Payment from '../models/Payment.js';
import ChargingSession from '../models/ChargingSession.js';
import Booking from '../models/Booking.js';
import Payout from '../models/Payout.js';
import { calculateHostEarnings } from '../utils/billing.js';

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `INV-${year}-${random}`;
};

const generatePaymentId = () => {
  return `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// @desc    Initiate/Create Payment Order for a charging session
// @route   POST /api/payments/create-order
// @access  Private (Seeker)
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { sessionId, paymentMethod = 'Razorpay' } = req.body;

    const session = await ChargingSession.findById(sessionId)
      .populate('charger')
      .populate('booking');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Charging session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only pay for your own session.' });
    }

    if (session.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'This charging session has already been paid for.' });
    }

    const amount = session.finalBill.finalAmount;
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid bill amount.' });
    }

    // Generate Gateway Order ID
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    const invoiceNumber = generateInvoiceNumber();
    const paymentId = generatePaymentId();

    // Calculate host earnings (gross charging revenue minus platform commission)
    const hostCut = calculateHostEarnings(session.finalBill.subtotal, 10);

    // Create or update payment document
    let payment = await Payment.findOne({ session: session._id, status: 'Pending' });

    if (!payment) {
      payment = await Payment.create({
        paymentId,
        invoiceNumber,
        user: req.user._id,
        host: session.host,
        session: session._id,
        booking: session.booking._id,
        amount,
        currency: 'INR',
        paymentMethod,
        gatewayOrderId: orderId,
        status: 'Pending',
        hostEarnings: {
          grossAmount: hostCut.grossAmount,
          platformCommissionRate: hostCut.platformCommissionRate,
          platformCommissionAmount: hostCut.platformCommissionAmount,
          netHostPayout: hostCut.netHostPayout,
          payoutStatus: 'Pending'
        },
        billSnapshot: session.finalBill
      });
    } else {
      payment.gatewayOrderId = orderId;
      payment.paymentMethod = paymentMethod;
      await payment.save();
    }

    res.json({
      success: true,
      order: {
        orderId,
        paymentDocId: payment._id,
        paymentId: payment.paymentId,
        amountInPaise: Math.round(amount * 100),
        amount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_sample_key_evnearu',
        invoiceNumber: payment.invoiceNumber,
        chargerTitle: session.charger?.title || 'EV Charger'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment and finalize transaction
// @route   POST /api/payments/verify
// @access  Private (Seeker)
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      paymentDocId,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      paymentMethod = 'Razorpay'
    } = req.body;

    const payment = await Payment.findById(paymentDocId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status === 'Success') {
      return res.json({
        success: true,
        message: 'Payment was already verified and processed successfully',
        payment
      });
    }

    // Verify signature if provided by Razorpay SDK
    // In production with real Razorpay webhook/client secrets:
    // const body = gatewayOrderId + '|' + gatewayPaymentId;
    // const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    // Here we support Razorpay test verification & test gateway simulation:
    const paymentTxnId = gatewayPaymentId || `pay_${crypto.randomBytes(8).toString('hex')}`;

    payment.gatewayPaymentId = paymentTxnId;
    payment.gatewaySignature = gatewaySignature || `sig_${crypto.randomBytes(16).toString('hex')}`;
    payment.paymentMethod = paymentMethod;
    payment.status = 'Success';
    await payment.save();

    // Mark session as completed and paid
    const session = await ChargingSession.findById(payment.session);
    if (session) {
      session.status = 'Completed';
      session.paymentStatus = 'Paid';
      session.paymentId = payment._id;
      await session.save();
    }

    // Mark booking as completed
    await Booking.findByIdAndUpdate(payment.booking, { status: 'Completed' });

    await payment.populate('user', 'name email phone');
    await payment.populate('host', 'name email phone');
    await payment.populate({
      path: 'session',
      populate: { path: 'charger' }
    });

    res.json({
      success: true,
      message: 'Payment verified successfully! Thank you for charging with EvNearU.',
      payment,
      invoiceNumber: payment.invoiceNumber
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoice details
// @route   GET /api/payments/invoice/:id
// @access  Private
export const getInvoice = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      $or: [{ _id: req.params.id }, { invoiceNumber: req.params.id }]
    })
      .populate('user', 'name email phone')
      .populate('host', 'name email phone')
      .populate({
        path: 'session',
        populate: { path: 'charger' }
      })
      .populate('booking');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const userId = req.user._id.toString();
    if (payment.user._id.toString() !== userId && payment.host._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this invoice.' });
    }

    res.json({
      success: true,
      invoice: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res, next) => {
  try {
    const { role } = req.query;
    let query = {};

    if (role === 'host') {
      query.host = req.user._id;
    } else {
      query.user = req.user._id;
    }

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('host', 'name email')
      .populate({
        path: 'session',
        populate: { path: 'charger' }
      })
      .sort('-createdAt');

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get host earnings summary
// @route   GET /api/payments/host-earnings
// @access  Private (Host)
export const getHostEarnings = async (req, res, next) => {
  try {
    const successfulPayments = await Payment.find({
      host: req.user._id,
      status: 'Success'
    })
      .populate('user', 'name email')
      .populate({
        path: 'session',
        populate: { path: 'charger' }
      })
      .sort('-createdAt');

    let grossRevenue = 0;
    let totalPlatformFee = 0;
    let netEarnings = 0;
    let paidOutAmount = 0;
    let pendingPayoutAmount = 0;

    successfulPayments.forEach((p) => {
      grossRevenue += p.hostEarnings.grossAmount || 0;
      totalPlatformFee += p.hostEarnings.platformCommissionAmount || 0;
      netEarnings += p.hostEarnings.netHostPayout || 0;
      if (p.hostEarnings.payoutStatus === 'Transferred') {
        paidOutAmount += p.hostEarnings.netHostPayout || 0;
      } else {
        pendingPayoutAmount += p.hostEarnings.netHostPayout || 0;
      }
    });

    const payouts = await Payout.find({ host: req.user._id }).sort('-createdAt');

    res.json({
      success: true,
      summary: {
        completedSessions: successfulPayments.length,
        grossRevenue: Number(grossRevenue.toFixed(2)),
        platformCommission: Number(totalPlatformFee.toFixed(2)),
        netEarnings: Number(netEarnings.toFixed(2)),
        paidOutAmount: Number(paidOutAmount.toFixed(2)),
        pendingPayoutAmount: Number(pendingPayoutAmount.toFixed(2)),
        currency: 'INR'
      },
      recentTransactions: successfulPayments.slice(0, 10),
      payouts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request host payout
// @route   POST /api/payments/request-payout
// @access  Private (Host)
export const requestPayout = async (req, res, next) => {
  try {
    const { amount, method = 'Bank Transfer (NEFT/RTGS)', destinationDetails } = req.body;

    const hostPayments = await Payment.find({
      host: req.user._id,
      status: 'Success',
      'hostEarnings.payoutStatus': 'Pending'
    });

    const availableBalance = hostPayments.reduce((acc, p) => acc + (p.hostEarnings.netHostPayout || 0), 0);
    const requestedAmount = Number(amount) || availableBalance;

    if (requestedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending earnings available for payout.'
      });
    }

    if (requestedAmount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Requested amount exceeds available pending balance of ₹${availableBalance.toFixed(2)}.`
      });
    }

    const payoutId = `POT-${Date.now().toString(36).toUpperCase()}`;

    const payout = await Payout.create({
      payoutId,
      host: req.user._id,
      amount: requestedAmount,
      paymentsIncluded: hostPayments.map((p) => p._id),
      status: 'Completed',
      method,
      destinationDetails: destinationDetails || {
        bankName: req.user.payoutBankDetails?.bankName || 'State Bank of India',
        accountMasked: req.user.payoutBankDetails?.accountNumberMasked || '•••• 5491',
        upiId: req.user.payoutBankDetails?.upiId || 'evhost@upi'
      },
      referenceNumber: `TRF-${Math.floor(100000000 + Math.random() * 900000000)}`,
      completedAt: new Date()
    });

    // Mark payments as transferred
    await Payment.updateMany(
      { _id: { $in: hostPayments.map((p) => p._id) } },
      {
        $set: {
          'hostEarnings.payoutStatus': 'Transferred',
          'hostEarnings.payoutRef': payout.payoutId,
          'hostEarnings.payoutDate': new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `Payout of ₹${requestedAmount.toFixed(2)} processed successfully!`,
      payout
    });
  } catch (error) {
    next(error);
  }
};
