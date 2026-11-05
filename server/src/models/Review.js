import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    charger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Charger',
      required: true
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingSession',
      required: true,
      unique: true // One review per completed charging session
    },
    rating: {
      type: Number,
      required: [true, 'Star rating is required'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please provide feedback in your review'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    hostResponse: {
      type: String,
      default: ''
    },
    isReported: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ charger: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
