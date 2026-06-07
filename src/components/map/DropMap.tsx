import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MapPin, Clock, CheckCircle, XCircle, Navigation, Download } from 'lucide-react';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { supabase } from '@/lib/supabase';
import { EpicModal } from '@/components/ui/EpicModal';
import { useProfile } from '@/hooks/useProfile';

export type DropStatus = 'active' | 'pending' | 'completed' | 'cancelled';

interface Drop {
  id: string;
  lat: number;
  lng: number;
  title: string;
  status: DropStatus;
  assignedTo?: string;
  description?: string;
}

interface DropMapProps {
  height?: string;
}

const statusConfig: Record<DropStatus, { color: string }> = {
  active: { color: '#10B981' },
  pending: { color: '#F59E0B' },
  completed: { color: '#3B82F6' },
  cancelled: { color: '#EF4444' },
};

export function DropMap({ height = '650px' }: DropMapProps) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<DropStatus | 'all'>('all');
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Live location states
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  
  // Offline download states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Role based states
  const { profile, isSuperAdmin, isAdmin } = useProfile();
  const [adminLocations, setAdminLocations] = useState<Record<string, { lat: number, lng: number, accuracy: number, updatedAt: Date }>>({});
  
  // Rate limit broadcasts
  const lastBroadcastRef = useRef<number>(0);

  // Mamburao, Occidental Mindoro
  const mamburaoCenter: [number, number] = [13.226, 120.596];

  // Fetch drops + realtime drops
  useEffect(() => {
    const fetchDrops = async () => {
      const { data } = await supabase.from('drops').select('*');
      if (data) setDrops(data as Drop[]);
    };
    fetchDrops();

    const channel = supabase
      .channel('drops-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drops' }, (payload) => {
        if (payload.eventType === 'INSERT') setDrops(prev => [...prev, payload.new as Drop]);
        if (payload.eventType === 'UPDATE') {
          setDrops(prev => prev.map(d => d.id === payload.new.id ? payload.new as Drop : d));
        }
        if (payload.eventType === 'DELETE') {
          setDrops(prev => prev.filter(d => d.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Super Admin: Live tracking of Admins
  useEffect(() => {
    if (!isSuperAdmin) return;
    
    // Listen to locations table inserts
    const locChannel = supabase.channel('locations-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'locations' }, (payload) => {
         const newLoc = payload.new;
         setAdminLocations(prev => ({
           ...prev,
           [newLoc.user_id]: { 
             lat: newLoc.lat, 
             lng: newLoc.lng, 
             accuracy: newLoc.accuracy || 0,
             updatedAt: new Date()
           }
         }));
      }).subscribe();
      
    // Cleanup stale locations (older than 5 mins)
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setAdminLocations(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(uid => {
          if (now - next[uid].updatedAt.getTime() > 5 * 60 * 1000) {
            delete next[uid];
          }
        });
        return next;
      });
    }, 60000);

    return () => { 
      supabase.removeChannel(locChannel); 
      clearInterval(interval);
    };
  }, [isSuperAdmin]);

  const filteredDrops = filteredStatus === 'all' 
    ? drops 
    : drops.filter(d => d.status === filteredStatus);

  const createIcon = (status: DropStatus) => {
    return L.divIcon({
      className: 'custom-marker bg-transparent border-none shadow-none',
      html: `
        <div style="
          background-color: ${statusConfig[status].color};
          width: 32px; height: 32px; border-radius: 9999px;
          display: flex; align-items: center; justify-content: center;
          border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        ">
          <span style="color: white; font-size: 16px;">●</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };
  
  const superAdminUserIcon = L.divIcon({
    className: 'custom-marker bg-transparent border-none shadow-none',
    html: `
      <div style="
        background-color: #ef4444; 
        width: 24px; height: 24px; border-radius: 9999px;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        <span style="color: white; font-size: 10px;">A</span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  // Live Location Tracking (Admin/Dropper Broadcasts to DB)
  const toggleLiveTracking = () => {
    if (isTracking && watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
      setWatchId(null);
      setUserLocation(null);
      setAccuracy(null);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation([latitude, longitude]);
        setAccuracy(accuracy);
        setIsTracking(true);
        
        // Broadcast location to DB with throttle (e.g. every 5 seconds)
        const now = Date.now();
        if (now - lastBroadcastRef.current > 5000 && profile?.id) {
          lastBroadcastRef.current = now;
          await supabase.from('locations').insert({
            user_id: profile.id,
            lat: latitude,
            lng: longitude,
            accuracy: accuracy
          });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    setWatchId(id);
  };

  const handleMarkerClick = (drop: Drop) => {
    setSelectedDrop(drop);
    setIsModalOpen(true);
  };

  // Download Map for Offline Use (Mamburao)
  const downloadMamburaoTiles = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    const cache = await caches.open('mamburao-map-tiles-v1');
    const tileUrls: string[] = [];

    const bounds = { minLat: 13.18, maxLat: 13.28, minLng: 120.55, maxLng: 120.65 };
    const zooms = [12, 13, 14, 15];

    for (const z of zooms) {
      const minX = Math.floor(((bounds.minLng + 180) / 360) * Math.pow(2, z));
      const maxX = Math.floor(((bounds.maxLng + 180) / 360) * Math.pow(2, z));
      const minY = Math.floor((1 - Math.log(Math.tan(bounds.maxLat * Math.PI / 180) + 1 / Math.cos(bounds.maxLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
      const maxY = Math.floor((1 - Math.log(Math.tan(bounds.minLat * Math.PI / 180) + 1 / Math.cos(bounds.minLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));

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
      } catch (_) {}
      done++;
      setDownloadProgress(Math.round((done / tileUrls.length) * 100));
    }

    setIsDownloading(false);
    alert('Map tiles for Mamburao downloaded successfully!');
  };

  return (
    <div className="relative">
      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button onClick={() => setFilteredStatus('all')} className={`px-4 py-1.5 rounded-full text-sm ${filteredStatus === 'all' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300'}`}>All</button>
        {Object.keys(statusConfig).map(status => (
          <button
            key={status}
            onClick={() => setFilteredStatus(status as DropStatus)}
            className={`px-4 py-1.5 rounded-full text-sm ${filteredStatus === status ? 'text-white' : 'bg-slate-800 text-slate-300'}`}
            style={{ backgroundColor: filteredStatus === status ? statusConfig[status as DropStatus].color : undefined }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden border border-slate-700 relative z-0 shadow-lg">
        <MapContainer center={mamburaoCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Live User Location (Admin/Dropper) */}
          {userLocation && (
            <>
              {/* @ts-ignore */}
              <Marker position={userLocation}>
                <Popup>
                  <div className="text-center text-slate-900 border-none">
                    <strong>Your Location</strong><br />
                    {accuracy && <span className="text-xs text-gray-500">±{Math.round(accuracy)}m accuracy</span>}
                  </div>
                </Popup>
              </Marker>
              {accuracy && (
                <Circle 
                  center={userLocation} 
                  radius={accuracy} 
                  pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.15, stroke: false }} 
                />
              )}
            </>
          )}
          
          {/* Super Admin View: See other admins */}
          {isSuperAdmin && Object.entries(adminLocations).map(([uid, loc]) => (
             <div key={uid}>
               {/* @ts-ignore */}
               <Marker position={[loc.lat, loc.lng]} icon={superAdminUserIcon}>
                 <Popup>
                    <div className="text-center text-slate-900 border-none">
                      <strong>Admin Active</strong><br />
                      <span className="text-xs text-gray-500">Live updating...</span>
                    </div>
                 </Popup>
               </Marker>
             </div>
          ))}

          <MarkerClusterGroup>
            {filteredDrops.map(drop => (
              <Marker
                key={drop.id}
                position={[drop.lat, drop.lng]}
                icon={createIcon(drop.status)}
                eventHandlers={{ click: () => handleMarkerClick(drop) }}
              >
                <Popup>
                   <div className="text-slate-900 border-none">
                     <strong>{drop.title}</strong>
                   </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Floating Buttons */}
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
          {/* Live Tracking Button (For Admin / Dropper or Super Admin) */}
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
        
        {/* Floating Download Button */}
        <button
          onClick={downloadMamburaoTiles}
          disabled={isDownloading}
          className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2 bg-slate-900 shadow-lg border border-slate-700 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 disabled:opacity-70 transition-all"
        >
          <Download size={18} className={isDownloading ? 'animate-bounce' : ''} />
          {isDownloading ? `Downloading... ${downloadProgress}%` : 'Download Map Offline'}
        </button>
      </div>

      {/* Detail Modal */}
      <EpicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDrop?.title || 'Drop Details'}
        size="lg"
      >
        {selectedDrop && (
          <div className="space-y-4 text-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusConfig[selectedDrop.status].color }} />
              <span className="font-semibold capitalize">{selectedDrop.status}</span>
            </div>
            {selectedDrop.assignedTo && <p><strong>Assigned to:</strong> {selectedDrop.assignedTo}</p>}
            <div className="pt-4 border-t border-slate-700 flex gap-3">
              <button className="flex-1 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition">Update Status</button>
              <button className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 transition text-white">Confirm via QR</button>
            </div>
          </div>
        )}
      </EpicModal>
    </div>
  );
}
