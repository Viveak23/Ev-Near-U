import React, { useState } from 'react';
import { api } from '../services/api';
import { Star, X, CheckCircle2, AlertCircle } from 'lucide-react';

export const ReviewModal = ({ session, isOpen, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback about your charging experience.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await api.submitReview({
        sessionId: session._id,
        rating,
        comment: comment.trim()
      });

      if (res.success && res.review) {
        setSuccess(true);
        if (onReviewSubmitted) onReviewSubmitted(res.review);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!success ? (
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Rate Your Charging Session
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Charger: <span className="font-semibold text-slate-700">{session.charger?.title}</span> • Host: <span className="font-semibold text-slate-700">{session.host?.name}</span>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                  Overall Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs font-semibold text-slate-600 mt-1.5">
                  {rating === 5 && 'Outstanding! Flawless speed & host assistance'}
                  {rating === 4 && 'Great charging experience!'}
                  {rating === 3 && 'Average experience'}
                  {rating === 2 && 'Below expectations'}
                  {rating === 1 && 'Poor experience'}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Review
                </label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about charger speed, parking ease, host communication, and amenities..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                {loading ? 'Submitting Review...' : 'Submit Verified Review'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Thank You!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your verified review helps EV drivers in our community discover trustworthy chargers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
