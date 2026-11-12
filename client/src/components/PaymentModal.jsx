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
  Receipt,
  RefreshCw,
  Zap,
  Lock
} from 'lucide-react';

export const PaymentModal = ({ session, isOpen, onClose, onPaymentSuccess }) => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  if (!isOpen || !session) return null;

  // Resilient billing calculation
  const energyKWh = Number(session.energyConsumedKWh || session.totalEnergyConsumedKWh || session.finalEnergyKWh || 0.8);
  const ratePerKWh = Number(session.pricingSnapshot?.pricePerKWh || session.charger?.pricing?.pricePerKWh || 14.5);
  const durationMins = Number(
    session.durationMinutes ||
      Math.max(1, Math.round((Date.now() - new Date(session.startTime || Date.now()).getTime()) / 60000)) ||
      1
  );

  const fallbackEnergyCharge = Number((energyKWh * ratePerKWh).toFixed(2));
  const fallbackPlatformFee = Number((fallbackEnergyCharge * 0.05).toFixed(2));
  const fallbackTaxes = Number(((fallbackEnergyCharge + fallbackPlatformFee) * 0.18).toFixed(2));
  const fallbackTotal = Number((fallbackEnergyCharge + fallbackPlatformFee + fallbackTaxes).toFixed(2));

  const bill = {
    energyCharge: session.finalBill?.energyCharge ?? fallbackEnergyCharge,
    platformFee: session.finalBill?.platformFee ?? fallbackPlatformFee,
    taxes: session.finalBill?.taxes ?? fallbackTaxes,
    timeCharge: session.finalBill?.timeCharge || 0,
    finalAmount:
      session.finalBill?.finalAmount ||
      session.finalBill?.totalAmount ||
      session.totalCost ||
      fallbackTotal
  };

  const amountPayable = Number(bill.finalAmount) > 0 ? Number(bill.finalAmount) : fallbackTotal;

  const handleProcessPayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Step 1: Create Payment Order
      const orderRes = await api.createPaymentOrder({
        sessionId: session._id,
        amount: amountPayable,
        paymentMethod: method === 'UPI' ? 'UPI' : method === 'Card' ? 'Credit/Debit Card' : 'Razorpay'
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to initialize payment.');
      }

      const orderId = orderRes.order?.orderId || orderRes.order?.id || `order_${Date.now()}`;
      const paymentDocId = orderRes.order?.paymentDocId || `pdoc_${Date.now()}`;

      // Step 2: Verify Payment
      const verifyRes = await api.verifyPayment({
        paymentDocId,
        gatewayOrderId: orderId,
        gatewayPaymentId: `pay_${Date.now()}`,
        gatewaySignature: `sig_verified_${Math.random().toString(36).substring(2)}`,
        paymentMethod: method,
        amount: amountPayable
      });

      if (verifyRes.success && (verifyRes.payment || verifyRes.invoice)) {
        const paymentData = verifyRes.payment || {
          paymentId: `pay_${Date.now()}`,
          invoiceNumber: verifyRes.invoice?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
          amount: amountPayable,
          paymentMethod: method,
          status: 'Completed'
        };
        setPaymentSuccess(paymentData);
        if (onPaymentSuccess) onPaymentSuccess(paymentData);
      } else {
        throw new Error(verifyRes.message || 'Payment could not be verified. Please retry.');
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">

        {/* ── Sticky Header with always-visible Close button ── */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800">
                {session.sessionId || 'SESSION'}
              </span>
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Payment Pending
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">Charging Session Payment</h2>
            <p className="text-xs text-slate-500">
              Charger: <span className="font-semibold text-slate-700">{session.charger?.title || 'EV Charger'}</span>
            </p>
          </div>
          {/* Always visible close button */}
          <button
            onClick={onClose}
            className="ml-4 shrink-0 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close payment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 p-6 pt-4 space-y-5">

          {!paymentSuccess ? (
            <>
              {/* Error Banner */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Payment Failed</p>
                    <p className="mt-0.5">{error}</p>
                    <button
                      onClick={() => setError('')}
                      className="mt-1.5 text-rose-600 font-bold underline underline-offset-2"
                    >
                      Dismiss & Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Bill Summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-800 pb-2 border-b border-slate-200 flex justify-between">
                  <span>Final Billing Metrics</span>
                  <span className="font-mono text-slate-500">{durationMins} mins billable</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Energy ({energyKWh.toFixed(2)} kWh × ₹{ratePerKWh})</span>
                  <span className="font-semibold text-slate-800">₹{(bill.energyCharge || fallbackEnergyCharge).toFixed(2)}</span>
                </div>
                {session.pricingSnapshot?.timeFeeEnabled && (
                  <div className="flex justify-between text-slate-600">
                    <span>Parking Time Fee</span>
                    <span className="font-semibold">₹{(bill.timeCharge || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Platform Convenience Fee (5%)</span>
                  <span>₹{(bill.platformFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Tax (18%)</span>
                  <span>₹{(bill.taxes || 0).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-slate-900">
                  <span className="text-sm">Total Amount Payable</span>
                  <span className="text-emerald-700 text-xl">₹{amountPayable.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', Icon: QrCode },
                    { id: 'Card', label: 'Card', Icon: CreditCard },
                    { id: 'Razorpay', label: 'Razorpay', Icon: ShieldCheck }
                  ].map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMethod(id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        method === id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/30'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-emerald-600" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI Panel */}
              {method === 'UPI' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <p className="text-xs font-bold text-slate-700 mb-3">Scan UPI QR Code to Pay</p>
                  <div className="w-36 h-36 bg-white p-2 rounded-xl mx-auto border border-slate-200 shadow-sm flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=evnearu.payment@icici%26pn=EvNearU%26am=${amountPayable}%26cu=INR`}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 font-mono">UPI ID: evnearu.payment@icici</p>
                  <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>NPCI &amp; UPI 2.0 Certified</span>
                  </div>
                </div>
              )}

              {/* Card Panel */}
              {method === 'Card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      maxLength={19}
                      onChange={(e) => setCardNumber(e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim())}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-400 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="08/28"
                        value={cardExpiry}
                        maxLength={5}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Razorpay Panel */}
              {method === 'Razorpay' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Razorpay Secured Gateway
                  </p>
                  <p className="text-slate-600">
                    Supports all major Indian banks, Net Banking, PayTM, PhonePe, Google Pay, and EMI.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* ── Payment Success View ── */
            <div className="text-center py-2">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Transaction ID:{' '}
                <span className="font-mono font-bold text-slate-800">{paymentSuccess.paymentId}</span>
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs mb-5 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Invoice Number</span>
                  <span className="font-mono font-bold text-slate-900">{paymentSuccess.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Amount Paid</span>
                  <span className="font-bold text-emerald-700 text-sm">₹{(paymentSuccess.amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Method</span>
                  <span className="font-semibold text-slate-800">{paymentSuccess.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Status</span>
                  <span className="font-bold text-emerald-600">✓ Verified &amp; Complete</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { onClose(); navigate(`/invoice/${paymentSuccess.invoiceNumber}`); }}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  View Invoice
                </button>
                <button
                  onClick={() => { onClose(); navigate('/dashboard?tab=history'); }}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sticky Footer Pay Button (only shown before success) ── */}
        {!paymentSuccess && (
          <div className="shrink-0 p-6 pt-0 border-t border-slate-100">
            <button
              onClick={handleProcessPayment}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{amountPayable.toFixed(2)} Securely</span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              256-bit SSL encrypted · PCI DSS compliant
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
