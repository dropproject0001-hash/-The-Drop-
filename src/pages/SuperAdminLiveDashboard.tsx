import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { supabase } from '../lib/supabase';

interface Drop {
  id: string;
  status: string;
  created_at: string;
}

interface Location {
  drop_id: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export default function SuperAdminLiveDashboard() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [locations, setLocations] = useState<Record<string, Location[]>>({});

  // Fetch initial drops
  useEffect(() => {
    const fetchDrops = async () => {
      const { data } = await supabase
        .from('drops')
        .select('*')
        .in('status', ['active', 'executed'])
        .order('created_at', { ascending: false });
      if (data) setDrops(data);
    };
    fetchDrops();
  }, []);

  // Real-time drops
  useEffect(() => {
    const channel = supabase
      .channel('live-drops')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drops' }, (payload) => {
        setDrops(prev => {
          const updated = [...prev];
          const newDoc = payload.new as Drop;
          const index = updated.findIndex(d => d.id === newDoc.id);
          if (index !== -1) updated[index] = newDoc;
          else updated.unshift(newDoc);
          return updated;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Real-time locations
  useEffect(() => {
    const channel = supabase
      .channel('live-locations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'drop_locations' }, (payload) => {
        const loc = payload.new as Location;
        setLocations(prev => ({
          ...prev,
          [loc.drop_id]: [...(prev[loc.drop_id] || []), loc]
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6 text-white min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-6 font-display tracking-widest text-[#106011] uppercase drop-shadow-[0_0_10px_rgba(16,96,17,0.5)]">LIVE OPERATIONS — SUPER ADMIN</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Map */}
        <div className="lg:col-span-2 bg-zinc-950 border-2 border-[#106011] relative rounded-2xl overflow-hidden h-[600px] shadow-[0_0_20px_rgba(16,96,17,0.2)]">
          <div className="absolute top-4 left-4 z-[400] bg-black/80 border border-[#106011] px-3 py-1.5 rounded text-[10px] font-mono text-[#106011] uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            LIVE SATCOM UPLINK
          </div>
          <MapContainer center={[14.5995, 120.9842]} zoom={12} className="h-full w-full">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            {Object.entries(locations).map(([dropId, locs]) => {
              if (locs.length === 0) return null;
              const latest = locs[locs.length - 1];
              const path = locs.map(l => [l.lat, l.lng] as [number, number]);
              
              return (
                <div key={dropId}>
                  {path.length > 1 && <Polyline positions={path} color="#10b981" weight={3} />}
                  <Marker position={[latest.lat, latest.lng]}>
                    <Popup>
                      <div className="font-mono text-xs text-black">
                        <strong>DROP IDENT:</strong> {dropId}
                      </div>
                    </Popup>
                  </Marker>
                </div>
              );
            })}
          </MapContainer>
        </div>

        {/* Active Drops List */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
          <h3 className="font-semibold mb-4 text-[#106011] font-mono uppercase tracking-widest text-sm flex items-center justify-between">
            Active Operations 
            <span className="bg-[#106011] text-black px-2 py-0.5 rounded-full text-xs">{drops.length}</span>
          </h3>
          <div className="space-y-3 max-h-[540px] overflow-y-auto custom-scrollbar pr-2">
            {drops.length === 0 && (
              <div className="text-slate-500 text-xs font-mono uppercase text-center mt-10">No active operations</div>
            )}
            {drops.map(drop => (
              <div key={drop.id} className="bg-black border border-zinc-800/50 p-4 rounded-xl hover:border-[#106011]/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono text-[10px] text-slate-500 mb-1">IDENT_CODE:</div>
                    <div className="font-mono text-xs text-slate-300 break-all">{drop.id}</div>
                    <div className="mt-2 text-[#106011] font-mono text-xs uppercase font-bold px-2 py-0.5 bg-[#106011]/10 rounded border border-[#106011]/30 inline-block">STATUS: {drop.status}</div>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono text-right">
                    T-{new Date(drop.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
