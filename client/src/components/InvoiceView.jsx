import React from 'react';
import {
  Printer,
  Download,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  BatteryCharging
} from 'lucide-react';

export const InvoiceView = ({ invoice }) => {
  if (!invoice) return null;

  const session = invoice.session || {};
  const charger = session.charger || {};
  const host = invoice.host || {};
  const user = invoice.user || {};
  const bill = invoice.billSnapshot || session.finalBill || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-3xl mx-auto">
      
      {/* Action Header (hidden in print) */}
      <div className="no-print bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Official Tax Invoice & Payment Receipt</span>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Invoice Document Body */}
      <div id="printable-invoice" className="p-8 sm:p-12 text-slate-900 space-y-8">
        
        {/* Top Header: Brand + Invoice Details */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Ev<span className="text-emerald-600">Near</span>U
              </h1>
              <p className="text-[11px] text-slate-500">
                EvNearU Technologies India Pvt Ltd • GSTIN: 29AABCE1234F1Z8
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tax Invoice</p>
            <p className="text-lg font-mono font-black text-slate-900">{invoice.invoiceNumber}</p>
            <p className="text-xs text-slate-500">
              Date: {new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Billed To / Host Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p className="font-bold text-slate-400 uppercase text-[10px] mb-1">Billed To (EV Driver)</p>
            <p className="text-sm font-bold text-slate-900">{user.name || 'EV Driver'}</p>
            <p className="text-slate-600">{user.email}</p>
            <p className="text-slate-600">{user.phone}</p>
            {invoice.booking?.vehicle && (
              <p className="mt-2 text-emerald-800 font-semibold">
                Vehicle: {invoice.booking.vehicle.make} {invoice.booking.vehicle.model} ({invoice.booking.vehicle.licensePlate || 'EV'})
              </p>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p className="font-bold text-slate-400 uppercase text-[10px] mb-1">Charger Host & Station</p>
            <p className="text-sm font-bold text-slate-900">{charger.title || 'Private EV Charger'}</p>
            <p className="text-slate-600">Host: {host.name || 'Verified Host'}</p>
            <p className="text-slate-600">
              {charger.address?.street}, {charger.address?.city}, {charger.address?.state}
            </p>
            <p className="mt-2 text-slate-500">
              Specs: {charger.powerKW} kW {charger.chargingMethod} • {charger.connectorType}
            </p>
          </div>
        </div>

        {/* Charging Session Summary */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 flex justify-between">
            <span>Session Telemetry & Measurement</span>
            <span className="font-mono">Ref: {session.sessionId || invoice.session}</span>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-400">Energy Measured</p>
              <p className="text-base font-black text-slate-900">
                {session.energyConsumedKWh || bill.energyConsumedKWh || 0} kWh
              </p>
            </div>
            <div>
              <p className="text-slate-400">Duration</p>
              <p className="text-base font-black text-slate-900">
                {session.durationMinutes || bill.billableHours * 60 || 0} mins
              </p>
            </div>
            <div>
              <p className="text-slate-400">Power Rating</p>
              <p className="text-base font-black text-slate-900">
                {charger.powerKW || 11} kW
              </p>
            </div>
            <div>
              <p className="text-slate-400">Payment Status</p>
              <p className="text-base font-black text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>PAID</span>
              </p>
            </div>
          </div>
        </div>

        {/* Itemized Billing Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Qty / Rate</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-900">Electric Vehicle Energy Charge</p>
                  <p className="text-slate-500 text-[11px]">Direct power delivered to vehicle battery</p>
                </td>
                <td className="py-3 px-4 text-center text-slate-600">
                  {session.energyConsumedKWh || bill.energyConsumedKWh || 0} kWh @ ₹{session.pricingSnapshot?.pricePerKWh || charger.pricing?.pricePerKWh || 15}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">
                  ₹{bill.energyCharge?.toFixed(2) || '0.00'}
                </td>
              </tr>

              {bill.timeCharge > 0 && (
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">Parking & Time-Based Facility Fee</p>
                    <p className="text-slate-500 text-[11px]">Host bay occupancy reservation charge</p>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">
                    {session.durationMinutes} mins @ ₹{charger.pricing?.pricePerHour}/hr
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{bill.timeCharge?.toFixed(2)}
                  </td>
                </tr>
              )}

              <tr>
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-900">Platform Convenience & Safety Fee</p>
                  <p className="text-slate-500 text-[11px]">5% platform infrastructure and 24/7 telemetry</p>
                </td>
                <td className="py-3 px-4 text-center text-slate-600">5%</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">
                  ₹{bill.platformFee?.toFixed(2) || '0.00'}
                </td>
              </tr>

              <tr>
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-900">Goods and Services Tax (GST 18%)</p>
                  <p className="text-slate-500 text-[11px]">CGST 9% + SGST 9%</p>
                </td>
                <td className="py-3 px-4 text-center text-slate-600">18%</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">
                  ₹{bill.taxes?.toFixed(2) || '0.00'}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-300">
              <tr>
                <td colSpan="2" className="py-3 px-4 font-black text-sm text-slate-900 text-right">
                  Total Amount Paid:
                </td>
                <td className="py-3 px-4 font-black text-base text-emerald-700 text-right">
                  ₹{invoice.amount?.toFixed(2) || bill.finalAmount?.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Transaction Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[11px] text-slate-500">
          <div>
            <p className="font-bold text-slate-700">Payment Gateway Reference: {invoice.gatewayPaymentId || 'pay_demo_success'}</p>
            <p>Payment Method: {invoice.paymentMethod || 'UPI'}</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-700 font-bold flex items-center gap-1 justify-end">
              <ShieldCheck className="w-4 h-4" />
              <span>Electronically Generated & Digitally Verified</span>
            </p>
            <p>Thank you for choosing zero-emission green transportation.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
