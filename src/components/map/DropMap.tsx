// src/components/map/DropMap.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuthStore } from '@/stores';
import { useLiveLocations } from '@/hooks/realtime/useLiveLocations';
import { DropperTrackingControl } from '@/components/dropper/DropperTrackingControl';
import { DropStatusBadge } from '@/components/drops/DropStatusBadge';
import { useNavigate } from 'react-router-dom';
import type { Drop } from '@/types/domain';

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface DropMapProps {
  drops?: Drop[];
}

export default function DropMap({ drops = [] }: DropMapProps) {
  const { profile } = useAuthStore();

  // === ALL HOOKS AT TOP LEVEL (FIX) ===
  const isSuperAdmin = profile?.role === 'super_admin';
  const isDropper = profile?.role === 'dropper';
  const isAdmin = profile?.role === 'admin';

  // Always call this hook unconditionally
  const { locations: liveLocations, status: liveStatus } = useLiveLocations();

  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);

  // Optional: Get user's current position
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
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

  return (
    <div className="relative h-[600px] w-full rounded-2xl overflow-hidden border border-zinc-800">
      <MapContainer
        center={[13.226, 120.596]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {/* Droppers: Show assigned drops + tracking control */}
        {isDropper &&
          drops
            .filter((d) => d.assigned_to === profile?.id && d.status === 'active')
            .map((drop) => (
              <Marker key={drop.id} position={[drop.lat, drop.lng]}>
                <Popup>
                  <div className="text-black min-w-[260px]">
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

        {/* Super Admin: Live agent locations */}
        {isSuperAdmin &&
          Object.entries(liveLocations).map(([userId, locs]) => {
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

        {/* Clients: Show assigned drops */}
        {!isSuperAdmin && !isDropper && drops.length > 0 && (
          drops
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
  );
}
