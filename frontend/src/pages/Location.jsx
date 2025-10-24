import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Globe, Building2 } from 'lucide-react';

const LocationsMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const locations = [
    {
      id: 1,
      city: 'Ottawa',
      country: 'Canada',
      region: 'North America',
      lat: 45.4215,
      lng: -75.6972,
      description: 'Our Canadian headquarters serving North American clients'
    },
    {
      id: 2,
      city: 'Michigan',
      country: 'USA',
      region: 'North America',
      lat: 42.7325,
      lng: -84.5555,
      description: 'Strategic US operations center'
    },
    {
      id: 3,
      city: 'Brussels',
      country: 'Belgium',
      region: 'Europe',
      lat: 50.8503,
      lng: 4.3517,
      description: 'European headquarters and innovation center'
    },
    {
      id: 4,
      city: 'Nairobi',
      country: 'Kenya',
      region: 'Africa',
      lat: -1.2864,
      lng: 36.8172,
      description: 'East African operations and technology hub'
    },
    {
      id: 5,
      city: 'Kigali',
      country: 'Rwanda',
      region: 'Africa',
      lat: -1.9536,
      lng: 30.0606,
      description: 'African innovation hub and regional headquarters'
    }
  ];

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.async = true;
    
    script.onload = () => {
      setMapLoaded(true);
    };
    
    document.body.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = window.L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18
    });

    mapInstanceRef.current = map;

    // Add tile layer (OpenStreetMap)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Custom marker icon
    const customIcon = window.L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative;">
          <div style="position: absolute; top: 0; left: 0; width: 30px; height: 30px; background: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: pulse 2s infinite;"></div>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#3b82f6" stroke="#fff" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3" fill="#fff"></circle>
          </svg>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });

    // Add markers
    locations.forEach(location => {
      const marker = window.L.marker([location.lat, location.lng], {
        icon: customIcon
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: system-ui; padding: 8px;">
          <div style="font-weight: bold; color: #1e40af; font-size: 16px; margin-bottom: 4px;">
            ${location.city}
          </div>
          <div style="color: #64748b; font-size: 14px; margin-bottom: 8px;">
            ${location.country}
          </div>
          <div style="color: #475569; font-size: 13px;">
            ${location.description}
          </div>
        </div>
      `);
    });

    // Add connecting lines between locations
    const latlngs = locations.map(loc => [loc.lat, loc.lng]);
    window.L.polyline(latlngs, {
      color: '#3b82f6',
      weight: 2,
      opacity: 0.5,
      dashArray: '10, 10'
    }).addTo(map);

  }, [mapLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .custom-marker {
          background: none !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>

      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-blue-500/20">
        <div className=" mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">ABY Tech</h1>
          </div>
          <p className="text-blue-200 mt-2">Global Technology Solutions - Operating Worldwide</p>
        </div>
      </div>

      <div className=" mx-auto px-6 md:px-16 py-12">
        {/* Map Container */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-blue-500/20">
          <div className="flex items-center gap-2 mb-8">
            <Globe className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Our Global Presence</h2>
          </div>
          
          {/* Real Map */}
          <div className="relative w-full h-96 bg-slate-900 rounded-xl overflow-hidden border border-blue-500/20">
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center text-blue-400">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <div>Loading map...</div>
                </div>
              </div>
            )}
            <div ref={mapRef} className="w-full h-full"></div>
          </div>

          {/* Locations List */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 rounded-xl border border-blue-500/20 hover:border-blue-400/40 transition-all hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([location.lat, location.lng], 10);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white">{location.city}</h3>
                    <p className="text-blue-300 text-sm">{location.country}</p>
                    <p className="text-slate-400 text-sm mt-2">{location.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-blue-500/20 text-center">
            <div className="text-4xl font-bold text-blue-400">5</div>
            <div className="text-slate-300 mt-2">Global Offices</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-blue-500/20 text-center">
            <div className="text-4xl font-bold text-blue-400">5</div>
            <div className="text-slate-300 mt-2">Countries</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-blue-500/20 text-center">
            <div className="text-4xl font-bold text-blue-400">3</div>
            <div className="text-slate-300 mt-2">Continents</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationsMap;