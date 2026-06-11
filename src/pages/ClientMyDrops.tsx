import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { useDropStore } from '@/stores';
import { DropStatusBadge } from '@/components/drops/DropStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { calculateDistance } from '@/utils/calculateDistance';

export default function ClientMyDrops() {
  const { profile } = useAuthStore();
  const { drops } = useDropStore();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation failed or denied:', err);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const myDrops = drops
    .filter(d => d.assigned_to === profile?.id)
    .map(drop => {
      let distance: number | undefined;
      if (userLocation) {
        distance = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          drop.lat, 
          drop.lng
        );
      }
      return { ...drop, distance };
    })
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-mono tracking-widest text-[#106011] mb-6">MY DROPS</h1>

      {myDrops.length === 0 && (
        <EmptyState
          icon="inbox"
          title="No drops assigned"
          description="You currently have no active product drops."
        />
      )}

      <div className="space-y-4">
        {myDrops.map((drop) => (
          <div 
            key={drop.id} 
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 cursor-pointer hover:border-emerald-950 hover:border-emerald-900 transition-colors"
            onClick={() => navigate(`/claim/${drop.id}`)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-lg text-white">{drop.title}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  {drop.lat.toFixed(4)}, {drop.lng.toFixed(4)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <DropStatusBadge status={drop.status} />
                {drop.distance !== undefined && (
                  <span className="text-emerald-400 font-mono text-xs font-semibold">
                    🔑 {drop.distance.toFixed(1)} km away
                  </span>
                )}
              </div>
            </div>

            {drop.status === 'active' && (
              <button 
                className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-black rounded-xl text-sm font-mono tracking-widest transition-colors font-medium"
              >
                VIEW DROP
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
