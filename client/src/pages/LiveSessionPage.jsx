import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LiveTelemetryMeter } from '../components/LiveTelemetryMeter';
import { PaymentModal } from '../components/PaymentModal';
import { ReviewModal } from '../components/ReviewModal';
import {
  Zap,
  BatteryCharging,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Star,
  ArrowLeft,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export const LiveSessionPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [completedPayment, setCompletedPayment] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=session/live');
      return;
    }

    const initOrFetchSession = async () => {
      try {
        setLoading(true);
        setError('');

        if (id && id !== 'live') {
          // Fetch existing session by session _id
          const res = await api.getSessionById(id);
          if (res.success && res.session) {
            setSession(res.session);
            if (res.session.status === 'Payment Pending' && res.session.paymentStatus === 'Pending') {
              setIsPaymentOpen(true);
            }
          } else {
            setError('Session not found');
          }
        } else if (bookingId) {
          // Start or resume session from confirmed bookingId
          const res = await api.startSession({
            bookingId,
            initialSOC: 22,
            targetSOC: 90
          });
          if (res.success && res.session) {
            setSession(res.session);
          } else {
            setError(res.message || 'Could not start charging session');
          }
        } else {
          // Look for active session
          const activeRes = await api.getActiveSession();
          if (activeRes.success && activeRes.session) {
            setSession(activeRes.session);
          } else {
            setError('No active charging session found.');
          }
        }
      } catch (err) {
        setError(err.message || 'Error loading charging session');
      } finally {
        setLoading(false);
      }
    };

    initOrFetchSession();
  }, [id, bookingId, isAuthenticated, navigate]);

  // Stop session action
  const handleStopSession = async (finalEnergyKWh) => {
    if (!session) return;
    try {
      setLoading(true);
      const res = await api.stopSession(session._id, { finalEnergyKWh });
      if (res.success && res.session) {
        setSession(res.session);
        setIsPaymentOpen(true); // Open payment modal immediately
      }
    } catch (err) {
      alert('Error stopping session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manual reading override
  const handleUpdateManual = async (kWh) => {
    if (!session) return;
    try {
      await api.updateTelemetry(session._id, {
        energyConsumedKWh: kWh,
        manualEntry: true
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !session) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Connecting to EV Charger Telemetry...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{error}</h2>
        <p className="text-xs text-slate-500">
          Make sure your booking is confirmed or select an active session from your dashboard.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const isHost = user && session.host?._id === user._id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {session.status === 'Completed' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReviewOpen(true)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>Leave Review</span>
            </button>
            <Link
              to={`/invoice/${session.paymentId?.invoiceNumber || session.sessionId}`}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>View Tax Invoice</span>
            </Link>
          </div>
        )}
      </div>

      {/* Main Live Telemetry Meter Component */}
      <LiveTelemetryMeter
        session={session}
        isHost={isHost}
        onStopSession={handleStopSession}
        onUpdateManualReadings={handleUpdateManual}
      />

      {/* Payment Modal */}
      <PaymentModal
        session={session}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={(pay) => {
          setCompletedPayment(pay);
          setSession((prev) => ({
            ...prev,
            status: 'Completed',
            paymentStatus: 'Paid',
            paymentId: pay
          }));
          setIsPaymentOpen(false);
          // Suggest leaving a review
          setTimeout(() => setIsReviewOpen(true), 600);
        }}
      />

      {/* Review Modal */}
      <ReviewModal
        session={session}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
      />

    </div>
  );
};
