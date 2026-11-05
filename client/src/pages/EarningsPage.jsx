import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building2,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

export const EarningsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payout request modal / dialog state
  const [isRequesting, setIsRequesting] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('Bank Transfer (NEFT/RTGS)');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const res = await api.getHostEarnings();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load earnings ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    try {
      setPayoutLoading(true);
      setError('');
      const res = await api.requestPayout({
        amount: parseFloat(payoutAmount) || undefined,
        method: payoutMethod
      });
      if (res.success) {
        setPayoutSuccessMsg(res.message);
        setIsRequesting(false);
        loadEarnings();
      }
    } catch (err) {
      setError(err.message || 'Failed to request payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Loading host earnings ledger...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const transactions = data?.recentTransactions || [];
  const payouts = data?.payouts || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Host Finances
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Earnings & Payout Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track revenue from your shared chargers, platform deductions, and transfer earnings to your bank account.
          </p>
        </div>

        {summary.pendingPayoutAmount > 0 && (
          <button
            onClick={() => {
              setPayoutAmount(summary.pendingPayoutAmount);
              setIsRequesting(true);
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            <span>Withdraw ₹{summary.pendingPayoutAmount.toFixed(2)}</span>
          </button>
        )}
      </div>

      {payoutSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{payoutSuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400">Gross Charging Revenue</p>
          <p className="text-2xl font-black text-slate-900 my-2">
            ₹{summary.grossRevenue?.toFixed(2) || '0.00'}
          </p>
          <p className="text-[11px] text-slate-500">
            Across {summary.completedSessions || 0} completed sessions
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400">Platform Commission (10%)</p>
          <p className="text-2xl font-black text-slate-900 my-2">
            -₹{summary.platformCommission?.toFixed(2) || '0.00'}
          </p>
          <p className="text-[11px] text-slate-500">Includes server & payment gateway fees</p>
        </div>

        <div className="bg-emerald-950 text-white rounded-2xl p-5 shadow-md">
          <p className="text-xs font-bold text-emerald-300">Net Host Earnings</p>
          <p className="text-3xl font-black text-emerald-400 my-2">
            ₹{summary.netEarnings?.toFixed(2) || '0.00'}
          </p>
          <p className="text-[11px] text-emerald-200/80">90% of base subtotal billings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400">Available to Withdraw</p>
          <p className="text-2xl font-black text-emerald-700 my-2">
            ₹{summary.pendingPayoutAmount?.toFixed(2) || '0.00'}
          </p>
          <p className="text-[11px] text-slate-500">
            Transferred: ₹{summary.paidOutAmount?.toFixed(2) || '0.00'}
          </p>
        </div>

      </div>

      {/* Payout Request Modal */}
      {isRequesting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Request Bank Payout
            </h3>
            <p className="text-xs text-slate-500">
              Transfer your net charging earnings directly to your bank account or UPI ID.
            </p>

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Withdrawal Amount (₹ INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={summary.pendingPayoutAmount}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payout Method
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT / RTGS)</option>
                  <option value="UPI Direct">UPI Direct Transfer</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                <p className="font-bold text-slate-800">Destination Account</p>
                <p>Bank: {user?.payoutBankDetails?.bankName || 'State Bank of India'}</p>
                <p>Account: {user?.payoutBankDetails?.accountNumberMasked || '•••• •••• 5491'}</p>
                <p>UPI: {user?.payoutBankDetails?.upiId || `${user?.phone?.replace(/\s+/g, '')}@upi`}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequesting(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {payoutLoading ? 'Processing...' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout History Ledger */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Payout Transfer History</h3>
        {payouts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-xs text-slate-500">
            No payouts have been processed yet. Completed sessions will accumulate pending balance above.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Payout Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Bank / Reference</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.map((p) => (
                  <tr key={p._id}>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {p.payoutId}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{p.method}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {p.referenceNumber || 'TRF-SUCCESS'}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      ₹{p.amount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
