/**
 * @file src/components/map/DropMap.tsx
 *
 * FIXES:
 *  H-2  : Removed <div> wrapper around <Marker> — bare divs are invalid
 *         React-Leaflet children and silently break marker rendering.
 *  H-3  : Applied the standard Vite/webpack Leaflet default icon fix so the
 *         user-location marker no longer shows a broken image.
 *  H-4  : createIcon() wrapped in useCallback; superAdminUserIcon memoised
 *         with useMemo to prevent marker re-renders on every component render.
 *  C-5  : Location broadcast now checks profile.role before inserting.
 *  M-4  : Removed @ts-ignore suppressions; position typed correctly.
 *  M-5  : handleMarkerClick wrapped in useCallback.
 *  C-3  : DropStatus enum aligned to DB values ('active'|'claimed'|'expired').
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup } from 'react-leaflet';
import { Navigation, Download } from 'lucide-react';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { supabase } from '@/lib/supabase';
import { EpicModal } from '@/components/ui/EpicModal';
import { useProfile } from '@/hooks/useProfile';
import type { Drop, DropStatus } from '@/types/domain';
import { useDrops } from '@/hooks/useDrops';

// ── FIX H-3: Leaflet default icon fix for Vite ────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── FIX C-3: Status colours aligned to DB enum ────────────────────────────────
const STATUS_COLORS: Record<DropStatus, string> = {
  active: '#10B981',
  claimed: '#3B82F6',
  expired: '#EF4444',
};

interface DropMapProps {
  height?: string;
}

interface AdminLocation {
  lat: number;
  lng: number;
  accuracy: number;
  updatedAt: Date;
}

const MAMBURAO_CENTER: [number, number] = [13.226, 120.596];
const BROADCAST_THROTTLE_MS = 5_000;
const STALE_LOCATION_MS = 5 * 60 * 1_000;

export function DropMap({ height = '650px' }: DropMapProps) {
  const { drops } = useDrops();
  const [filteredStatus, setFilteredStatus] = useState<DropStatus | 'all'>('all');
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const { profile, isSuperAdmin, isAdmin } = useProfile();
  const [adminLocations, setAdminLocations] = useState<Record<string, AdminLocation>>({});

  const lastBroadcastRef = useRef<number>(0);

  // ── Super Admin: track other admins ────────────────────────────────────────
  useEffect(() => {
    if (!isSuperAdmin) return;

    const locChannel = supabase
      .channel('locations-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'locations' },
        (payload) => {
          const loc = payload.new;
          setAdminLocations((prev) => ({
            ...prev,
            [loc.user_id]: {
              lat: loc.lat,
              lng: loc.lng,
              accuracy: loc.accuracy ?? 0,
              updatedAt: new Date(),
            },
          }));
        }
      )
      .subscribe();

    // Prune stale locations every minute
    const staleInterval = setInterval(() => {
      const now = Date.now();
      setAdminLocations((prev) => {
        const next = { ...prev };
        for (const uid of Object.keys(next)) {
          if (now - next[uid].updatedAt.getTime() > STALE_LOCATION_MS) {
            delete next[uid];
          }
        }
        return next;
      });
    }, 60_000);

    return () => {
      supabase.removeChannel(locChannel);
      clearInterval(staleInterval);
    };
  }, [isSuperAdmin]);

  // ── FIX H-4: Memoised icon factories ───────────────────────────────────────
  const createIcon = useCallback((status: DropStatus) =>
    L.divIcon({
      className: 'custom-marker bg-transparent border-none shadow-none',
      html: `
        <div style="
          background-color:${STATUS_COLORS[status]};
          width:32px;height:32px;border-radius:9999px;
          display:flex;align-items:center;justify-content:center;
          border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,.3);">
          <span style="color:white;font-size:16px;">●</span>
        </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  []);

  const superAdminUserIcon = useMemo(
    () =>
      L.divIcon({
        className: 'custom-marker bg-transparent border-none shadow-none',
        html: `
          <div style="
            background-color:#ef4444;
            width:24px;height:24px;border-radius:9999px;
            display:flex;align-items:center;justify-content:center;
            border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);">
            <span style="color:white;font-size:10px;">A</span>
          </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    []
  );

  const userLocationIcon = useMemo(
    () =>
      L.divIcon({
        className: 'custom-marker bg-transparent border-none shadow-none',
        html: `
          <div style="
            background-color:#3B82F6;
            width:20px;height:20px;border-radius:9999px;
            border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4);">
          </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    []
  );

  // ── FIX M-5: Memoised click handler ────────────────────────────────────────
  const handleMarkerClick = useCallback((drop: Drop) => {
    setSelectedDrop(drop);
    setIsModalOpen(true);
  }, []);

  // ── Live tracking ───────────────────────────────────────────────────────────
  const toggleLiveTracking = useCallback(() => {
    if (isTracking && watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
      setWatchId(null);
      setUserLocation(null);
      setAccuracy(null);
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;
        setUserLocation([latitude, longitude]);
        setAccuracy(acc);
        setIsTracking(true);

        // FIX C-5: Only broadcast if user is admin or super_admin
        const now = Date.now();
        if (
          profile?.id &&
          (profile.role === 'admin' || profile.role === 'super_admin') &&
          now - lastBroadcastRef.current > BROADCAST_THROTTLE_MS
        ) {
          lastBroadcastRef.current = now;
          await (supabase.from('locations') as any).insert({
            user_id: profile.id,
            lat: latitude,
            lng: longitude,
            accuracy: acc,
          });
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Unable to get your location');
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 5_000 }
    );

    setWatchId(id);
  }, [isTracking, watchId, profile]);

  // ── Offline tile download ───────────────────────────────────────────────────
  const downloadMamburaoTiles = useCallback(async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    const cache = await caches.open('mamburao-map-tiles-v1');
    const tileUrls: string[] = [];
    const bounds = { minLat: 13.18, maxLat: 13.28, minLng: 120.55, maxLng: 120.65 };
    const zooms = [12, 13, 14, 15];

    for (const z of zooms) {
      const n = Math.pow(2, z);
      const minX = Math.floor(((bounds.minLng + 180) / 360) * n);
      const maxX = Math.floor(((bounds.maxLng + 180) / 360) * n);
      const latToY = (lat: number) =>
        Math.floor(
          ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n
        );
      const minY = latToY(bounds.maxLat);
      const maxY = latToY(bounds.minLat);

      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          tileUrls.push(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
        }
      }
    }

    let done = 0;
    for (const url of tileUrls) {
      try {
        const res = await fetch(url);
        if (res.ok) await cache.put(url, res.clone());
      } catch (_) { /* swallow individual tile errors */ }
      done++;
      setDownloadProgress(Math.round((done / tileUrls.length) * 100));
    }

    setIsDownloading(false);
    alert('Map tiles for Mamburao downloaded successfully!');
  }, []);

  const filteredDrops = filteredStatus === 'all'
    ? drops
    : drops.filter((d) => d.status === filteredStatus);

  return (
    <div className="relative h-full flex flex-col">
      {/* Status Filters */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={() => setFilteredStatus('all')}
          className={`relative px-4 py-2 bg-black/95 border text-xs font-mono tracking-widest uppercase transition-all select-none overflow-hidden duration-300 rounded ${
            filteredStatus === 'all'
              ? 'border-[#106011]/90 text-[#106011] font-bold drop-shadow-[0_0_8px_rgba(16,96,17,0.85)] shadow-[0_0_15px_rgba(16,96,17,0.35)]'
              : 'border-[#106011]/30 text-slate-400 hover:border-[#106011] hover:text-[#106011] hover:shadow-[0_0_10px_rgba(16,96,17,0.2)]'
          }`}
        >
          {/* Active indicator borders inside the button for tactical HUD nested style */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#106011] pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#106011] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#106011] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#106011] pointer-events-none"></div>
          
          <div className="absolute inset-[2px] border border-dashed border-[#106011]/25 pointer-events-none rounded sm:scale-95"></div>
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            ALL PINS
          </span>
        </button>
        {/* FIX C-3: status values from DB enum */}
        {(Object.keys(STATUS_COLORS) as DropStatus[]).map((status) => {
          const isActive = filteredStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFilteredStatus(status)}
              className={`relative px-4 py-2 bg-black/95 border text-xs font-mono tracking-widest uppercase transition-all select-none overflow-hidden duration-300 rounded ${
                isActive
                  ? 'border-[#106011]/90 text-[#106011] font-bold drop-shadow-[0_0_8px_rgba(16,96,17,0.85)] shadow-[0_0_15px_rgba(16,96,17,0.35)]'
                  : 'border-[#106011]/30 text-slate-400 hover:border-[#106011] hover:text-[#106011] hover:shadow-[0_0_10px_rgba(16,96,17,0.2)]'
              }`}
            >
              {/* Active indicator borders inside the button for tactical HUD nested style */}
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#106011] pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#106011] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#106011] pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#106011] pointer-events-none"></div>

              <div className="absolute inset-[2px] border border-dashed border-[#106011]/25 pointer-events-none rounded sm:scale-95"></div>
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <span 
                  className="w-1.5 h-1.5 rounded-full inline-block" 
                  style={{ backgroundColor: STATUS_COLORS[status] }} 
                />
                {status}
              </span>
            </button>
          )
        })}
      </div>

      {/* Map Container */}
      <div
        style={{ height: height === '100%' ? '100%' : height, width: '100%' }}
        className="flex-1 w-full overflow-hidden relative z-0 border border-[#106011]/50 shadow-[0_0_30px_rgba(16,96,17,0.3)] rounded-2xl"
      >
        {/* Floating tactical HUD overlays on top of map container margins */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#106011] rounded-tl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.9)] z-[1000]"></div>
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#106011] rounded-tr pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.9)] z-[1000]"></div>
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#106011] rounded-bl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.9)] z-[1000]"></div>
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#106011] rounded-br pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.9)] z-[1000]"></div>

        {/* Double-Nested Rectangle Lines around map layer edges */}
        <div className="absolute inset-4 border border-dashed border-[#106011]/25 pointer-events-none rounded-xl z-[900]"></div>
        <div className="absolute inset-5 border border-[#106011]/15 pointer-events-none rounded-lg z-[900]"></div>
        <div className="absolute inset-6 border border-[#106011]/10 pointer-events-none rounded-md z-[900]"></div>

        <MapContainer center={MAMBURAO_CENTER} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User's own live location */}
          {userLocation && (
            <LayerGroup>
              {/* FIX M-4: position typed correctly — no @ts-ignore needed */}
              <Marker position={userLocation} icon={userLocationIcon}>
                <Popup>
                  <div className="text-center text-slate-900">
                    <strong>Your Location</strong>
                    <br />
                    {accuracy != null && (
                      <span className="text-xs text-gray-500">
                        ±{Math.round(accuracy)}m accuracy
                      </span>
                    )}
                  </div>
                </Popup>
              </Marker>
              {accuracy != null && (
                <Circle
                  center={userLocation}
                  radius={accuracy}
                  pathOptions={{
                    color: '#3B82F6',
                    fillColor: '#3B82F6',
                    fillOpacity: 0.15,
                    stroke: false,
                  }}
                />
              )}
            </LayerGroup>
          )}

          {/* FIX H-2: <Marker> is now a direct child — no invalid <div> wrapper */}
          {isSuperAdmin &&
            Object.entries(adminLocations).map(([uid, loc]) => (
              <Marker
                key={uid}
                position={[loc.lat, loc.lng]}
                icon={superAdminUserIcon}
              >
                <Popup>
                  <div className="text-center text-slate-900">
                    <strong>Admin Active</strong>
                    <br />
                    <span className="text-xs text-gray-500">
                      ±{Math.round(loc.accuracy)}m · live
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}

          <MarkerClusterGroup>
            {filteredDrops.map((drop) => (
              <Marker
                key={drop.id}
                position={[drop.lat, drop.lng]}
                icon={createIcon(drop.status)}
                eventHandlers={{ click: () => handleMarkerClick(drop) }}
              >
                <Popup>
                  <div className="text-slate-900">
                    <strong>{drop.title}</strong>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Floating: Live Tracking Button */}
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
          {(isAdmin || isSuperAdmin) && (
            <button
              onClick={toggleLiveTracking}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-medium transition-all ${
                isTracking
                  ? 'bg-red-500 text-white hover:bg-red-600 border border-red-400'
                  : 'bg-slate-900 border border-slate-700 text-white hover:bg-slate-800'
              }`}
            >
              <Navigation size={18} />
              {isTracking ? 'Stop Tracking' : 'Track My Location'}
            </button>
          )}
        </div>

        {/* Floating: Offline Download Button */}
        <button
          onClick={downloadMamburaoTiles}
          disabled={isDownloading}
          className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2 bg-slate-900 shadow-lg border border-slate-700 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 disabled:opacity-70 transition-all"
        >
          <Download size={18} className={isDownloading ? 'animate-bounce' : ''} />
          {isDownloading ? `Downloading… ${downloadProgress}%` : 'Download Map Offline'}
        </button>
      </div>

      {/* Drop Detail Modal */}
      <EpicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDrop?.title ?? 'Drop Details'}
        size="lg"
      >
        {selectedDrop && (
          <div className="space-y-4 text-slate-100">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[selectedDrop.status] }}
              />
              <span className="font-semibold capitalize">{selectedDrop.status}</span>
            </div>
            {selectedDrop.assigned_to && (
              <p>
                <strong>Assigned to:</strong> {selectedDrop.assigned_to}
              </p>
            )}
            <div className="pt-4 border-t border-slate-700 flex gap-3">
              <button className="flex-1 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition">
                Update Status
              </button>
              <button className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 transition text-white">
                Confirm via QR
              </button>
            </div>
          </div>
        )}
      </EpicModal>
    </div>
  );
}
