import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Vehicle garage
  const [vehicles, setVehicles] = useState(
    user?.vehicles && user.vehicles.length > 0
      ? user.vehicles
      : [
          {
            make: 'Tata',
            model: 'Nexon EV Empowered',
            year: 2024,
            batteryCapacityKWh: 40.5,
            connectorType: 'CCS2',
            licensePlate: 'KA 01 EV 1234',
            isPrimary: true
          }
        ]
  );

  // Bank & payout details
  const [bankDetails, setBankDetails] = useState({
    accountHolder: user?.payoutBankDetails?.accountHolder || user?.name || '',
    bankName: user?.payoutBankDetails?.bankName || 'HDFC Bank',
    accountNumberMasked: user?.payoutBankDetails?.accountNumberMasked || '•••• •••• 8821',
    ifscCode: user?.payoutBankDetails?.ifscCode || 'HDFC0001234',
    upiId: user?.payoutBankDetails?.upiId || 'evdriver@okaxis'
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Add new vehicle to garage
  const handleAddVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        make: 'MG',
        model: 'ZS EV',
        year: 2024,
        batteryCapacityKWh: 50.3,
        connectorType: 'CCS2',
        licensePlate: 'KA 03 EV 8899',
        isPrimary: false
      }
    ]);
  };

  const handleRemoveVehicle = (index) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const handleVehicleChange = (index, field, value) => {
    const updated = [...vehicles];
    updated[index][field] = value;
    setVehicles(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setMsg('');

      await updateProfile({
        name,
        phone,
        avatar,
        vehicles,
        payoutBankDetails: bankDetails
      });

      setMsg('Profile and vehicle garage updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          Account Settings
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Profile & Vehicle Garage
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your contact credentials, EV garage specs, and payout bank information.
        </p>
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

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Personal Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address (Login ID)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Section 2: Vehicle Garage */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-600" />
              <span>EV Vehicle Garage ({vehicles.length})</span>
            </h2>
            <button
              type="button"
              onClick={handleAddVehicle}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="space-y-4">
            {vehicles.map((v, i) => (
              <div
                key={i}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    Vehicle #{i + 1} {v.isPrimary ? '• Primary Car' : ''}
                  </span>
                  {vehicles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVehicle(i)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Remove vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Brand</label>
                    <input
                      type="text"
                      value={v.make}
                      onChange={(e) => handleVehicleChange(i, 'make', e.target.value)}
                      placeholder="e.g. Tata"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Model</label>
                    <input
                      type="text"
                      value={v.model}
                      onChange={(e) => handleVehicleChange(i, 'model', e.target.value)}
                      placeholder="e.g. Nexon EV"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Battery (kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={v.batteryCapacityKWh}
                      onChange={(e) => handleVehicleChange(i, 'batteryCapacityKWh', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 40.5"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Connector</label>
                    <select
                      value={v.connectorType}
                      onChange={(e) => handleVehicleChange(i, 'connectorType', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                    >
                      <option value="CCS2">CCS2</option>
                      <option value="Type 2">Type 2</option>
                      <option value="CHAdeMO">CHAdeMO</option>
                      <option value="Tesla NACS">Tesla NACS</option>
                      <option value="16A 3-Pin">16A 3-Pin</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">License Plate</label>
                    <input
                      type="text"
                      value={v.licensePlate || ''}
                      onChange={(e) => handleVehicleChange(i, 'licensePlate', e.target.value)}
                      placeholder="e.g. KA 01 EV 1234"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Host Payout Bank Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>Host Payout Bank Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={bankDetails.accountNumberMasked}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumberMasked: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold"
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
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                UPI ID (VPA)
              </label>
              <input
                type="text"
                value={bankDetails.upiId}
                onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="py-3 px-8 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save Profile & Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
