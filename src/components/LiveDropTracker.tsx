import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, Polyline } from 'react-leaflet';
import { CachedTileLayer } from '@/components/map/CachedTileLayer';
import { supabase } from '../lib/supabase';

interface LocationUpdate {
  lat: number;
  lng: number;
  timestamp: string;
}

export default function LiveDropTracker({ dropId }: { dropId: string }) {
  const [positions, setPositions] = useState<LocationUpdate[]>([]);
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([14.5995, 120.9842]);

  useEffect(() => {
    // Fetch historical data
    const fetchLocations = async () => {
      const { data } = await supabase
        .from('drop_locations')
        .select('*')
        .eq('drop_id', dropId)
        .order('timestamp', { ascending: true });
        
      if (data && data.length > 0) {
        setPositions(data);
        const last = data[data.length - 1];
        setCurrentPosition([last.lat, last.lng]);
      }
    };
    fetchLocations();

    const channel = supabase
      .channel(`drop-tracking-${dropId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'drop_locations',
        filter: `drop_id=eq.${dropId}`
      }, (payload) => {
        const newLoc = payload.new as LocationUpdate;
        setPositions(prev => [...prev, newLoc]);
        setCurrentPosition([newLoc.lat, newLoc.lng]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dropId]);

  const pathPositions = positions.map(p => [p.lat, p.lng] as [number, number]);

  return (
    <div className="h-[500px] rounded-2xl overflow-hidden border-2 border-[#106011] shadow-[0_0_20px_rgba(16,96,17,0.3)] relative">
      <div className="absolute top-4 left-4 z-[400] bg-black/80 border border-[#106011] px-3 py-1.5 rounded text-[10px] font-mono text-[#106011] uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        LIVE TELEMETRY
      </div>
      <MapContainer center={currentPosition} zoom={16} className="h-full w-full">
        <CachedTileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        
        {pathPositions.length > 0 && (
          <Polyline positions={pathPositions} color="#10b981" weight={3} />
        )}

        <Marker position={currentPosition}>
          <Popup>Current Drop Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
