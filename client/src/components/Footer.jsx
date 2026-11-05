import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, HeartHandshake, PhoneCall, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-charcoal-900 text-slate-400 text-sm border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Ev<span className="text-emerald-400">Near</span>U
              </span>
            </Link>
            <p className="text-slate-400 max-w-sm leading-relaxed text-sm">
              India's leading peer-to-peer EV charger sharing platform. Connect charger owners with EV drivers for seamless, affordable, and green urban charging.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-1.5 bg-charcoal-800 px-3 py-1.5 rounded-lg border border-charcoal-700">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Hosts</span>
              </div>
              <div className="flex items-center gap-1.5 bg-charcoal-800 px-3 py-1.5 rounded-lg border border-charcoal-700">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span>Safe Community</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Discover</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/find-chargers" className="hover:text-emerald-400 transition">
                  Find Nearby Chargers
                </Link>
              </li>
              <li>
                <Link to="/find-chargers?connectorType=CCS2" className="hover:text-emerald-400 transition">
                  CCS2 Fast Chargers
                </Link>
              </li>
              <li>
                <Link to="/find-chargers?connectorType=Type+2" className="hover:text-emerald-400 transition">
                  Type 2 AC Chargers
                </Link>
              </li>
              <li>
                <Link to="/find-chargers?chargingMethod=DC" className="hover:text-emerald-400 transition">
                  Rapid DC Stations
                </Link>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Charger Hosts</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/post-charger" className="hover:text-emerald-400 transition">
                  List Your Home Charger
                </Link>
              </li>
              <li>
                <Link to="/earnings" className="hover:text-emerald-400 transition">
                  Earnings Calculator
                </Link>
              </li>
              <li>
                <Link to="/post-charger" className="hover:text-emerald-400 transition">
                  Host Guidelines & Safety
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition">
                  Host Management Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Support 24/7</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>1800-EV-NEARU (Toll Free)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>support@evnearu.com</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Bengaluru, Karnataka, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} EvNearU Technologies India Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-emerald-400 font-medium">INR (₹) Standard Billing</span>
            <a href="#terms" className="hover:text-emerald-400 transition">Terms of Service</a>
            <a href="#privacy" className="hover:text-emerald-400 transition">Privacy & Location Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
