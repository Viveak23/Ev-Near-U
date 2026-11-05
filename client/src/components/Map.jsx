import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Zap, Navigation, Star, ArrowRight } from 'lucide-react';

// Create custom Leaflet HTML icons for chargers
const createChargerIcon = (charger) => {
  const isDC = charger.chargingMethod === 'DC';
  const colorClass = isDC ? 'bg-sky-600' : 'bg-emerald-600';
  const borderClass = isDC ? 'border-sky-200' : 'border-emerald-200';

  const html = `
    <div class="relative group cursor-pointer">
      <div class="flex items-center justify-center w-10 h-10 rounded-full ${colorClass} text-white shadow-lg border-2 border-white ring-2 ${borderClass} transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-white" viewBox="0 0 24 24">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <div class="absolute -bottom-1 -right-1 px-1 py-0.2 bg-slate-900 text-white text-[9px] font-bold rounded shadow-xs">
        ${charger.powerKW}k
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-charger-pin',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Custom user location pin
const createUserIcon = () => {
  const html = `
    <div class="relative flex items-center justify-center w-6 h-6">
      <div class="absolute w-6 h-6 bg-blue-500 rounded-full opacity-40 animate-ping"></div>
      <div class="relative w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-user-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Component to dynamically adjust map view when center or chargers change
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
};

export const Map = ({
  chargers = [],
  center = [12.9716, 77.5946],
  userLocation = null,
  selectedCharger = null,
  onSelectCharger,
  zoom = 12
}) => {
  const defaultPosition = center || [12.9716, 77.5946];

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer
        center={defaultPosition}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeMapView center={defaultPosition} zoom={zoom} />

        {/* User Location Marker with range radius */}
        {userLocation && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserIcon()}
            >
              <Popup>
                <div className="text-xs font-semibold text-slate-800 p-1">
                  📍 Your Location
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={3000} // 3km radius ring
              pathOptions={{ color: '#059669', fillColor: '#10B981', fillOpacity: 0.08, weight: 1.5 }}
            />
          </>
        )}

        {/* Charger Markers */}
        {chargers.map((charger) => {
          const coords = charger.location?.coordinates;
          if (!coords || coords.length !== 2) return null;
          const [lng, lat] = coords;

          return (
            <Marker
              key={charger._id}
              position={[lat, lng]}
              icon={createChargerIcon(charger)}
              eventHandlers={{
                click: () => onSelectCharger && onSelectCharger(charger)
              }}
            >
              <Popup className="charger-popup">
                <div className="w-56 p-1 text-slate-900">
                  <div className="relative h-24 w-full rounded-lg overflow-hidden mb-2 bg-slate-100">
                    <img
                      src={charger.images?.[0] || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80'}
                      alt={charger.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-white bg-slate-900/80 backdrop-blur">
                      {charger.powerKW} kW {charger.chargingMethod}
                    </div>
                  </div>

                  <h4 className="font-bold text-xs line-clamp-1 text-slate-900">
                    {charger.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-1">
                    {charger.approximateArea || charger.address?.city}
                  </p>

                  <div className="flex items-center justify-between text-xs my-1.5 pt-1 border-t border-slate-100">
                    <div className="font-extrabold text-emerald-700">
                      ₹{charger.pricing?.pricePerKWh}
                      <span className="text-[10px] text-slate-500 font-normal"> / kWh</span>
                    </div>
                    {charger.distanceKm !== undefined && (
                      <span className="text-[10px] font-semibold text-slate-500">
                        {charger.distanceKm} km away
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/charger/${charger._id}`}
                    className="mt-2 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition shadow-sm text-center"
                  >
                    <span>View & Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
