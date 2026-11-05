import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      required: true
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingSession',
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'UPI', 'Credit/Debit Card', 'Net Banking', 'Test Gateway Simulation'],
      default: 'Razorpay'
    },
    gatewayOrderId: {
      type: String,
      default: ''
    },
    gatewayPaymentId: {
      type: String,
      default: ''
    },
    gatewaySignature: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    errorMessage: {
      type: String,
      default: ''
    },
    hostEarnings: {
      grossAmount: { type: Number, required: true },
      platformCommissionRate: { type: Number, default: 10 },
      platformCommissionAmount: { type: Number, required: true },
      netHostPayout: { type: Number, required: true },
      payoutStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Transferred', 'Failed'],
        default: 'Pending'
      },
      payoutRef: { type: String, default: '' },
      payoutDate: { type: Date }
    },
    billSnapshot: {
      energyCharge: Number,
      timeCharge: Number,
      subtotal: Number,
      platformFee: Number,
      taxes: Number,
      discounts: Number,
      finalAmount: Number
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ host: 1, status: 1 });
paymentSchema.index({ session: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
