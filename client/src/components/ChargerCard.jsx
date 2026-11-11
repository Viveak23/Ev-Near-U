import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Zap,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  BatteryCharging,
  ArrowRight,
  Trash2,
  Sparkles
} from 'lucide-react';

export const ChargerCard = ({ charger, onBookNow, onDelete }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!charger) return null;

  const isOwner = Boolean(
    user && (
      (charger.host?.firebaseUid && user.firebaseUid && charger.host.firebaseUid === user.firebaseUid) ||
      (charger.hostId && user.firebaseUid && charger.hostId === user.firebaseUid) ||
      (charger.host?.email && user.email && charger.host.email.toLowerCase() === user.email.toLowerCase()) ||
      (charger.host?._id && user.firebaseUid && charger.host._id === user.firebaseUid)
    )
  );

  const isDC = charger.chargingMethod === 'DC';
  const hasTimeFee = charger.pricing?.timeFeeEnabled && charger.pricing?.pricePerHour > 0;

  // Estimated charging time calculation for 30 kWh top-up
  const power = Number(charger.powerKW) || 7.4;
  const estimatedHours = (30 / power) * 1.1; // 10% thermal taper factor
  const estMins = Math.round(estimatedHours * 60);
  const formattedEstTime =
    estMins < 60 ? `${estMins} mins` : `${Math.floor(estMins / 60)}h ${estMins % 60}m`;

  const handleDeleteListing = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete your charger "${charger.title}"? This will remove it from all listings.`)) {
      try {
        setIsDeleting(true);
        await api.deleteCharger(charger._id);
        if (onDelete) onDelete(charger._id);
      } catch (err) {
        alert('Failed to delete charger: ' + err.message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`bg-white rounded-2xl border ${isOwner ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-sm' : 'border-slate-200 shadow-xs'} hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group`}>
      
      {/* Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={
            charger.images?.[0] ||
            'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80'
          }
          alt={charger.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          {isOwner && (
            <span className="px-2.5 py-1 rounded-full text-xs font-black text-amber-950 bg-amber-400 shadow-sm backdrop-blur flex items-center gap-1 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
              <span>Your Charger</span>
            </span>
          )}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm backdrop-blur flex items-center gap-1 ${
              isDC ? 'bg-sky-600/90' : 'bg-emerald-600/90'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            {charger.powerKW} kW {charger.chargingMethod}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 bg-white/95 shadow-sm backdrop-blur">
            {charger.connectorType}
          </span>
        </div>

        {/* Host Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{charger.rating?.toFixed(1) || '5.0'}</span>
          <span className="text-[10px] text-slate-400 font-normal">
            ({charger.reviewCount || 0})
          </span>
        </div>

        {/* Distance Badge */}
        {charger.distanceKm !== undefined && (
          <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-900/80 text-white backdrop-blur flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{charger.distanceKm} km away</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Approximate Area */}
          <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
            {charger.title}
          </h3>

          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{charger.approximateArea || `${charger.address?.city}, ${charger.address?.state}`}</span>
          </p>

          {/* Speed & Quick Amenities */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <BatteryCharging className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">~30 kWh in {formattedEstTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">
                {charger.availabilitySchedule?.startHour || '06:00'} - {charger.availabilitySchedule?.endHour || '23:00'}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">
                ₹{charger.pricing?.pricePerKWh}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ kWh</span>
            </div>
            {hasTimeFee ? (
              <p className="text-[10px] text-slate-500">
                + ₹{charger.pricing?.pricePerHour}/hr parking fee
              </p>
            ) : (
              <p className="text-[10px] text-emerald-600 font-medium">No hourly fee</p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {isOwner && (
              <button
                type="button"
                onClick={handleDeleteListing}
                disabled={isDeleting}
                title="Delete this listing"
                className="px-2.5 py-2 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-xl transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}
            <Link
              to={`/charger/${charger._id}`}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Details
            </Link>
            <button
              onClick={() => onBookNow ? onBookNow(charger) : null}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs flex items-center gap-1"
            >
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
