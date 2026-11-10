import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    authProvider: {
      type: String,
      default: 'firebase'
    },
    avatar: {
      type: String,
      default: ''
    },
    vehicles: [
      {
        make: { type: String, required: true }, // e.g. "Tata", "MG", "Hyundai", "Tesla", "BYD"
        model: { type: String, required: true }, // e.g. "Nexon EV Max", "ZS EV"
        year: { type: Number, default: 2024 },
        batteryCapacityKWh: { type: Number, required: true }, // e.g. 40.5
        connectorType: { 
          type: String, 
          enum: ['Type 2', 'CCS2', 'CHAdeMO', 'Tesla NACS', 'GB/T', '16A 3-Pin'],
          default: 'CCS2' 
        },
        licensePlate: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false }
      }
    ],
    savedLocations: [
      {
        label: { type: String, default: 'Home' },
        address: { type: String, required: true },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [77.5946, 12.9716]
        }
      }
    ],
    isHostVerified: {
      type: Boolean,
      default: false
    },
    payoutBankDetails: {
      accountHolder: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountNumberMasked: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      upiId: { type: String, default: '' }
    },
    termsAccepted: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password before saving if present (legacy / optional)
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
