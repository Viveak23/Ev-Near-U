import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    payoutId: {
      type: String,
      unique: true,
      required: true
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentsIncluded: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
      }
    ],
    status: {
      type: String,
      enum: ['Requested', 'Processing', 'Completed', 'Failed'],
      default: 'Requested'
    },
    method: {
      type: String,
      enum: ['Bank Transfer (NEFT/RTGS)', 'UPI Direct'],
      default: 'Bank Transfer (NEFT/RTGS)'
    },
    destinationDetails: {
      bankName: String,
      accountMasked: String,
      upiId: String
    },
    referenceNumber: {
      type: String,
      default: ''
    },
    completedAt: Date
  },
  {
    timestamps: true
  }
);

payoutSchema.index({ host: 1, createdAt: -1 });

const Payout = mongoose.model('Payout', payoutSchema);
export default Payout;
