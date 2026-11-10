import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, Search, Zap } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
        
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Error 404
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page you are looking for doesn't exist, has been moved, or the link may be outdated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/find-chargers"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Find Chargers</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
