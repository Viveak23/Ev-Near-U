import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const LoginPage = () => {
  const { loginWithEmail, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'email' | 'phone'
  const [authMode, setAuthMode] = useState('email');

  // Email form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone form states
  const [phone, setPhone] = useState('+91 ');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  // OTP Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Clean Firebase Auth error messages
  const formatAuthError = (err) => {
    const code = err.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/user-disabled') {
      return 'This account has been disabled. Please contact support.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Access temporarily disabled due to many failed login attempts. Please try again later or reset password.';
    }
    if (code === 'auth/invalid-verification-code') {
      return 'Invalid OTP code. Please enter the 6-digit code received on your phone.';
    }
    if (code === 'auth/code-expired') {
      return 'The SMS OTP has expired. Please request a new verification code.';
    }
    if (code === 'auth/invalid-phone-number') {
      return 'Please enter a valid phone number with country code (e.g. +91 98765 43210).';
    }
    return err.message || 'Authentication failed. Please verify your information.';
  };

  // Handle Email Login
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your email address and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await loginWithEmail(email, password);
      navigate(redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Phone OTP Request
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid phone number with country code (e.g. +91 9876543210)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const confirmation = await sendPhoneOtp(cleanPhone, 'recaptcha-container');
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setCountdown(60);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Phone OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await verifyPhoneOtp(confirmationResult, otpCode);
      navigate(redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        
        {/* Invisible container for Firebase Phone ReCAPTCHA */}
        <div id="recaptcha-container"></div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-600/20">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to EvNearU
          </h2>
          <p className="text-xs text-slate-500">
            Secure authentication powered by Firebase
          </p>
        </div>

        {/* Authentication Mode Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authMode === 'email'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email & Password</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('phone');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authMode === 'phone'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Phone OTP</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. EMAIL LOGIN FORM */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. PHONE OTP LOGIN FORM */}
        {authMode === 'phone' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (with country code)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Firebase will send an official SMS code to verify your mobile device.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending SMS Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SMS OTP sent to {phone}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg tracking-widest font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify OTP & Log In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  {countdown > 0 ? (
                    <span className="text-xs text-slate-400">
                      Resend code in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      Resend SMS Code
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer Links */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-emerald-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
