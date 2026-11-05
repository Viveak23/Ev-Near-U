import mongoose from 'mongoose';

const chargerSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Charger title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    chargerType: {
      type: String,
      required: [true, 'Charger type is required'],
      enum: ['Level 1 AC (Slow)', 'Level 2 AC (Fast)', 'DC Fast Charger', 'Ultra-Fast DC'],
      default: 'Level 2 AC (Fast)'
    },
    connectorType: {
      type: String,
      required: [true, 'Connector type is required'],
      enum: ['Type 2', 'CCS2', 'CHAdeMO', 'Tesla NACS', 'GB/T', '16A 3-Pin'],
      default: 'CCS2'
    },
    chargingMethod: {
      type: String,
      enum: ['AC', 'DC'],
      default: 'AC'
    },
    powerKW: {
      type: Number,
      required: [true, 'Power output in kW is required'],
      min: [1.5, 'Minimum power is 1.5 kW'],
      max: [350, 'Maximum power is 350 kW']
    },
    supportedVehicles: {
      type: [String],
      default: ['All CCS2 & Type 2 compatible EVs']
    },
    // Exact location for authorized confirmed bookings
    address: {
      street: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },
    // Public approximate area description for search before booking confirmation
    approximateArea: {
      type: String,
      default: ''
    },
    // GeoJSON point for geospatial distance queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80'
      ]
    },
    pricing: {
      pricePerKWh: {
        type: Number,
        required: [true, 'Price per kWh is required'],
        min: [0, 'Price per kWh cannot be negative']
      },
      pricePerHour: {
        type: Number,
        default: 0,
        min: [0, 'Price per hour cannot be negative']
      },
      timeFeeEnabled: {
        type: Boolean,
        default: false
      },
      currency: {
        type: String,
        default: 'INR'
      }
    },
    availabilitySchedule: {
      days: {
        type: [String],
        default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      startHour: {
        type: String,
        default: '06:00'
      },
      endHour: {
        type: String,
        default: '23:00'
      },
      maxDurationHours: {
        type: Number,
        default: 6,
        min: 1,
        max: 24
      }
    },
    bookingRules: {
      type: String,
      default: 'Please park only in the designated EV bay. Unplug and move vehicle within 15 minutes of completion.'
    },
    accessType: {
      type: String,
      enum: ['Public', 'Restricted (Approval Required)'],
      default: 'Public'
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Under Maintenance'],
      default: 'Active'
    },
    amenities: {
      type: [String],
      default: ['Covered Parking', 'CCTV Security', 'Restroom', 'Wi-Fi']
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index for geospatial searching
chargerSchema.index({ location: '2dsphere' });
chargerSchema.index({ status: 1, 'pricing.pricePerKWh': 1, powerKW: 1 });

const Charger = mongoose.model('Charger', chargerSchema);
export default Charger;
