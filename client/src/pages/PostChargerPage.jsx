import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react';

const PRESET_CHARGER_IMAGES = [
  'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1558441719-aa34bbe5f347?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80'
];

export const PostChargerPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    chargerType: 'Level 2 AC (Fast)',
    connectorType: 'CCS2',
    chargingMethod: 'AC',
    powerKW: 11,
    street: '',
    landmark: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560034',
    latitude: 12.9345,
    longitude: 77.6245,
    pricePerKWh: 14.5,
    timeFeeEnabled: false,
    pricePerHour: 0,
    startHour: '06:00',
    endHour: '23:00',
    maxDurationHours: 6,
    bookingRules: 'Park straight in the designated bay. Notify host on arrival.',
    accessType: 'Public',
    status: 'Active',
    selectedImage: PRESET_CHARGER_IMAGES[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=post-charger');
      return;
    }

    if (editId) {
      const loadExisting = async () => {
        try {
          const res = await api.getChargerById(editId);
          if (res.success && res.charger) {
            const c = res.charger;
            setFormData({
              title: c.title,
              description: c.description || '',
              chargerType: c.chargerType || 'Level 2 AC (Fast)',
              connectorType: c.connectorType || 'CCS2',
              chargingMethod: c.chargingMethod || 'AC',
              powerKW: c.powerKW || 11,
              street: c.address?.street || '',
              landmark: c.address?.landmark || '',
              city: c.address?.city || 'Bengaluru',
              state: c.address?.state || 'Karnataka',
              postalCode: c.address?.postalCode || '',
              latitude: c.location?.coordinates?.[1] || 12.9345,
              longitude: c.location?.coordinates?.[0] || 77.6245,
              pricePerKWh: c.pricing?.pricePerKWh || 14.5,
              timeFeeEnabled: Boolean(c.pricing?.timeFeeEnabled),
              pricePerHour: c.pricing?.pricePerHour || 0,
              startHour: c.availabilitySchedule?.startHour || '06:00',
              endHour: c.availabilitySchedule?.endHour || '23:00',
              maxDurationHours: c.availabilitySchedule?.maxDurationHours || 6,
              bookingRules: c.bookingRules || '',
              accessType: c.accessType || 'Public',
              status: c.status || 'Active',
              selectedImage: c.images?.[0] || PRESET_CHARGER_IMAGES[0]
            });
          }
        } catch (err) {
          setError('Failed to load charger for editing');
        }
      };
      loadExisting();
    }
  }, [editId, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.street || !formData.city || !formData.pricePerKWh) {
      setError('Please fill in all mandatory fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        title: formData.title,
        description: formData.description,
        chargerType: formData.chargerType,
        connectorType: formData.connectorType,
        chargingMethod: formData.chargingMethod,
        powerKW: Number(formData.powerKW),
        address: {
          street: formData.street,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: 'India'
        },
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        images: [formData.selectedImage],
        pricing: {
          pricePerKWh: Number(formData.pricePerKWh),
          pricePerHour: Number(formData.pricePerHour) || 0,
          timeFeeEnabled: Boolean(formData.timeFeeEnabled),
          currency: 'INR'
        },
        availabilitySchedule: {
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          startHour: formData.startHour,
          endHour: formData.endHour,
          maxDurationHours: Number(formData.maxDurationHours)
        },
        bookingRules: formData.bookingRules,
        accessType: formData.accessType,
        status: formData.status,
        amenities: ['Covered Parking', 'CCTV Security', 'Wi-Fi']
      };

      if (editId) {
        const res = await api.updateCharger(editId, payload);
        if (res.success) {
          setSuccess('Listing updated successfully!');
          setTimeout(() => navigate('/dashboard?tab=chargers'), 1200);
        }
      } else {
        const res = await api.createCharger(payload);
        if (res.success) {
          setSuccess('Charger published successfully! It is now discoverable.');
          setTimeout(() => navigate('/dashboard?tab=chargers'), 1200);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to publish charger listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          Host Your Charger
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          {editId ? 'Edit Charger Listing' : 'List & Share Your EV Charger'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Set your pricing, operating hours, and location. Your exact residential address stays private until a booking is verified.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Charger Details & Power Specs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            <span>1. Charger Specifications & Power</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Charger Listing Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. GreenPoint 11 kW Level 2 AC Fast Charger"
              required
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Connector Plug Type *
              </label>
              <select
                name="connectorType"
                value={formData.connectorType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="CCS2">CCS2 (Most Common)</option>
                <option value="Type 2">Type 2 AC</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="Tesla NACS">Tesla NACS</option>
                <option value="GB/T">GB/T</option>
                <option value="16A 3-Pin">16A 3-Pin Socket</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Power Output (kW) *
              </label>
              <input
                type="number"
                step="0.1"
                min="1.5"
                max="350"
                name="powerKW"
                value={formData.powerKW}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Charging Method *
              </label>
              <select
                name="chargingMethod"
                value={formData.chargingMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="AC">AC (Alternating Current)</option>
                <option value="DC">DC (Direct Fast Charge)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Helpful Context
            </label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe access gate, parking bay shelter, nearby cafes, or Wi-Fi availability..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            ></textarea>
          </div>
        </div>

        {/* Section 2: Address & Map Coordinates */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>2. Location & Privacy Protected Address</span>
          </h2>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Privacy Note: Only your neighborhood/landmark will be shown publicly. Your exact street number and gate code are only revealed to a driver once you confirm their booking.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Street Address (Private until booked) *
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="e.g. #42, 7th Main, 4th Block"
              required
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Landmark (Publicly visible)
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="Near Sony World Junction"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>

          {/* Latitude & Longitude Coordinates */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Latitude Coordinates (Decimal)
              </label>
              <input
                type="number"
                step="0.0001"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Longitude Coordinates (Decimal)
              </label>
              <input
                type="number"
                step="0.0001"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Availability */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>3. Pricing & Operating Schedule</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Price per kWh (₹ INR) *
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="100"
                name="pricePerKWh"
                value={formData.pricePerKWh}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-emerald-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">Recommended: ₹12 to ₹18 / kWh for AC Level 2</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Optional Hourly Parking Fee
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-emerald-700 font-bold">
                  <input
                    type="checkbox"
                    name="timeFeeEnabled"
                    checked={formData.timeFeeEnabled}
                    onChange={handleChange}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <span>Enable Hourly Fee</span>
                </label>
              </div>
              <input
                type="number"
                step="5"
                min="0"
                disabled={!formData.timeFeeEnabled}
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleChange}
                placeholder="₹20 / hour"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold disabled:opacity-40"
              />
            </div>
          </div>

          {/* Operating Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Hour
              </label>
              <input
                type="time"
                name="startHour"
                value={formData.startHour}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                End Hour
              </label>
              <input
                type="time"
                name="endHour"
                value={formData.endHour}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Max Charging Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                name="maxDurationHours"
                value={formData.maxDurationHours}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Photo Selection */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            <span>4. Charger Photo</span>
          </h2>

          <p className="text-xs text-slate-500">
            Select one of our high-resolution EV charging station presets:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PRESET_CHARGER_IMAGES.map((img, i) => (
              <div
                key={i}
                onClick={() => setFormData((prev) => ({ ...prev, selectedImage: img }))}
                className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition ${
                  formData.selectedImage === img
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="h-20 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="py-3 px-8 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
          >
            {loading ? (
              <span>Publishing Listing...</span>
            ) : (
              <>
                <span>{editId ? 'Save Changes' : 'Publish Charger Listing'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
