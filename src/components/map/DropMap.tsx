// src/components/map/DropMap.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuthStore } from '@/stores';
import { useLiveLocations } from '@/hooks/realtime/useLiveLocations';
import { useDrops } from '@/hooks/useDrops';
import { DropperTrackingControl } from '@/components/dropper/DropperTrackingControl';
import { DropStatusBadge } from '@/components/drops/DropStatusBadge';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { Search, X, Crosshair, MapPin, User, Navigation, Layers } from 'lucide-react';
import type { Drop } from '@/types/domain';

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Map Controller for smooth setView transitions
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface DropMapProps {
  drops?: Drop[];
  height?: string;
}

type MapStyle = 'street' | 'satellite' | 'tactical';

const MAP_STYLE_CONFIGS = {
  street: {
    name: 'STREET',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    name: 'SATELLITE',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS, and the GIS User Community',
  },
  tactical: {
    name: 'TACTICAL',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

export default function DropMap({ drops: initialDrops, height = '600px' }: DropMapProps) {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  // === ALL HOOKS AT TOP LEVEL ===
  const isSuperAdmin = profile?.role === 'super_admin';
  const isDropper = profile?.role === 'dropper';

  // Always load live drops and locations
  const { drops: fetchedDrops } = useDrops();
  const defaultDrops = initialDrops || fetchedDrops || [];
  
  const { locations: liveLocations, status: liveStatus } = useLiveLocations();

  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  // Map state controlling actual map bounds dynamically
  const [mapCenter, setMapCenter] = useState<[number, number]>([15.4865, 120.9734]);
  const [mapZoom, setMapZoom] = useState<number>(13);

  // Map Style State (defaults to street style now to respect "no black map as default" choice)
  const [mapStyle, setMapStyle] = useState<MapStyle>('street');

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(coords);
        setMapCenter(coords);
      });
    }
  }, []);

  // === Handlers ===
  const handleTrackingToggle = (isTracking: boolean, drop?: Drop) => {
    if (isTracking && drop) {
      setSelectedDrop(drop);
    } else {
      setSelectedDrop(null);
    }
  };

  // Filter drops based on search query (by Name / Notes / ID / Status)
  const filteredDrops = defaultDrops.filter((drop) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    
    // Safety fallback for empty string values
    const idMatch = (drop.id || '').toLowerCase().includes(term);
    const titleMatch = (drop.title || '').toLowerCase().includes(term);
    const notesMatch = (drop.notes_encrypted || '').toLowerCase().includes(term);
    const statusMatch = (drop.status || '').toLowerCase().includes(term);

    return idMatch || titleMatch || notesMatch || statusMatch;
  });

  // Filter live agents/users on the map
  const filteredLiveLocations = Object.entries(liveLocations).filter(([userId, locs]) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    
    const idMatch = userId.toLowerCase().includes(term);
    const descriptionMatch = 'agent'.includes(term) || 'field'.includes(term);
    
    return idMatch || descriptionMatch;
  });

  // Perform smooth pan and zoom focusing on a specific target
  const handleLocateTarget = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(16); // Close-up focus
  };

  return (
    <ErrorBoundary fallback={<div style={{ height }} className="w-full bg-zinc-900 flex items-center justify-center text-red-500 font-mono">MAP_RENDER_ERROR</div>}>
      <div style={{ height }} className="relative w-full rounded-2xl overflow-hidden border border-zinc-805 bg-black">
        
        {/* === TACTICAL INTEGRATED CONTROL BAR === */}
        <div className="absolute top-4 right-4 z-[1000] pointer-events-auto flex flex-col items-end gap-1.5 max-w-[92%] sm:max-w-none">
          <div className="flex items-center gap-1.5 bg-slate-950/95 backdrop-blur-md border border-[#106011]/80 rounded-xl p-1 shadow-[0_0_20px_rgba(16,96,17,0.4)] transition-all duration-300">
            
            {/* Search Input Section */}
            <div className="flex items-center px-1.5 py-1 min-w-[140px] sm:min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#0ad111] mr-1.5 shrink-0 animate-pulse" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH COORDINATE OR ID..."
                className="w-full bg-transparent text-[#0ad111] font-mono text-[8px] sm:text-[10px] placeholder:text-[#106011]/40 focus:outline-none uppercase tracking-widest"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-red-400 p-0.5 focus:outline-none shrink-0"
                  title="Clear Query"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                userPosition && (
                  <button
                    onClick={() => handleLocateTarget(userPosition[0], userPosition[1])}
                    className="text-[#106011] hover:text-[#0ad111] p-0.5 transition-colors shrink-0"
                    title="Focus Live Location"
                  >
                    <Navigation className="w-3 h-3" />
                  </button>
                )
              )}
            </div>

            {/* Vertical Divider Line */}
            <div className="h-5 w-[1px] bg-[#106011]/30" />

            {/* Map Style Selector Section */}
            <div className="flex items-center gap-1">
              <div className="p-1 px-1.5 text-[#0ad111] flex items-center gap-1 font-mono text-[8px] sm:text-[9px] tracking-widest font-black uppercase">
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden md:inline">STYLE</span>
              </div>
              <div className="h-4 w-[1px] bg-[#106011]/30 mr-1 hidden md:block" />
              {(['street', 'satellite', 'tactical'] as MapStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setMapStyle(style)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-mono text-[8px] sm:text-[9px] font-bold tracking-widest transition-all duration-300 ${
                    mapStyle === style
                      ? 'bg-[#106011] text-black shadow-[0_0_10px_rgba(16,96,17,0.5)] font-black'
                      : 'text-[#106011]/70 hover:text-[#0ad111] hover:bg-[#106011]/15'
                  }`}
                >
                  {style.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Matches dropdown */}
          {searchQuery && (
            <div className="w-full sm:w-[320px] bg-slate-950/95 backdrop-blur-md border border-[#106011]/80 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.8)] z-[1010]">
              <div className="max-h-[180px] overflow-y-auto divide-y divide-[#106011]/20 font-mono text-[10px] custom-scrollbar bg-slate-950">
                {/* Visual Scanner Bar when queries are evaluated */}
                <div className="h-0.5 bg-gradient-to-r from-transparent via-[#0ad111] to-transparent animate-pulse" />

                {filteredDrops.length === 0 && filteredLiveLocations.length === 0 ? (
                  <div className="p-3 text-slate-500 text-center uppercase tracking-widest text-[9px]">
                    NO_TARGETS_ACQUIRED
                  </div>
                ) : (
                  <>
                    {/* Drops list */}
                    {filteredDrops.map((drop) => (
                      <button
                        key={drop.id}
                        onClick={() => handleLocateTarget(drop.lat, drop.lng)}
                        className="w-full text-left px-3 py-2 hover:bg-[#106011]/15 text-slate-300 hover:text-[#0ad111] transition-all flex items-center justify-between"
                      >
                        <div className="flex flex-col gap-0.5 pr-2 truncate">
                          <span className="font-bold tracking-wider text-slate-100 truncate flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                            {drop.title || 'UNNAMED_DROP'}
                          </span>
                          <span className="text-[8px] text-slate-500 truncate">ID: {drop.id}</span>
                        </div>
                        <span className="text-[8px] font-bold text-amber-500 border border-amber-600/30 px-1.5 py-0.5 rounded capitalize shrink-0">
                          {drop.status}
                        </span>
                      </button>
                    ))}

                    {/* Agent Locations list */}
                    {isSuperAdmin && filteredLiveLocations.map(([userId, locs]) => {
                      if (!locs || locs.length === 0) return null;
                      const latest = locs[0];
                      return (
                        <button
                          key={userId}
                          onClick={() => handleLocateTarget(latest.lat, latest.lng)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-950/20 text-slate-300 hover:text-blue-400 transition-all flex items-center justify-between"
                        >
                          <div className="flex flex-col gap-0.5 pr-2 truncate">
                            <span className="font-bold tracking-wider text-slate-100 truncate flex items-center gap-1">
                              <User className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                              AGENT_{userId.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[8px] text-slate-500 truncate">Live Precision Grid</span>
                          </div>
                          <span className="text-[8px] font-bold text-blue-500 border border-blue-600/30 px-1.5 py-0.5 rounded uppercase shrink-0">
                            ACTIVE
                          </span>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map Container */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            key={mapStyle}
            url={MAP_STYLE_CONFIGS[mapStyle].url}
            attribution={MAP_STYLE_CONFIGS[mapStyle].attribution}
          />

          {/* Sync our Map center and zoom reactively */}
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* User Location Marker */}
          {userPosition && (
            <Marker 
              position={userPosition}
              icon={L.divIcon({
                className: 'user-location-marker',
                html: `
                  <div class="relative flex items-center justify-center">
                    <div class="absolute w-6 h-6 rounded-full bg-[#0ad111]/30 animate-ping"></div>
                    <div class="w-3.5 h-3.5 rounded-full bg-[#0ad111] border border-black shadow-[0_0_8px_#0ad111]"></div>
                  </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            >
              <Popup>
                <div className="text-black font-mono text-[10px]">
                  <strong>MY_GPS_COORDINATE</strong><br />
                  Accuracy: High Precision Ready
                </div>
              </Popup>
            </Marker>
          )}

          {/* Droppers: Show assigned drops + tracking control */}
          {isDropper &&
            filteredDrops
              .filter((d) => d.assigned_to === profile?.id && d.status === 'active')
              .map((drop) => (
                <Marker key={drop.id} position={[drop.lat, drop.lng]}>
                  <Popup>
                    <div className="text-black min-w-[240px]">
                      <div className="font-bold mb-1">{drop.title}</div>
                      <div className="text-xs text-zinc-600 mb-3">Status: {drop.status}</div>

                      <DropperTrackingControl
                        drop={drop}
                        onTrackingChange={(tracking) => handleTrackingToggle(tracking, drop)}
                      />
                    </div>
                  </Popup>
                </Marker>
              ))}

          {/* Super Admin: Live agent locations (filtered) */}
          {isSuperAdmin &&
            filteredLiveLocations.map(([userId, locs]) => {
              if (!locs || locs.length === 0) return null;
              const latest = locs[0];

              return (
                <Marker key={userId} position={[latest.lat, latest.lng]}>
                  <Popup>
                    <div className="text-black">
                      <strong>AGENT LIVE</strong><br />
                      User: {userId.slice(0, 8)}...<br />
                      Accuracy: ±{Math.round(latest.accuracy || 0)}m
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Clients: Show assigned drops (filtered) */}
          {!isSuperAdmin && !isDropper && filteredDrops.length > 0 && (
            filteredDrops
              .filter(d => d.assigned_to === profile?.id)
              .map((drop) => (
                <Marker key={drop.id} position={[drop.lat, drop.lng]}>
                  <Popup>
                    <div className="text-black min-w-[240px]">
                      <div className="font-bold text-lg mb-1">{drop.title}</div>
                      <div className="mb-3">
                        <DropStatusBadge status={drop.status} />
                      </div>
                      {drop.status === 'active' && (
                        <button
                          onClick={() => navigate(`/claim/${drop.id}`)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-black rounded-xl font-mono text-sm tracking-widest"
                        >
                          VIEW & CLAIM DROP
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))
          )}
        </MapContainer>

        {/* Status indicators */}
        {isSuperAdmin && liveStatus.mode === 'polling' && (
          <div className="absolute top-4 left-4 bg-black/80 text-amber-400 px-3 py-1 rounded text-xs font-mono z-[500]">
            FALLBACK MODE (Polling)
          </div>
        )}

        {isDropper && selectedDrop && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-emerald-400 px-4 py-1 rounded-full text-xs font-mono tracking-widest z-[500] border border-emerald-500">
            BROADCASTING • {selectedDrop.title}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
