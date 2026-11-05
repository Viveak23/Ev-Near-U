import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Zap,
  Search,
  PlusCircle,
  Calendar,
  Activity,
  DollarSign,
  Clock,
  BatteryCharging,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  RefreshCw,
  FileText,
  User,
  Trash2,
  Edit
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, roleView, switchRoleView } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab: 'bookings' | 'chargers' | 'history' | 'earnings'
  const tabFromUrl = searchParams.get('tab') || (roleView === 'host' ? 'chargers' : 'bookings');
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  const [stats, setStats] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [myChargers, setMyChargers] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes, chargersRes, historyRes] = await Promise.all([
        api.getDashboardStats(),
        api.getMyBookings(),
        api.getMyChargers(),
        api.getSessionHistory()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (bookingsRes.success) setMyBookings(bookingsRes.bookings || []);
      if (chargersRes.success) setMyChargers(chargersRes.chargers || []);
      if (historyRes.success) setSessionHistory(historyRes.sessions || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeleteCharger = async (chargerId) => {
    if (!window.confirm('Are you sure you want to delete this charger listing?')) return;
    try {
      const res = await api.deleteCharger(chargerId);
      if (res.success) {
        setMyChargers((prev) => prev.filter((c) => c._id !== chargerId));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete charger');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const reason = window.prompt('Please enter a cancellation reason:');
    if (!reason) return;
    try {
      const res = await api.cancelBooking(bookingId, reason);
      if (res.success) {
        setMyBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'Cancelled' } : b))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. WELCOME BANNER & DUAL ROLE ACTIONS */}
      <div className="bg-gradient-to-r from-slate-900 via-charcoal-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=059669&color=fff`
              }
              alt=""
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Universal EV Account
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Dual Role (Host & Driver)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {user?.email} • {user?.phone}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/find-chargers"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <Search className="w-4 h-4" />
              <span>Find Chargers</span>
            </Link>

            <Link
              to="/post-charger"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur transition flex items-center gap-1.5 border border-white/10"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>List My Charger</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE CHARGING SESSION PULSE BANNER (IF ACTIVE) */}
      {stats?.activeSession && (
        <div className="bg-emerald-900/90 text-white p-5 rounded-3xl border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pulse-charging">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <BatteryCharging className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Active Session In Progress
                </span>
                <span className="font-mono text-xs bg-emerald-950 px-2 py-0.5 rounded text-emerald-200">
                  {stats.activeSession.sessionId}
                </span>
              </div>
              <p className="text-base font-extrabold text-white mt-0.5">
                {stats.activeSession.charger?.title} ({stats.activeSession.currentSOC}% SOC)
              </p>
            </div>
          </div>

          <Link
            to={`/session/${stats.activeSession._id}`}
            className="px-5 py-2.5 bg-white text-emerald-950 hover:bg-slate-100 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 shadow-md"
          >
            <span>Open Live Telemetry</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 3. METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Listings (Host) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>My Active Chargers</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-slate-900">
              {stats?.host?.activeListings ?? myChargers.length}
            </p>
            <p className="text-[11px] text-slate-500">
              Total {stats?.host?.totalListings ?? myChargers.length} bay listings
            </p>
          </div>
          <Link
            to="/dashboard?tab=chargers"
            onClick={() => setActiveTab('chargers')}
            className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>Manage listings</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 2: Upcoming Bookings (Driver) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Upcoming Bookings</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-slate-900">
              {stats?.seeker?.upcomingBookingsCount ?? 0}
            </p>
            <p className="text-[11px] text-slate-500">Reserved charging slots</p>
          </div>
          <Link
            to="/dashboard?tab=bookings"
            onClick={() => setActiveTab('bookings')}
            className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>View bookings</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Energy Charged (Driver) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Green Energy</span>
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-slate-900">
              {stats?.seeker?.totalEnergyChargedKWh ?? 0}{' '}
              <span className="text-sm font-semibold text-slate-400">kWh</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Across {stats?.seeker?.completedSessionsCount ?? 0} sessions
            </p>
          </div>
          <Link
            to="/dashboard?tab=history"
            onClick={() => setActiveTab('history')}
            className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>Charging logs</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 4: Host Net Earnings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Host Net Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-emerald-700">
              ₹{stats?.host?.netEarnings?.toFixed(2) ?? '0.00'}
            </p>
            <p className="text-[11px] text-slate-500">Available for bank payout</p>
          </div>
          <Link
            to="/earnings"
            className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>Payout history</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>

      {/* 4. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm font-bold overflow-x-auto pb-1">
        <button
          onClick={() => {
            setActiveTab('bookings');
            setSearchParams({ tab: 'bookings' });
          }}
          className={`px-4 py-3 border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Bookings ({myBookings.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('chargers');
            setSearchParams({ tab: 'chargers' });
          }}
          className={`px-4 py-3 border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'chargers'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>My Charger Listings ({myChargers.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            setSearchParams({ tab: 'history' });
          }}
          className={`px-4 py-3 border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Charging Session History ({sessionHistory.length})</span>
        </button>

        <Link
          to="/earnings"
          className="px-4 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 whitespace-nowrap transition flex items-center gap-2"
        >
          <DollarSign className="w-4 h-4" />
          <span>Earnings & Payouts</span>
        </Link>
      </div>

      {/* 5. TAB CONTENT */}

      {/* TAB: MY BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No active bookings yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Discover nearby chargers on the interactive map and reserve your slot.
              </p>
              <Link
                to="/find-chargers"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                <Search className="w-4 h-4" />
                <span>Search Nearby Chargers</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBookings.map((b) => (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {b.bookingId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        b.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'Completed'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {b.charger?.title || 'EV Charger'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.charger?.address?.street}, {b.charger?.address?.city}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[11px] text-slate-400">Scheduled Time</p>
                      <p className="font-bold">
                        {new Date(b.startTime).toLocaleDateString()} at{' '}
                        {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Estimated Cost</p>
                      <p className="font-bold text-emerald-700">
                        ₹{b.estimatedCost?.totalEstimated?.toFixed(2)} ({b.durationHours} hrs)
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {b.status === 'Confirmed' && (
                      <>
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        >
                          Cancel
                        </button>
                        <Link
                          to={`/session/live?bookingId=${b._id}`}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          <span>Start Charging</span>
                        </Link>
                      </>
                    )}

                    {b.status === 'In Progress' && (
                      <Link
                        to={`/session/live?bookingId=${b._id}`}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <BatteryCharging className="w-3.5 h-3.5" />
                        <span>Resume Live Session</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: MY CHARGERS */}
      {activeTab === 'chargers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Manage your published EV chargers, update rates, or pause availability.
            </p>
            <Link
              to="/post-charger"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List New Charger</span>
            </Link>
          </div>

          {myChargers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Zap className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">You haven't listed a charger yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Share your home or commercial EV charger and earn money while supporting green mobility.
              </p>
              <Link
                to="/post-charger"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish Your Charger</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myChargers.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800">
                      {c.powerKW} kW {c.chargingMethod} • {c.connectorType}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        c.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{c.title}</h4>
                  <p className="text-xs text-slate-500">
                    {c.address?.street}, {c.address?.city}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[11px] text-slate-400">Rate</p>
                      <p className="font-bold text-slate-900">₹{c.pricing?.pricePerKWh}/kWh</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Total Bookings</p>
                      <p className="font-bold text-slate-900">{c.totalBookings || 0}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Completed</p>
                      <p className="font-bold text-emerald-700">{c.completedSessions || 0} sessions</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDeleteCharger(c._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/post-charger?edit=${c._id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Listing</span>
                    </Link>
                    <Link
                      to={`/charger/${c._id}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: CHARGING SESSION HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {sessionHistory.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No session history yet</h3>
              <p className="text-xs text-slate-500">
                Completed charging telemetry and receipts will be recorded here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Session ID</th>
                    <th className="py-3 px-4">Charger & Host</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Energy (kWh)</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessionHistory.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {s.sessionId}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{s.charger?.title || 'Charger'}</p>
                        <p className="text-[11px] text-slate-400">Host: {s.host?.name}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(s.startTime).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {s.energyConsumedKWh} kWh
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {s.durationMinutes} mins
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{s.finalBill?.finalAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/invoice/${s.paymentId?.invoiceNumber || s.sessionId}`}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
