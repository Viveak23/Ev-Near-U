import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
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
    charger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Charger',
      required: true
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    durationHours: {
      type: Number,
      required: true,
      min: 0.5
    },
    estimatedKWh: {
      type: Number,
      default: 0
    },
    estimatedCost: {
      energyCharge: { type: Number, default: 0 },
      timeCharge: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      platformFee: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 },
      totalEstimated: { type: Number, required: true },
      currency: { type: String, default: 'INR' }
    },
    vehicle: {
      make: { type: String, default: '' },
      model: { type: String, default: '' },
      licensePlate: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Failed'],
      default: 'Confirmed'
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ charger: 1, startTime: 1, endTime: 1, status: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ host: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
