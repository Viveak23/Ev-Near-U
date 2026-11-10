import React from 'react';
import { Search, SlidersHorizontal, RotateCcw, Zap, Filter } from 'lucide-react';

export const FilterBar = ({
  filters,
  onChange,
  onReset,
  totalResults = 0,
  isSearching = false
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by city, area, or landmark (e.g. Koramangala, Indiranagar, Bengaluru)..."
          value={filters.searchQuery || ''}
          onChange={(e) => onChange('searchQuery', e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
        />
      </div>

      {/* Primary Filter Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Connector Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Connector
          </label>
          <select
            value={filters.connectorType || 'All'}
            onChange={(e) => onChange('connectorType', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="All">All Connectors</option>
            <option value="CCS2">CCS2 (Most Common)</option>
            <option value="Type 2">Type 2 AC</option>
            <option value="CHAdeMO">CHAdeMO</option>
            <option value="Tesla NACS">Tesla NACS</option>
            <option value="16A 3-Pin">16A 3-Pin (2-Wheeler/Portable)</option>
          </select>
        </div>

        {/* AC / DC Charging Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Method
          </label>
          <select
            value={filters.chargingMethod || 'All'}
            onChange={(e) => onChange('chargingMethod', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="All">Any (AC & DC)</option>
            <option value="AC">AC (Level 1 & 2)</option>
            <option value="DC">DC Rapid Fast Charging</option>
          </select>
        </div>

        {/* Minimum Power */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Min Power (kW)
          </label>
          <select
            value={filters.powerMin || ''}
            onChange={(e) => onChange('powerMin', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="">Any Power Rating</option>
            <option value="7">7+ kW (Standard AC)</option>
            <option value="11">11+ kW (Fast AC)</option>
            <option value="22">22+ kW (Commercial AC/DC)</option>
            <option value="30">30+ kW (Rapid DC)</option>
            <option value="60">60+ kW (Ultra-Fast DC)</option>
          </select>
        </div>

        {/* Host Rating */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Minimum Rating
          </label>
          <select
            value={filters.minRating || ''}
            onChange={(e) => onChange('minRating', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="">Any Star Rating</option>
            <option value="4.0">★ 4.0 & above</option>
            <option value="4.5">★ 4.5 & above</option>
            <option value="4.8">★ 4.8 Top Rated</option>
          </select>
        </div>
      </div>

      {/* Sliders: Radius & Max Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Distance Radius</span>
            <span className="font-bold text-emerald-700">{filters.radiusKm || 50} km</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={filters.radiusKm || 50}
            onChange={(e) => onChange('radiusKm', e.target.value)}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Max Price per kWh</span>
            <span className="font-bold text-emerald-700">
              {filters.maxPrice ? `₹${filters.maxPrice}` : 'Any Price'}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="35"
            step="1"
            value={filters.maxPrice || 35}
            onChange={(e) => onChange('maxPrice', e.target.value)}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>
      </div>

      {/* Footer bar: Match count & Reset */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
        <span className="font-semibold text-slate-700">
          {isSearching ? 'Searching...' : `Found ${totalResults} available charger${totalResults === 1 ? '' : 's'}`}
        </span>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-slate-600 hover:text-rose-600 font-semibold transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
};
