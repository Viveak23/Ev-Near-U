import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { InvoiceView } from '../components/InvoiceView';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export const InvoicePage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await api.getInvoice(id);
        if (res.success && res.invoice) {
          setInvoice(res.invoice);
        } else {
          setError('Invoice not found');
        }
      } catch (err) {
        setError(err.message || 'Error loading invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center space-y-2">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{error || 'Invoice Not Found'}</h2>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="no-print">
        <Link
          to="/dashboard?tab=history"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Session History</span>
        </Link>
      </div>

      <InvoiceView invoice={invoice} />
    </div>
  );
};
