import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Zap,
  MapPin,
  PlusCircle,
  Search,
  User,
  LogOut,
  Calendar,
  Activity,
  DollarSign,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  BatteryCharging
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, roleView, switchRoleView } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  // Poll for active session every 15 seconds if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const checkActiveSession = async () => {
      try {
        const res = await api.getActiveSession();
        if (res.success && res.session) {
          setActiveSession(res.session);
        } else {
          setActiveSession(null);
        }
      } catch (err) {
        // Silently handle
      }
    };
    checkActiveSession();
    const interval = setInterval(checkActiveSession, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Ev<span className="text-emerald-600">Near</span>U
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                Network
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <Link
              to="/find-chargers"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/find-chargers'
                  ? 'text-emerald-600 bg-emerald-50 font-semibold'
                  : 'hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              Find Chargers
            </Link>

            <Link
              to="/post-charger"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/post-charger'
                  ? 'text-emerald-600 bg-emerald-50 font-semibold'
                  : 'hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Host a Charger
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-emerald-600 bg-emerald-50 font-semibold'
                    : 'hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right Section: Role View Switcher & Auth */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Live Active Session Indicator Badge */}
            {activeSession && (
              <Link
                to={`/session/${activeSession._id}`}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-semibold shadow-md shadow-emerald-600/30 pulse-charging hover:bg-emerald-700 transition"
                title="Active Charging Session in progress"
              >
                <BatteryCharging className="w-4 h-4 animate-bounce" />
                <span>Live Session ({activeSession.currentSOC}%)</span>
              </Link>
            )}

            {/* Seamless Dual-Role View Switcher */}
            {isAuthenticated && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">
                <button
                  onClick={() => switchRoleView('seeker')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                    roleView === 'seeker'
                      ? 'bg-white text-emerald-700 shadow-sm font-bold'
                      : 'hover:text-slate-900'
                  }`}
                  title="Switch view to EV Driver mode"
                >
                  🚗 Driver
                </button>
                <button
                  onClick={() => switchRoleView('host')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                    roleView === 'host'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'hover:text-slate-900'
                  }`}
                  title="Switch view to Charger Host mode"
                >
                  ⚡ Host
                </button>
              </div>
            )}

            {/* Quick Action Button */}
            {isAuthenticated ? (
              roleView === 'host' ? (
                <Link
                  to="/post-charger"
                  className="px-3.5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  List Charger
                </Link>
              ) : (
                <Link
                  to="/find-chargers"
                  className="px-3.5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  Find Chargers
                </Link>
              )
            ) : null}

            {/* User Profile Dropdown or Login/Register */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                >
                  <img
                    src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=059669&color=fff`
                    }
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {user?.name?.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {roleView === 'host' ? 'Host Mode' : 'Driver Mode'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-sm"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Activity className="w-4 h-4 text-emerald-600" />
                        Dashboard
                      </Link>

                      <Link
                        to="/dashboard?tab=bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        My Bookings
                      </Link>

                      <Link
                        to="/dashboard?tab=chargers"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Zap className="w-4 h-4 text-emerald-600" />
                        My Charger Listings
                      </Link>

                      <Link
                        to="/earnings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        Host Earnings & Payouts
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-emerald-600" />
                        Profile & Vehicle Garage
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {activeSession && (
              <Link
                to={`/session/${activeSession._id}`}
                className="p-2 bg-emerald-600 text-white rounded-full pulse-charging"
              >
                <BatteryCharging className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=059669&color=fff`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              {/* Mobile Role Switch */}
              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
                <button
                  onClick={() => switchRoleView('seeker')}
                  className={`px-2 py-1 rounded ${roleView === 'seeker' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'}`}
                >
                  Driver
                </button>
                <button
                  onClick={() => switchRoleView('host')}
                  className={`px-2 py-1 rounded ${roleView === 'host' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  Host
                </button>
              </div>
            </div>
          )}

          <Link
            to="/find-chargers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Find Chargers Nearby
          </Link>

          <Link
            to="/post-charger"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            List My Home Charger
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                to="/earnings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Host Earnings & Payouts
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Profile & Garage
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center w-full py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
