import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  Zap,
  Calendar,
  Clock,
  Car,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const BookingModal = ({ charger, isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Booking states
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [startTimeStr, setStartTimeStr] = useState('10:00');
  const [durationHours, setDurationHours] = useState(2);
  const [estimatedKWh, setEstimatedKWh] = useState(25);
  const [selectedVehicle, setSelectedVehicle] = useState(
    user?.vehicles?.[0] || { make: '', model: '', licensePlate: '' }
  );
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  if (!isOpen || !charger) return null;

  // Calculate live price estimate
  const power = Number(charger.powerKW) || 7.4;
  const priceKWh = Number(charger.pricing?.pricePerKWh) || 15;
  const priceHour = Number(charger.pricing?.pricePerHour) || 0;
  const timeFeeEnabled = Boolean(charger.pricing?.timeFeeEnabled);

  // Suggested kWh based on duration and power
  const calculatedEnergyKWh = Number((power * durationHours * 0.85).toFixed(1));
  const activeKWh = estimatedKWh || calculatedEnergyKWh;

  const energyCharge = Number((activeKWh * priceKWh).toFixed(2));
  const timeCharge = timeFeeEnabled ? Number((durationHours * priceHour).toFixed(2)) : 0;
  const subtotal = Number((energyCharge + timeCharge).toFixed(2));
  const platformFee = Number(((subtotal * 0.05)).toFixed(2));
  const taxes = Number((((subtotal + platformFee) * 0.18)).toFixed(2));
  const totalEstimated = Number((subtotal + platformFee + taxes).toFixed(2));

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=find-chargers');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [hours, minutes] = startTimeStr.split(':');
      const startDateTime = new Date(`${date}T${startTimeStr}:00`);

      const bookingRef = `EVB-${Math.floor(100000 + Math.random() * 900000)}`;
      const payload = {
        bookingId: bookingRef,
        chargerId: charger._id,
        charger: {
          _id: charger._id,
          title: charger.title,
          powerKW: charger.powerKW,
          chargingMethod: charger.chargingMethod,
          connectorType: charger.connectorType,
          address: charger.address,
          approximateArea: charger.approximateArea,
          pricing: charger.pricing,
          host: charger.host
        },
        user: {
          firebaseUid: user?.firebaseUid,
          name: user?.name,
          email: user?.email,
          phone: user?.phone
        },
        startTime: startDateTime.toISOString(),
        durationHours: Number(durationHours),
        estimatedKWh: Number(activeKWh),
        estimatedCost: {
          subtotal,
          platformFee,
          taxes,
          totalEstimated
        },
        status: 'Confirmed',
        vehicle: selectedVehicle,
        notes
      };

      const res = await api.createBooking(payload);
      if (res.success && res.booking) {
        setSuccessBooking(res.booking);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete booking. Please select another time slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!successBooking ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                {charger.powerKW} kW {charger.chargingMethod}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {charger.connectorType}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 line-clamp-1">
              Book {charger.title}
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Host: <span className="font-semibold text-slate-700">{charger.host?.name || 'Verified Host'}</span> • Exact address revealed after confirmation
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              
              {/* Date & Start Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                  />
                </div>
              </div>

              {/* Duration Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <label className="font-bold text-slate-700">
                    Duration: <span className="text-emerald-700 font-extrabold">{durationHours} hours</span>
                  </label>
                  <span className="text-slate-400 text-[11px]">Max {charger.availabilitySchedule?.maxDurationHours || 6}h</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max={charger.availabilitySchedule?.maxDurationHours || 6}
                  step="0.5"
                  value={durationHours}
                  onChange={(e) => {
                    const dur = parseFloat(e.target.value);
                    setDurationHours(dur);
                    setEstimatedKWh(Number((power * dur * 0.85).toFixed(1)));
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Energy in kWh */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Energy (kWh)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    step="0.5"
                    value={activeKWh}
                    onChange={(e) => setEstimatedKWh(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Vehicle
                  </label>
                  <input
                    type="text"
                    value={`${selectedVehicle.make} ${selectedVehicle.model}`}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, model: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Itemized Price Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
                <div className="font-bold text-slate-800 text-xs mb-1">
                  Estimated Cost Breakdown
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Energy ({activeKWh} kWh × ₹{priceKWh})</span>
                  <span>₹{energyCharge.toFixed(2)}</span>
                </div>
                {timeFeeEnabled && (
                  <div className="flex justify-between text-slate-600">
                    <span>Parking Time Fee ({durationHours}h × ₹{priceHour})</span>
                    <span>₹{timeCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee (5%)</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Taxes (18%)</span>
                  <span>₹{taxes.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>Total Estimated Cost</span>
                  <span className="text-emerald-700 text-base">₹{totalEstimated.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Final bill will be charged after your session based on exact energy measured.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Checking Availability & Reserving...</span>
                ) : (
                  <>
                    <span>Confirm & Reserve Slot</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Success View */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">
              Booking Confirmed!
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Booking Ref: <span className="font-mono font-bold text-emerald-700">{successBooking.bookingId}</span>
            </p>

            {/* Revealed Address for Authorized User */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left text-xs mb-5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Authorized Charger Access Details</span>
              </div>
              <p className="text-slate-800 font-semibold">
                {charger.address?.street}
              </p>
              {charger.address?.landmark && (
                <p className="text-slate-600">Landmark: {charger.address.landmark}</p>
              )}
              <p className="text-slate-600">
                {charger.address?.city}, {charger.address?.state} - {charger.address?.postalCode}
              </p>
              <div className="mt-2 pt-2 border-t border-emerald-200 flex justify-between font-medium text-emerald-800">
                <span>Host: {charger.host?.name}</span>
                <span>📞 {charger.host?.phone || '+91 98765 43210'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard?tab=bookings');
                }}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                View in My Bookings
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate(`/session/live?bookingId=${successBooking._id}`);
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Start Charging Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
