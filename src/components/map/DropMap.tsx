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
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup } from 'react-leaflet';
import { Navigation, Download } from 'lucide-react';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { supabase, isMock } from '@/lib/supabase';
import { EpicModal } from '@/components/ui/EpicModal';
import { useProfile } from '@/hooks/useProfile';
import type { Drop, DropStatus } from '@/types/domain';

// ── FIX H-3: Leaflet default icon fix for Vite ────────────────────────────────
// Without this, the default marker uses broken URL references.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── FIX C-3: Status colours aligned to DB enum ────────────────────────────────
const STATUS_COLORS: Record<DropStatus, string> = {
  active: '#10B981',
  claimed: '#3B82F6',   // was 'completed'
  expired: '#EF4444',   // was 'cancelled'
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
  const [drops, setDrops] = useState<Drop[]>([]);
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

  // ── Realtime drops ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMock) {
      // Load interactive realistic mock drops in Mamburao, Occidental Mindoro
      setDrops([
        {
          id: 'mock-drop-1',
          created_by: 'mock-admin',
          assigned_to: profile?.id || 'mock-client',
          lat: 13.2245,
          lng: 120.5945,
          title: 'Operation Goldrush: Container #21 📍',
          notes_encrypted: 'U0VESV9DT0RFX0FDVElWRQ==', // base64 mock
          photo_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80',
          video_url: '',
          qr_token: 'mock-qr-token-1',
          status: 'active',
          pickup_order: 1,
          expires_at: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-drop-2',
          created_by: 'mock-admin',
          assigned_to: profile?.id || 'mock-client',
          lat: 13.2272,
          lng: 120.5982,
          title: 'Secure Handoff: Port Area Cargo Box 📦',
          notes_encrypted: 'U0VESV9DT0RFX0FDVElWRTI=',
          photo_url: '',
          video_url: '',
          qr_token: 'mock-qr-token-2',
          status: 'claimed',
          pickup_order: 2,
          expires_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
          created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-drop-3',
          created_by: 'mock-admin1',
          assigned_to: 'some-other-client',
          lat: 13.2221,
          lng: 120.5921,
          title: 'Hardware Deposit: Behind Hardware Shop 🛠️',
          notes_encrypted: '',
          photo_url: '',
          video_url: '',
          qr_token: 'mock-qr-token-3',
          status: 'active',
          pickup_order: 3,
          expires_at: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      return;
    }

    const fetchDrops = async () => {
      const { data } = await supabase.from('drops').select('*');
      if (data) setDrops(data as Drop[]);
    };
    fetchDrops();

    const channel = supabase
      .channel('drops-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drops' },
        (payload) => {
          if (payload.eventType === 'INSERT')
            setDrops((prev) => [...prev, payload.new as Drop]);
          if (payload.eventType === 'UPDATE')
            setDrops((prev) =>
              prev.map((d) => (d.id === payload.new.id ? (payload.new as Drop) : d))
            );
          if (payload.eventType === 'DELETE')
            setDrops((prev) => prev.filter((d) => d.id !== (payload.old as Drop).id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  // ── Super Admin: track other admins ────────────────────────────────────────
  useEffect(() => {
    if (!isSuperAdmin) return;

    if (isMock) {
      // Simulate two other active mobile admins wandering in Mamburao
      const uids = ['mock-id-1', 'mock-id-2'];
      const offset = { 'mock-id-1': { lat: 0.001, lng: -0.001 }, 'mock-id-2': { lat: -0.001, lng: 0.002 } };
      
      const simulateMovement = () => {
        setAdminLocations((prev) => {
          const next = { ...prev };
          uids.forEach((uid) => {
            const current = next[uid] || {
              lat: MAMBURAO_CENTER[0] + offset[uid as keyof typeof offset].lat,
              lng: MAMBURAO_CENTER[1] + offset[uid as keyof typeof offset].lng,
              accuracy: 12,
              updatedAt: new Date(),
            };
            // Slightly wander
            const newLat = current.lat + (Math.random() - 0.5) * 0.0004;
            const newLng = current.lng + (Math.random() - 0.5) * 0.0004;
            next[uid] = {
              lat: newLat,
              lng: newLng,
              accuracy: Math.floor(8 + Math.random() * 10),
              updatedAt: new Date(),
            };
          });
          return next;
        });
      };

      // Set initial positions
      simulateMovement();

      const moveInterval = setInterval(simulateMovement, 5000);
      return () => clearInterval(moveInterval);
    }

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
          if (isMock) {
            console.log(`[Mock Broadcast] Location user_id=${profile.id} lat=${latitude} lng=${longitude}`);
          } else {
            await (supabase as any).from('locations').insert({
              user_id: profile.id,
              lat: latitude,
              lng: longitude,
              accuracy: acc,
            });
          }
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
    <div className="relative">
      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setFilteredStatus('all')}
          className={`px-4 py-1.5 rounded-full text-sm ${
            filteredStatus === 'all' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          All
        </button>
        {/* FIX C-3: status values from DB enum */}
        {(Object.keys(STATUS_COLORS) as DropStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilteredStatus(status)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize ${
              filteredStatus === status ? 'text-white' : 'bg-slate-800 text-slate-300'
            }`}
            style={{
              backgroundColor: filteredStatus === status ? STATUS_COLORS[status] : undefined,
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div
        style={{ height, width: '100%' }}
        className="rounded-2xl overflow-hidden border border-slate-700 relative z-0 shadow-lg"
      >
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
