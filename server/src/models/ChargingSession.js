import mongoose from 'mongoose';

const chargingSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      unique: true,
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
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
    status: {
      type: String,
      enum: ['In Progress', 'Stopped', 'Payment Pending', 'Completed'],
      default: 'In Progress'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    durationMinutes: {
      type: Number,
      default: 0
    },
    currentPowerKW: {
      type: Number,
      default: 0
    },
    energyConsumedKWh: {
      type: Number,
      default: 0
    },
    telemetrySource: {
      type: String,
      enum: ['Simulated Telemetry', 'Manual Meter Entry', 'IoT Smart Meter'],
      default: 'Simulated Telemetry'
    },
    initialSOC: {
      type: Number,
      default: 20
    },
    currentSOC: {
      type: Number,
      default: 20
    },
    targetSOC: {
      type: Number,
      default: 90
    },
    telemetryReadings: [
      {
        timestamp: { type: Date, default: Date.now },
        powerKW: Number,
        energyKWh: Number,
        voltage: Number,
        current: Number,
        soc: Number
      }
    ],
    pricingSnapshot: {
      pricePerKWh: { type: Number, required: true },
      pricePerHour: { type: Number, default: 0 },
      timeFeeEnabled: { type: Boolean, default: false },
      platformFeePercent: { type: Number, default: 5 },
      taxPercent: { type: Number, default: 18 }
    },
    finalBill: {
      energyCharge: { type: Number, default: 0 },
      timeCharge: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      platformFee: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 },
      discounts: { type: Number, default: 0 },
      finalAmount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' }
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  },
  {
    timestamps: true
  }
);

chargingSessionSchema.index({ user: 1, status: 1 });
chargingSessionSchema.index({ host: 1, status: 1 });
chargingSessionSchema.index({ charger: 1, status: 1 });

const ChargingSession = mongoose.model('ChargingSession', chargingSessionSchema);
export default ChargingSession;
