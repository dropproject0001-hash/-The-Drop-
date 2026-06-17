// src/components/map/DropMap.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuthStore } from '@/stores';
import { useLocationOutboxStatus } from '@/hooks/useLocationOutboxStatus';
import { useLiveLocations } from '@/hooks/realtime/useLiveLocations';
import { useLiveDrops } from '@/hooks/realtime/useLiveDrops';
import { DropperTrackingControl } from '@/components/dropper/DropperTrackingControl';
import { DropStatusBadge } from '@/components/drops/DropStatusBadge';
import { CompassOverlay } from '@/components/map/CompassOverlay';
import { MapMarker } from '@/components/map/MapMarker';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { Search, X, Crosshair, MapPin, User, Navigation, Layers, Maximize, Minimize, FileEdit, Trash2 } from 'lucide-react';
import type { Drop } from '@/types/domain';
import { CachedTileLayer } from '@/components/map/CachedTileLayer';
import { TileCacheService } from '@/services/map/TileCacheService';
import { supabase } from '@/lib/supabase';

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Static High-Performance DivIcon Definitions
const UserLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-6 h-6 rounded-full bg-[#0ad111]/30 animate-ping"></div>
      <div class="w-3.5 h-3.5 rounded-full bg-[#0ad111] border border-black shadow-[0_0_8px_#0ad111]"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const AgentLiveIcon = L.divIcon({
  className: 'agent-location-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-6 h-6 rounded-full bg-blue-500/30 animate-ping"></div>
      <div class="w-3.5 h-3.5 rounded-full bg-blue-400 border border-black shadow-[0_0_8px_#3b82f6]"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const createDropIcon = (dropType: string) => L.divIcon({
  className: 'custom-drop-icon outline-none border-none border-0',
  html: `
    <div class="relative group cursor-pointer flex items-center justify-center w-10 h-10 -mt-5 -ml-5">
      <div class="text-3xl filter drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-bounce">
        📍
      </div>
      <div class="absolute -bottom-1 w-4 h-1 bg-black/60 blur-[2px] rounded-[100%]"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
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
  const isSuperAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';
  const isDropper = profile?.role === 'dropper';

  // Always load live drops and locations
  const { drops: fetchedDrops } = useLiveDrops();
  const defaultDrops = initialDrops || fetchedDrops || [];
  
  const { locations: liveLocations, status: liveStatus } = useLiveLocations();

  const { isSyncing: outboxSaving, queueSize: outboxQueueSize, flush: flushOutbox } = useLocationOutboxStatus();
  const [browserOnline, setBrowserOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(navigator.onLine);
    const handleOffline = () => setBrowserOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- DIAGNOSTIC LOGGING FOR GODS EYE ---
  useEffect(() => {
    if (isSuperAdmin) {
      console.log('[GodsEye] Initializing direct real-time diagnostic subscription for "drops" table');
      const subscription = supabase
        .channel('diagnostic_drops_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'drops' }, (payload: any) => {
          console.log('%c[GodsEye DIAGNOSTIC] RAW REAL-TIME PAYLOAD RECEIVED:', 'color: #0ad111; font-weight: bold; background: #000; padding: 4px;');
          console.dir(payload);
          console.log(`[GodsEye] Type: ${payload.eventType}, Drop ID: ${payload.new?.id || payload.old?.id}, Status: ${payload.new?.status}`);
        })
        .subscribe((status: string) => {
          console.log(`[GodsEye DIAGNOSTIC] Subscription status: ${status}`);
        });
        
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isSuperAdmin]);

  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [userAccuracy, setUserAccuracy] = useState<number | null>(null);

  // Map state controlling actual map bounds dynamically
  const [mapCenter, setMapCenter] = useState<[number, number]>([15.4865, 120.9734]);
  const [mapZoom, setMapZoom] = useState<number>(13);

  // Map Style State (defaults to street style now to respect "no black map as default" choice)
  const [mapStyle, setMapStyle] = useState<MapStyle>('street');

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Ephemeral notes state
  const [showNotes, setShowNotes] = useState(false);
  const [ephemeralNote, setEphemeralNote] = useState('');

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [cacheStats, setCacheStats] = useState<{ count: number; sizeMb: number }>({ count: 0, sizeMb: 0 });
  const [seedingProgress, setSeedingProgress] = useState<{ current: number; total: number; msg: string } | null>(null);

  const fetchCacheStats = async () => {
    const stats = await TileCacheService.getCacheStats();
    setCacheStats(stats);
  };

  useEffect(() => {
    fetchCacheStats();
  }, []);

  const handleSeedArea = async () => {
    if (seedingProgress) return;
    setSeedingProgress({ current: 0, total: 0, msg: "Initializing seed..." });
    try {
      const zLevels = [13, 14, 15, 16]; // Critical zoom levels for high-fidelity offline map capability
      const styleUrl = MAP_STYLE_CONFIGS[mapStyle].url;
      const subdomains = mapStyle === 'tactical' ? 'abcd' : 'abc';
      
      await TileCacheService.seedCacheForArea(
        mapCenter[0],
        mapCenter[1],
        1.5, // 1.5 km buffer radius
        zLevels,
        styleUrl,
        subdomains,
        (current, total, progressMsg) => {
          setSeedingProgress({ current, total, msg: progressMsg });
        }
      );
      
      await fetchCacheStats();
      // Auto-clear progress after 3 seconds
      setTimeout(() => setSeedingProgress(null), 3000);
    } catch (err) {
      console.error("[DropMap] Failed to seed map tiles:", err);
      setSeedingProgress(null);
    }
  };

  const handleClearCache = async () => {
    await TileCacheService.clearCache();
    await fetchCacheStats();
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    const handleSuccess = (pos: GeolocationPosition) => {
      const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
      setUserPosition(coords);
      setUserAccuracy(pos.coords.accuracy);
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn('[DropMap] Geolocation stream active lookup warning:', err);
    };

    // Fast initial coordinates resolution
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(coords);
        setUserAccuracy(pos.coords.accuracy);
        setMapCenter(coords);
      },
      handleError,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );

    // Watch dynamic telemetry accuracy updates
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // === Handlers ===
  const handleTrackingToggle = (isTracking: boolean, drop?: Drop) => {
    if (isTracking && drop) {
      setSelectedDrop(drop);
    } else {
      setSelectedDrop(null);
    }
  };

  // Filter drops based on search query (by Name / Notes / ID / Status) - MEMOIZED to reduce rendering computation
  const filteredDrops = useMemo(() => {
    return defaultDrops.filter((drop) => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      
      // Safety fallback for empty string values
      const idMatch = (drop.id || '').toLowerCase().includes(term);
      const titleMatch = (drop.title || '').toLowerCase().includes(term);
      const notesMatch = (drop.notes_encrypted || '').toLowerCase().includes(term);
      const statusMatch = (drop.status || '').toLowerCase().includes(term);

      return idMatch || titleMatch || notesMatch || statusMatch;
    });
  }, [defaultDrops, searchQuery]);

  // Filter live agents/users on the map - MEMOIZED to avoid key scanning on every frame rendering
  const filteredLiveLocations = useMemo(() => {
    return Object.entries(liveLocations).filter(([userId, locs]) => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      
      const idMatch = userId.toLowerCase().includes(term);
      const descriptionMatch = 'agent'.includes(term) || 'field'.includes(term);
      
      return idMatch || descriptionMatch;
    });
  }, [liveLocations, searchQuery]);

  // Perform smooth pan and zoom focusing on a specific target
  const handleLocateTarget = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(16); // Close-up focus
  };

  const activeTargetDrop = useMemo(() => {
    return selectedDrop || 
      (filteredDrops.find(d => d.assigned_to === profile?.id && d.status === 'active')) || 
      selectedDrop;
  }, [selectedDrop, filteredDrops, profile?.id]);

  return (
    <ErrorBoundary fallback={<div style={{ height }} className="w-full bg-zinc-900 flex items-center justify-center text-red-500 font-mono">MAP_RENDER_ERROR</div>}>
      <div style={{ height }} className="relative w-full rounded-2xl overflow-hidden border border-zinc-805 bg-black">
        
        {/* === TACTICAL INTEGRATED CONTROL BAR === */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[1000] pointer-events-auto flex flex-col items-end gap-2 max-w-[88%] sm:max-w-none">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1.5 bg-slate-950/95 backdrop-blur-md border border-[#106011]/80 rounded-xl p-2 sm:p-1 shadow-[0_0_20px_rgba(16,96,17,0.4)] transition-all duration-300 w-full sm:w-auto">
            
            {/* Search Input Section */}
            <div className="flex items-center px-1.5 py-1 flex-1 sm:flex-initial min-w-[120px] xs:min-w-[150px] sm:min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#0ad111] mr-1.5 shrink-0 animate-pulse" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH COORDINATE OR ID..."
                className="w-full bg-transparent text-[#0ad111] font-mono text-[9px] sm:text-[10px] placeholder:text-[#106011]/40 focus:outline-none uppercase tracking-widest"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-red-400 p-0.5 focus:outline-none shrink-0 ml-1"
                  title="Clear Query"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                userPosition && (
                  <button
                    onClick={() => handleLocateTarget(userPosition[0], userPosition[1])}
                    className="text-[#106011] hover:text-[#0ad111] p-0.5 transition-colors shrink-0 ml-1"
                    title="Focus Live Location"
                  >
                    <Navigation className="w-3 h-3" />
                  </button>
                )
              )}
            </div>

            {/* Responsive Divider Line */}
            <div className="hidden sm:block h-5 w-[1px] bg-[#106011]/30 align-middle shrink-0" />
            <div className="block sm:hidden h-[1px] w-full bg-[#106011]/20 my-0.5 shrink-0" />

            {/* Map Style Selector Section */}
            <div className="flex items-center justify-between sm:justify-start gap-1 flex-1 sm:flex-initial">
              <div className="p-1 px-1 text-[#0ad111] flex items-center gap-1 font-mono text-[8px] sm:text-[9px] tracking-widest font-black uppercase shrink-0">
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">STYLE</span>
              </div>
              <div className="h-4 w-[1px] bg-[#106011]/30 mr-1 hidden sm:block shrink-0" />
              <div className="flex items-center gap-1 flex-1 sm:flex-initial">
                {(['street', 'satellite', 'tactical'] as MapStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setMapStyle(style)}
                    className={`flex-1 sm:flex-initial px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-mono text-[8px] sm:text-[9px] font-bold tracking-widest transition-all duration-300 text-center uppercase whitespace-nowrap ${
                      mapStyle === style
                        ? 'bg-[#106011] text-black shadow-[0_0_10px_rgba(16,96,17,0.5)] font-black'
                        : 'text-[#106011]/70 hover:text-[#0ad111] hover:bg-[#106011]/15'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>

              {/* Field Notes Toggle Button */}
              <div className="h-4 w-[1px] bg-[#106011]/30 ml-1 mr-0.5 hidden sm:block shrink-0" />
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`text-[#106011]/70 hover:text-[#0ad111] hover:bg-[#106011]/15 p-1 rounded transition-colors shrink-0 outline-none ${showNotes ? 'bg-[#106011]/20 text-[#0ad111]' : ''}`}
                title="Field Notes"
              >
                <FileEdit className="w-3.5 h-3.5" />
              </button>

              {/* Fullscreen Toggle Button */}
              <div className="h-4 w-[1px] bg-[#106011]/30 ml-1 mr-0.5 hidden sm:block shrink-0" />
              <button
                onClick={toggleFullscreen}
                className="text-[#106011]/70 hover:text-[#0ad111] hover:bg-[#106011]/15 p-1 rounded transition-colors shrink-0 outline-none"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </button>
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
          <CachedTileLayer
            key={mapStyle}
            url={MAP_STYLE_CONFIGS[mapStyle].url}
            attribution={MAP_STYLE_CONFIGS[mapStyle].attribution}
            subdomains={mapStyle === 'tactical' ? 'abcd' : 'abc'}
          />

          {/* Sync our Map center and zoom reactively */}
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* User Location Marker */}
          {userPosition && (
            <Marker 
              position={userPosition}
              icon={UserLocationIcon}
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
                <MapMarker
                  key={drop.id}
                  position={[drop.lat, drop.lng]}
                  status="active"
                  type="drop"
                  label={drop.title}
                  id={drop.id}
                  description={drop.notes_encrypted || "Assigned tactical drop."}
                >
                  <div className="text-[#0ad111] font-mono text-xs space-y-3 p-1">
                    <div className="flex items-center justify-between border-b border-[#106011]/30 pb-2 mb-1">
                      <span className="font-bold tracking-wider">{drop.title}</span>
                      <span className="text-[8px] text-zinc-500">ID: {drop.id.slice(0,8)}</span>
                    </div>
                    <div className="text-[10px] text-slate-300">Status: <span className="text-[#0ad111] uppercase font-bold">{drop.status}</span></div>

                    <DropperTrackingControl
                      drop={drop}
                      onTrackingChange={(tracking) => handleTrackingToggle(tracking, drop)}
                    />
                  </div>
                </MapMarker>
              ))}

          {/* Super Admin: Live agent locations (filtered) */}
          {isSuperAdmin && (
            <>
              {filteredLiveLocations.map(([userId, locs]) => {
                if (!locs || locs.length === 0) return null;
                const latest = locs[0];

                return (
                  <Marker key={userId} position={[latest.lat, latest.lng]} icon={AgentLiveIcon}>
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

              {/* Super Admin: Pinned Active Drops */}
              {filteredDrops.filter(d => d.status === 'active').map(drop => (
                <Marker key={drop.id} position={[drop.lat, drop.lng]} icon={createDropIcon('active')}>
                  <Popup className="drop-map-popup">
                    <div className="font-mono text-xs text-black min-w-[200px]">
                      <div className="font-bold border-b border-zinc-200 pb-2 mb-2 uppercase tracking-wide flex justify-between items-center">
                        <span>DROP PRODUCT</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded">{drop.status}</span>
                      </div>
                      
                      {drop.photo_url && (
                        <div className="mb-2 w-full h-24 bg-zinc-100 border border-zinc-200 rounded overflow-hidden">
                          <img src={drop.photo_url} alt="Drop Product Payload" className="w-full h-full object-cover" />
                        </div>
                      )}
                      
                      <div className="mb-1"><strong>PRODUCT TITLE:</strong> {drop.title}</div>
                      
                      <div className="mb-1 truncate text-[10px]"><strong>COORDS:</strong> {drop.lat.toFixed(5)}, {drop.lng.toFixed(5)}</div>
                      
                      <div className="mt-2 pt-2 border-t border-zinc-200 flex flex-col gap-1">
                        <div className="text-[10px] truncate"><strong>DROPPER:</strong> {drop.created_by.slice(0,8)}...</div>
                        <div className="text-[10px] truncate"><strong>ASSIGNED:</strong> {drop.assigned_to?.slice(0,8)}...</div>
                        <div className="text-[9px] text-zinc-500 mt-1 uppercase">CREATED: {new Date(drop.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </>
          )}

          {/* Clients: Show assigned drops (filtered) */}
          {!isSuperAdmin && !isDropper && filteredDrops.length > 0 && (
            filteredDrops
              .filter(d => d.assigned_to === profile?.id)
              .map((drop) => (
                <MapMarker
                  key={drop.id}
                  position={[drop.lat, drop.lng]}
                  status={drop.status === 'claimed' ? 'completed' : drop.status === 'expired' ? 'alert' : 'active'}
                  type="drop"
                  label={drop.title}
                  id={drop.id}
                  description={drop.notes_encrypted || "Assigned tactical drop."}
                >
                  <div className="text-[#0ad111] font-mono text-xs space-y-3 p-1">
                    <div className="flex items-center justify-between border-b border-[#106011]/30 pb-2 mb-1">
                      <span className="font-bold tracking-wider">{drop.title}</span>
                      <span className="text-[8px] text-zinc-500">ID: {drop.id.slice(0,8)}</span>
                    </div>
                    <div className="mb-3 flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500 font-bold uppercase">SEC_STATUS:</span>
                      <DropStatusBadge status={drop.status} />
                    </div>
                    {drop.status === 'active' && (
                      <button
                        onClick={() => navigate(`/claim/${drop.id}`)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 hover:brightness-110 active:scale-95 text-black rounded-lg font-mono text-xs tracking-wider transition-all cursor-pointer font-bold uppercase"
                      >
                        VIEW & CLAIM DROP
                      </button>
                    )}
                  </div>
                </MapMarker>
              ))
          )}
        </MapContainer>

        {/* === GPS PRECISION METER OVERLAY === */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[1000] pointer-events-auto max-w-[280px]">
          <div className="bg-slate-950/90 backdrop-blur-md border border-[#106011]/80 rounded-xl p-2.5 sm:p-3 shadow-[0_0_20px_rgba(16,96,17,0.4)] flex flex-col gap-1.5 font-mono select-none">
            <div className="flex items-center gap-1.5 border-b border-[#106011]/20 pb-1.5">
              <div className="relative">
                <span className={`absolute -inset-0.5 rounded-full blur-[1px] ${
                  userAccuracy === null ? 'bg-red-500 animate-pulse' :
                  userAccuracy <= 5 ? 'bg-[#0ad111] animate-ping' :
                  userAccuracy <= 15 ? 'bg-emerald-400 animate-pulse' :
                  userAccuracy <= 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`} style={{ animationDuration: '2s' }} />
                <span className={`relative w-2 h-2 rounded-full block border border-black ${
                  userAccuracy === null ? 'bg-red-600' :
                  userAccuracy <= 5 ? 'bg-[#0ad111]' :
                  userAccuracy <= 15 ? 'bg-emerald-400' :
                  userAccuracy <= 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              <span className="text-[9px] font-black tracking-widest text-[#106011]">SYS_GPS_INTEGRITY</span>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] tracking-wider text-slate-500 uppercase">GPS_SIGNAL_METRE</span>
                {userAccuracy !== null ? (
                  <span className={`text-[15px] font-bold tracking-tight leading-none ${
                    userAccuracy <= 5 ? 'text-[#0ad111]' :
                    userAccuracy <= 15 ? 'text-emerald-400' :
                    userAccuracy <= 30 ? 'text-yellow-500' : 'text-red-400'
                  }`}>
                    ±{userAccuracy.toFixed(1)} <span className="text-[9px] font-normal uppercase tracking-wider text-slate-400">meters</span>
                  </span>
                ) : (
                  <span className="text-[13px] text-red-500 tracking-widest uppercase animate-pulse leading-none">SEARCHING...</span>
                )}
              </div>

              {/* Dynamic level bars visualizer */}
              <div className="flex items-end gap-0.5 h-3">
                <div className={`w-1 rounded-sm ${userAccuracy !== null ? 'h-1.5 bg-[#106011]' : 'h-1.5 bg-zinc-800'}`} />
                <div className={`w-1 rounded-sm ${userAccuracy !== null && userAccuracy <= 30 ? 'h-2 bg-[#106011]' : 'h-2 bg-zinc-800'}`} />
                <div className={`w-1 rounded-sm ${userAccuracy !== null && userAccuracy <= 15 ? 'h-2.5 bg-emerald-500' : 'h-2.5 bg-zinc-800'}`} />
                <div className={`w-1 rounded-sm ${userAccuracy !== null && userAccuracy <= 5 ? 'h-3.5 bg-[#0ad111]' : 'h-3.5 bg-zinc-800'}`} />
              </div>
            </div>

            <div className="flex flex-col pt-1 border-t border-[#106011]/10 text-[8px] tracking-wider leading-relaxed">
              <span className={`uppercase font-bold ${
                userAccuracy === null ? 'text-red-500' :
                userAccuracy <= 5 ? 'text-[#0ad111]' :
                userAccuracy <= 15 ? 'text-emerald-400' :
                userAccuracy <= 30 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {userAccuracy === null ? 'NO LOCK • SECURE EXT_DEV' :
                 userAccuracy <= 5 ? 'OPTIMAL DETECT • DROP LOCKED' :
                 userAccuracy <= 15 ? 'ADEQUATE DISPATCH LOCK APPROVED' :
                 userAccuracy <= 30 ? 'MARGINAL DRIFT • RETRACKING' :
                 'DEGRADED OPTICS • ACCESS HIGHER'}
              </span>
              <span className="text-[7px] text-slate-500 mt-0.5 tracking-normal leading-tight">
                {userAccuracy === null 
                  ? 'Request device geolocation configuration.' 
                  : userAccuracy <= 15 
                    ? 'GPS threshold aligned. Drop execution highly accurate.' 
                    : 'Sub-optimal lock. Try shifting position or open sky.'}
              </span>
            </div>

            {/* === BACKGROUND OUTBOX TELEMETRY === */}
            <div className="border-t border-[#106011]/25 pt-2 mt-1 flex flex-col gap-1 select-none">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-[9px] font-black tracking-widest text-[#106011]">SYS_DATA_OUTBOX</span>
                <span className={`text-[7px] font-mono px-1 rounded uppercase tracking-wider ${
                  !browserOnline 
                    ? 'bg-red-950/40 text-red-500 border border-red-900/30 animate-pulse' 
                    : 'bg-[#106011]/15 text-[#0ad111] border border-[#106011]/30'
                }`}>
                  {browserOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2.5 mt-0.5">
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] tracking-wider text-slate-500 uppercase">SYNC_STATUS</span>
                  {outboxQueueSize > 0 ? (
                    <span className="text-[12px] font-bold text-amber-500 tracking-tight leading-none truncate uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                      BUFFERED ({outboxQueueSize} PTS)
                    </span>
                  ) : (
                    <span className="text-[12px] font-bold text-[#0ad111] tracking-tight leading-none truncate uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0ad111] shrink-0" />
                      TELEMETRY SYNCED
                    </span>
                  )}
                </div>

                {outboxQueueSize > 0 && browserOnline ? (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await flushOutbox();
                    }}
                    disabled={outboxSaving}
                    className={`px-1.5 py-0.5 rounded border border-[#0ad111]/40 hover:border-[#0ad111] bg-[#106011]/20 hover:bg-[#106011]/40 text-[#0ad111] font-bold font-mono text-[8px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      outboxSaving ? 'animate-pulse pointer-events-none text-slate-500 border-zinc-800 bg-transparent' : ''
                    }`}
                  >
                    {outboxSaving ? 'FLUSHING...' : 'FORCE SYNC'}
                  </button>
                ) : outboxQueueSize > 0 && !browserOnline ? (
                  <span className="text-[7px] text-red-500 uppercase font-bold tracking-wider animate-pulse">QUEUED_OFFLINE</span>
                ) : (
                  <span className="text-[8.5px] text-[#106011] tracking-widest font-black uppercase">STANDBY</span>
                )}
              </div>

              <div className="text-[7.5px] text-slate-500 mt-1 leading-tight select-text">
                {outboxQueueSize > 0 
                  ? !browserOnline 
                    ? 'Device connection lost. Outbox telemetry holds local cache.'
                    : 'Unsynchronized field locations queued. Sync now.'
                  : 'Constant handshake active. HQ tracking connection green.'}
              </div>
            </div>

            {/* === TACTICAL MAP TILE CACHE === */}
            <div className="border-t border-[#106011]/25 pt-2 mt-1 flex flex-col gap-1 select-none">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-[9px] font-black tracking-widest text-[#106011]">SYS_MAP_CACHE</span>
                <span className="text-[7px] text-slate-400 font-mono">
                  {cacheStats.count} TILES ({cacheStats.sizeMb} MB)
                </span>
              </div>

              {seedingProgress ? (
                <div className="flex flex-col gap-1 mt-0.5">
                  <div className="flex justify-between items-center text-[7px] font-mono text-amber-500 animate-pulse">
                    <span className="truncate max-w-[170px]">{seedingProgress.msg}</span>
                    <span>{seedingProgress.total > 0 ? Math.round((seedingProgress.current / seedingProgress.total) * 100) : 0}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 border border-[#106011]/20 rounded overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-300" 
                      style={{ width: `${seedingProgress.total > 0 ? (seedingProgress.current / seedingProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-1.5 mt-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSeedArea();
                    }}
                    className="flex-1 py-0.5 bg-[#106011]/15 hover:bg-[#106011]/30 border border-[#106011]/30 hover:border-[#0ad111]/80 text-[#0ad111] font-bold font-mono text-[7px] uppercase tracking-wider transition-all rounded cursor-pointer"
                    title="Pre-cache map zoom levels around map center"
                  >
                    SEED ZONE
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Clear local tactical tile cache?")) {
                        handleClearCache();
                      }
                    }}
                    disabled={cacheStats.count === 0}
                    className="px-1.5 py-0.5 border border-red-950/80 bg-red-950/10 hover:bg-red-950/30 text-red-500 disabled:opacity-30 disabled:pointer-events-none font-bold font-mono text-[7px] uppercase tracking-wider transition-all rounded cursor-pointer"
                    title="Remove all offline cached tiles"
                  >
                    WIPE
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

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

        {/* Tactical Compass Overlay */}
        {userPosition && activeTargetDrop && (
          <CompassOverlay userPosition={userPosition} targetDrop={activeTargetDrop} />
        )}

        {/* Ephemeral Notepad Overlay */}
        {showNotes && (
          <div className="absolute top-16 right-3 sm:right-4 w-[280px] z-[900] pointer-events-auto shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            <div className="bg-slate-950/95 backdrop-blur-md border border-[#106011]/80 rounded-xl overflow-hidden flex flex-col">
              <div className="p-2 border-b border-[#106011]/30 flex justify-between items-center bg-[#106011]/10">
                 <span className="text-[9px] font-mono font-black text-[#0ad111] tracking-widest uppercase">Field Notes / Active</span>
                 <div className="flex gap-2">
                   <button onClick={() => setEphemeralNote('')} title="Clear Notes" className="text-slate-400 hover:text-red-400 focus:outline-none">
                     <Trash2 className="w-3 h-3" />
                   </button>
                   <button onClick={() => setShowNotes(false)} title="Close" className="text-slate-400 hover:text-white focus:outline-none">
                     <X className="w-3 h-3" />
                   </button>
                 </div>
              </div>
              <textarea
                value={ephemeralNote}
                onChange={(e) => setEphemeralNote(e.target.value)}
                placeholder="Log physical markers, access codes, or drop context here. Erased upon exit."
                className="w-full bg-transparent text-slate-200 font-mono text-[10px] p-2.5 h-32 focus:outline-none resize-none custom-scrollbar placeholder:text-[#106011]/50 leading-relaxed"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
