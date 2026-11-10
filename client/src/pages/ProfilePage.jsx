import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Car,
  MapPin,
  Building2,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    bankName: '',
    accountNumberMasked: '',
    ifscCode: '',
    upiId: ''
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Sync state with authenticated user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
      setVehicles(Array.isArray(user.vehicles) ? user.vehicles : []);
      if (user.payoutBankDetails) {
        setBankDetails({
          accountHolder: user.payoutBankDetails.accountHolder || '',
          bankName: user.payoutBankDetails.bankName || '',
          accountNumberMasked: user.payoutBankDetails.accountNumberMasked || '',
          ifscCode: user.payoutBankDetails.ifscCode || '',
          upiId: user.payoutBankDetails.upiId || ''
        });
      }
    }
  }, [user]);

  // Add new vehicle to garage
  const handleAddVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        make: '',
        model: '',
        year: 2024,
        batteryCapacityKWh: 40,
        connectorType: 'CCS2',
        licensePlate: '',
        isPrimary: vehicles.length === 0
      }
    ]);
  };

  const handleUpdateVehicle = (index, field, value) => {
    const updated = [...vehicles];
    updated[index][field] = value;
    setVehicles(updated);
  };

  const handleRemoveVehicle = (index) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMsg('');
      setError('');

      await updateProfile({
        name,
        phone,
        avatar,
        vehicles,
        payoutBankDetails: bankDetails
      });

      setMsg('Your profile has been saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Account & Vehicles
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            User Profile & Garage
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal contact details, EV specifications, and host payout settings.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. BASIC INFORMATION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <User className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Authenticated)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Profile Avatar URL (optional)
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 2. VEHICLE GARAGE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Vehicle Garage</h2>
                <p className="text-xs text-slate-500">
                  Register your EVs to speed up slot bookings and connector matching.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddVehicle}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
              <Car className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No vehicles added yet</p>
              <p className="text-[11px] text-slate-400">
                Click "+ Add Vehicle" to link your EV make, battery capacity, and connector type.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((v, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-3"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveVehicle(idx)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-600"
                    title="Remove vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Make (e.g. Tata, MG, Tesla)
                      </label>
                      <input
                        type="text"
                        value={v.make}
                        onChange={(e) => handleUpdateVehicle(idx, 'make', e.target.value)}
                        placeholder="e.g. Tata"
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        value={v.model}
                        onChange={(e) => handleUpdateVehicle(idx, 'model', e.target.value)}
                        placeholder="e.g. Nexon EV"
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Battery Capacity (kWh)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={v.batteryCapacityKWh}
                        onChange={(e) =>
                          handleUpdateVehicle(idx, 'batteryCapacityKWh', parseFloat(e.target.value))
                        }
                        placeholder="40.5"
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Connector Type
                      </label>
                      <select
                        value={v.connectorType}
                        onChange={(e) => handleUpdateVehicle(idx, 'connectorType', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      >
                        <option value="CCS2">CCS2 (Standard DC/AC)</option>
                        <option value="Type 2">Type 2 AC</option>
                        <option value="Tesla NACS">Tesla NACS</option>
                        <option value="CHAdeMO">CHAdeMO</option>
                        <option value="16A 3-Pin">16A 3-Pin Socket</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        License Plate (Optional)
                      </label>
                      <input
                        type="text"
                        value={v.licensePlate || ''}
                        onChange={(e) => handleUpdateVehicle(idx, 'licensePlate', e.target.value)}
                        placeholder="KA 01 EV 1234"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. HOST PAYOUT DETAILS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Host Payout Information</h2>
              <p className="text-xs text-slate-500">
                Required for withdrawing earnings from your shared EV chargers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bank Account Holder Name
              </label>
              <input
                type="text"
                value={bankDetails.accountHolder}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, accountHolder: e.target.value })
                }
                placeholder="Account Holder Name"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={bankDetails.accountNumberMasked}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, accountNumberMasked: e.target.value })
                }
                placeholder="Enter bank account number"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                UPI ID (for instant payouts)
              </label>
              <input
                type="text"
                value={bankDetails.upiId}
                onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                placeholder="yourname@upi"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
