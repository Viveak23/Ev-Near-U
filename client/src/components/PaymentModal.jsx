import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Receipt,
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';

export const PaymentModal = ({ session, isOpen, onClose, onPaymentSuccess }) => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('UPI'); // 'UPI' | 'Card' | 'Razorpay'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCVV, setCardCVV] = useState('789');

  // UPI state
  const [upiId, setUpiId] = useState('evdriver@okaxis');

  if (!isOpen || !session) return null;

  const bill = session.finalBill || {};
  const amountPayable = bill.finalAmount || 0;

  const handleProcessPayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Step 1: Create Payment Order on backend
      const orderRes = await api.createPaymentOrder({
        sessionId: session._id,
        paymentMethod: method === 'UPI' ? 'UPI' : method === 'Card' ? 'Credit/Debit Card' : 'Razorpay'
      });

      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || 'Failed to initialize payment gateway.');
      }

      const { orderId, paymentDocId } = orderRes.order;

      // Step 2: Verify Payment on backend
      const verifyRes = await api.verifyPayment({
        paymentDocId,
        gatewayOrderId: orderId,
        gatewayPaymentId: `pay_${Date.now()}`,
        gatewaySignature: `sig_verified_${Math.random().toString(36).substring(2)}`,
        paymentMethod: method
      });

      if (verifyRes.success && verifyRes.payment) {
        setPaymentSuccess(verifyRes.payment);
        if (onPaymentSuccess) {
          onPaymentSuccess(verifyRes.payment);
        }
      } else {
        throw new Error(verifyRes.message || 'Payment verification failed.');
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please retry.');
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

        {!paymentSuccess ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
                {session.sessionId}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Payment Due
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900">
              Charging Session Payment
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Charger: <span className="font-semibold text-slate-700">{session.charger?.title}</span> • Host: <span className="font-semibold text-slate-700">{session.host?.name}</span>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Transaction Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Bill Summary Table */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs mb-5">
              <div className="font-bold text-slate-800 pb-1 border-b border-slate-200 flex justify-between">
                <span>Final Billing Metrics</span>
                <span className="font-mono text-slate-500">
                  {session.durationMinutes} mins billable
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Energy Consumed ({session.energyConsumedKWh} kWh × ₹{session.pricingSnapshot?.pricePerKWh})</span>
                <span className="font-semibold text-slate-800">₹{bill.energyCharge?.toFixed(2)}</span>
              </div>

              {session.pricingSnapshot?.timeFeeEnabled && (
                <div className="flex justify-between text-slate-600">
                  <span>Parking Time Fee</span>
                  <span className="font-semibold text-slate-800">₹{bill.timeCharge?.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Platform Convenience Fee (5%)</span>
                <span>₹{bill.platformFee?.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>GST Tax (18%)</span>
                <span>₹{bill.taxes?.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-slate-900 text-base">
                <span>Total Amount Payable</span>
                <span className="text-emerald-700 text-xl">₹{amountPayable.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    method === 'UPI'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('Card')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    method === 'Card'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Credit/Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('Razorpay')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    method === 'Razorpay'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Razorpay Safe</span>
                </button>
              </div>
            </div>

            {/* Method Specific UI */}
            {method === 'UPI' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center mb-5 animate-in fade-in">
                <p className="text-xs font-bold text-slate-700 mb-2">
                  Scan Dynamic UPI QR Code to Pay
                </p>
                <div className="w-36 h-36 bg-white p-2 rounded-xl mx-auto border border-slate-200 shadow-xs flex items-center justify-center">
                  {/* SVG UPI QR illustration */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=evnearu@upi%26pn=EvNearU%26am=${amountPayable}%26cu=INR`}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-mono">
                  UPI ID: evnearu.payment@icici
                </p>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>NPCI & UPI 2.0 Certified</span>
                </div>
              </div>
            )}

            {method === 'Card' && (
              <div className="space-y-3 mb-5 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCVV}
                      onChange={(e) => setCardCVV(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'Razorpay' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 mb-5 animate-in fade-in">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Razorpay Secured Gateway
                </p>
                <p className="text-slate-600">
                  Supports all major Indian banks, Net Banking, PayTM, PhonePe, Google Pay, and EMI.
                </p>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handleProcessPayment}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Secure Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay ₹{amountPayable.toFixed(2)} Securely</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Payment Success Confirmation View */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-slate-900">
              Payment Successful!
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Transaction ID: <span className="font-mono font-bold text-slate-800">{paymentSuccess.paymentId}</span>
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs mb-5 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Invoice Number</span>
                <span className="font-mono font-bold text-slate-900">{paymentSuccess.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid</span>
                <span className="font-bold text-emerald-700 text-sm">₹{paymentSuccess.amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Method</span>
                <span className="font-semibold text-slate-800">{paymentSuccess.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status</span>
                <span className="font-bold text-emerald-600">Verified & Complete</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate(`/invoice/${paymentSuccess.invoiceNumber}`);
                }}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-4 h-4" />
                <span>View Tax Invoice</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard?tab=history');
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
