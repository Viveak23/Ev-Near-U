import Review from '../models/Review.js';
import ChargingSession from '../models/ChargingSession.js';
import Charger from '../models/Charger.js';

// @desc    Submit a review for a completed charging session
// @route   POST /api/reviews
// @access  Private (Seeker)
export const submitReview = async (req, res, next) => {
  try {
    const { sessionId, rating, comment } = req.body;

    if (!sessionId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide sessionId, star rating, and review comment'
      });
    }

    const session = await ChargingSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Charging session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only review charging sessions that you booked.'
      });
    }

    if (session.status !== 'Completed' && session.paymentStatus !== 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'You can only review after the session is completed and paid.'
      });
    }

    // Check for existing review
    const existingReview = await Review.findOne({ session: session._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this session.'
      });
    }

    const review = await Review.create({
      user: req.user._id,
      charger: session.charger,
      session: session._id,
      rating: Number(rating),
      comment
    });

    // Recalculate average rating for the charger
    const allReviews = await Review.find({ charger: session.charger });
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

    await Charger.findByIdAndUpdate(session.charger, {
      rating: Number(avgRating.toFixed(1)),
      reviewCount: allReviews.length
    });

    await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review posted successfully. Thank you for your feedback!',
      review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a specific charger
// @route   GET /api/reviews/charger/:chargerId
// @access  Public
export const getChargerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ charger: req.params.chargerId })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Host response to a review
// @route   PUT /api/reviews/:id/response
// @access  Private (Host)
export const respondToReview = async (req, res, next) => {
  try {
    const { hostResponse } = req.body;
    const review = await Review.findById(req.params.id).populate('charger');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.charger.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only respond to reviews on your chargers.'
      });
    }

    review.hostResponse = hostResponse;
    await review.save();

    res.json({
      success: true,
      message: 'Host reply posted successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};
