import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Map } from '../components/Map';
import { ChargerCard } from '../components/ChargerCard';
import { FilterBar } from '../components/FilterBar';
import { BookingModal } from '../components/BookingModal';
import {
  MapPin,
  LocateFixed,
  AlertCircle,
  SlidersHorizontal,
  RefreshCw,
  Search,
  List,
  Map as MapIcon
} from 'lucide-react';

export const FindChargersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const [filters, setFilters] = useState({
    searchQuery: searchParams.get('searchQuery') || '',
    connectorType: searchParams.get('connectorType') || 'All',
    chargingMethod: searchParams.get('chargingMethod') || 'All',
    powerMin: searchParams.get('powerMin') || '',
    powerMax: '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    radiusKm: 50
  });

  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [bookingCharger, setBookingCharger] = useState(null);

  // User Location State
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Bangalore default

  // View Toggle for mobile (Map vs List)
  const [mobileView, setMobileView] = useState('both'); // 'map' | 'list' | 'both'

  // Request browser geolocation
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    setLocationStatus('prompt');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setMapCenter([coords.lat, coords.lng]);
        setLocationStatus('granted');
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setLocationStatus('denied');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Fetch chargers whenever filters or user location changes
  const fetchChargers = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = {
        radiusKm: filters.radiusKm
      };

      if (userLocation) {
        queryParams.lat = userLocation.lat;
        queryParams.lng = userLocation.lng;
      }

      if (filters.searchQuery) queryParams.searchQuery = filters.searchQuery;
      if (filters.connectorType && filters.connectorType !== 'All') queryParams.connectorType = filters.connectorType;
      if (filters.chargingMethod && filters.chargingMethod !== 'All') queryParams.chargingMethod = filters.chargingMethod;
      if (filters.powerMin) queryParams.powerMin = filters.powerMin;
      if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;
      if (filters.minRating) queryParams.minRating = filters.minRating;

      const res = await api.getNearbyChargers(queryParams);
      if (res.success) {
        setChargers(res.chargers || []);
        if (res.center && !userLocation) {
          setMapCenter([res.center.lat, res.center.lng]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load chargers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchChargers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [filters, userLocation]);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      connectorType: 'All',
      chargingMethod: 'All',
      powerMin: '',
      powerMax: '',
      maxPrice: '',
      minRating: '',
      radiusKm: 50
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner / Location Status Alert */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Discover Nearby EV Chargers</span>
          </h1>
          <p className="text-xs text-slate-500">
            {userLocation ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Searching within {filters.radiusKm} km of your GPS location
              </span>
            ) : locationStatus === 'denied' ? (
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Location permission denied. Showing all chargers in Bengaluru region. Enter search below.
              </span>
            ) : (
              'Detecting nearby stations in your city...'
            )}
          </p>
        </div>

        {/* Location Re-detect Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={requestLocation}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="Use current GPS location"
          >
            <LocateFixed className="w-4 h-4 text-emerald-600" />
            <span>Use My GPS</span>
          </button>
        </div>
      </div>

      {/* Filter Bar Component */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalResults={chargers.length}
        isSearching={loading}
      />

      {/* Main Split Layout: Interactive Map + List of Chargers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Interactive Map (Sticky on Desktop) */}
        <div className="lg:col-span-5 h-[420px] lg:h-[calc(100vh-220px)] lg:sticky lg:top-24">
          <Map
            chargers={chargers}
            center={mapCenter}
            userLocation={userLocation}
            selectedCharger={selectedCharger}
            onSelectCharger={(c) => setSelectedCharger(c)}
          />
        </div>

        {/* Charger Cards Grid */}
        <div className="lg:col-span-7 space-y-4">
          
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Scanning verified nearby chargers...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="text-sm font-bold text-rose-900">{error}</p>
              <button
                onClick={fetchChargers}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Retry Search
              </button>
            </div>
          ) : chargers.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No matching chargers found in this radius
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try expanding the distance slider, removing connector filters, or searching for a different city or neighborhood.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {chargers.map((charger) => (
                <ChargerCard
                  key={charger._id}
                  charger={charger}
                  onBookNow={(c) => setBookingCharger(c)}
                />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Booking Modal */}
      {bookingCharger && (
        <BookingModal
          charger={bookingCharger}
          isOpen={!!bookingCharger}
          onClose={() => setBookingCharger(null)}
        />
      )}

    </div>
  );
};
