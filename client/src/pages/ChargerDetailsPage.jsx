import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookingModal } from '../components/BookingModal';
import {
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Share2,
  Bookmark,
  Car,
  DollarSign,
  Info,
  ArrowLeft,
  Trash2,
  Sparkles
} from 'lucide-react';

export const ChargerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [charger, setCharger] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAddressRevealed, setIsAddressRevealed] = useState(false);

  const isOwner = Boolean(
    user && charger && (
      (charger.host?.firebaseUid && user.firebaseUid && charger.host.firebaseUid === user.firebaseUid) ||
      (charger.hostId && user.firebaseUid && charger.hostId === user.firebaseUid) ||
      (charger.host?.email && user.email && charger.host.email.toLowerCase() === user.email.toLowerCase()) ||
      (charger.host?._id && user.firebaseUid && charger.host._id === user.firebaseUid)
    )
  );

  const handleDeleteCharger = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete your listing "${charger.title}"?`)) {
      return;
    }
    try {
      setLoading(true);
      await api.deleteCharger(charger._id);
      navigate('/dashboard?tab=chargers');
    } catch (err) {
      alert('Failed to delete charger: ' + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [chargerRes, reviewsRes] = await Promise.all([
          api.getChargerById(id),
          api.getChargerReviews(id)
        ]);

        if (chargerRes.success && chargerRes.charger) {
          setCharger(chargerRes.charger);
          setIsAddressRevealed(chargerRes.isAddressRevealed);
        } else {
          setError('Charger not found');
        }

        if (reviewsRes.success) {
          setReviews(reviewsRes.reviews || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load charger details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Loading charger details...</p>
      </div>
    );
  }

  if (error || !charger) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{error || 'Charger Not Found'}</h2>
        <Link
          to="/find-chargers"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Charger Search</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link
          to="/find-chargers"
          className="flex items-center gap-1 hover:text-emerald-700 font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: charger.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Share listing"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Details on Left + Sticky Booking Box on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Host Ownership Banner */}
          {isOwner && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 fill-amber-500 text-amber-600 shrink-0" />
                <span>You are the Host of this Charger listing</span>
              </div>
              <button
                type="button"
                onClick={handleDeleteCharger}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete My Listing</span>
              </button>
            </div>
          )}

          {/* Photos Gallery */}
          <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200">
            <img
              src={charger.images?.[0] || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80'}
              alt={charger.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 bg-slate-900/80 text-white backdrop-blur text-xs font-bold rounded-full flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                <span>{charger.powerKW} kW {charger.chargingMethod}</span>
              </span>
              <span className="px-3 py-1 bg-white/90 text-slate-900 backdrop-blur text-xs font-bold rounded-full">
                {charger.connectorType}
              </span>
            </div>
          </div>

          {/* Title & Host info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {charger.chargerType}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{charger.rating?.toFixed(1) || '5.0'}</span>
                <span className="text-slate-400 font-normal">({charger.reviewCount || 0} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {charger.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                {isAddressRevealed
                  ? `${charger.address?.street}, ${charger.address?.landmark ? charger.address.landmark + ', ' : ''}${charger.address?.city}, ${charger.address?.state} - ${charger.address?.postalCode}`
                  : charger.approximateArea || `${charger.address?.city}, ${charger.address?.state}`}
              </span>
            </p>
          </div>

          {/* Host Profile Card */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={charger.host?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(charger.host?.name || 'Host')}&background=059669&color=fff`}
                alt={charger.host?.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Station Host</p>
                <p className="font-extrabold text-sm text-slate-900">{charger.host?.name || 'Verified Host'}</p>
                <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ID & Location Verified Host</span>
                </p>
              </div>
            </div>

            {isAddressRevealed && charger.host?.phone && (
              <a
                href={`tel:${charger.host.phone}`}
                className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Call Host
              </a>
            )}
          </div>

          {/* Description */}
          {charger.description && (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">About this Charger</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {charger.description}
              </p>
            </div>
          )}

          {/* Specifications Checklist */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">Technical Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-slate-400">Power Rating</p>
                <p className="font-bold text-slate-900">{charger.powerKW} kW</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-slate-400">Charging Method</p>
                <p className="font-bold text-slate-900">{charger.chargingMethod} Current</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-slate-400">Connector Plug</p>
                <p className="font-bold text-slate-900">{charger.connectorType}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-slate-400">Available Operating Hours</p>
                <p className="font-bold text-slate-900">
                  {charger.availabilitySchedule?.startHour || '06:00'} - {charger.availabilitySchedule?.endHour || '23:00'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-slate-400">Max Session Duration</p>
                <p className="font-bold text-slate-900">{charger.availabilitySchedule?.maxDurationHours || 6} Hours</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-slate-400">Access Policy</p>
                <p className="font-bold text-slate-900">{charger.accessType || 'Public'}</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {charger.amenities && charger.amenities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">Bay Amenities & Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {charger.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Booking Rules */}
          {charger.bookingRules && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Host Guidelines & Bay Instructions</span>
              </p>
              <p className="text-slate-700 leading-relaxed">{charger.bookingRules}</p>
            </div>
          )}

          {/* User Reviews */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Verified Driver Reviews ({reviews.length})
              </h3>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{charger.rating?.toFixed(1) || '5.0'} / 5.0</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 italic">
                No reviews yet. Be the first to book and leave verified feedback!
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.name || 'Driver')}&background=059669&color=fff`}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-800">{rev.user?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
                    {rev.hostResponse && (
                      <div className="mt-2 pl-3 border-l-2 border-emerald-500 text-emerald-800 text-[11px]">
                        <span className="font-bold">Host reply:</span> {rev.hostResponse}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sticky Booking Widget (4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-5">
            
            {/* Pricing Header */}
            <div className="pb-4 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase">Energy Rate</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-slate-900">
                  ₹{charger.pricing?.pricePerKWh}
                </span>
                <span className="text-sm font-medium text-slate-500">/ kWh</span>
              </div>
              {charger.pricing?.timeFeeEnabled && (
                <p className="text-xs text-slate-500 mt-1">
                  + ₹{charger.pricing?.pricePerHour}/hr optional bay parking fee
                </p>
              )}
            </div>

            {/* Quick Estimate for 30 kWh */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800">Typical ~30 kWh Top-Up</div>
              <div className="flex justify-between text-slate-600">
                <span>Energy Cost (30 × ₹{charger.pricing?.pricePerKWh})</span>
                <span>₹{(30 * charger.pricing?.pricePerKWh).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Fee + GST</span>
                <span>₹{(30 * charger.pricing?.pricePerKWh * 0.239).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900">
                <span>Estimated Total</span>
                <span className="text-emerald-700">₹{(30 * charger.pricing?.pricePerKWh * 1.239).toFixed(2)}</span>
              </div>
            </div>

            {/* Primary Action Button */}
            {isOwner ? (
              <Link
                to={`/post-charger?edit=${charger._id}`}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <span>Edit Your Charger Listing</span>
              </Link>
            ) : (
              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Reserve Charging Slot Now</span>
              </button>
            )}

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <p>🔒 Secure reservation • Free cancellation up to 1hr prior</p>
              <p>Exact address & gate instructions unlocked on booking</p>
            </div>

          </div>
        </div>

      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <BookingModal
          charger={charger}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}

    </div>
  );
};
