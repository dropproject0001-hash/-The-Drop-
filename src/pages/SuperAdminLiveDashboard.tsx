import React, { useMemo } from 'react';
import { useLiveDrops } from '../hooks/realtime/useLiveDrops';
import { useLiveLocations, type LiveLocation } from '../hooks/realtime/useLiveLocations';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { Drop } from '../types/domain';

// Leaflet default icon fix (same as DropMap)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NUEVA_ECIJA_CENTER: [number, number] = [15.4865, 120.9734];

export default function SuperAdminLiveDashboard() {
  const { drops, loading: dropsLoading, error: dropsError } = useLiveDrops();
  const { locations, getLatestForUser, loading: locLoading, error: locationsError } = useLiveLocations();

  const activeDrops = useMemo(() => 
    drops.filter(d => d.status === 'active'), 
  [drops]);

  // Group recent locations by user for trails
  const userTrails = useMemo(() => {
    const trails: Record<string, [number, number][]> = {};
    Object.entries(locations).forEach(([userId, locs]) => {
      trails[userId] = locs
        .slice(0, 8)
        .map(l => [l.lat, l.lng] as [number, number])
        .reverse();
    });
    return trails;
  }, [locations]);

  const liveAgents = useMemo(() => 
    Object.keys(locations).map(uid => ({
      userId: uid,
      latest: getLatestForUser(uid)
    })).filter(a => a.latest),
  [locations, getLatestForUser]);

  return (
    <div className="p-6 text-white min-h-screen bg-black">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-widest text-[#106011] uppercase">LIVE OPERATIONS — GOODS EYE</h1>
          <p className="text-[#106011] mt-1 font-mono text-sm tracking-wider">Super Admin • Real-time Command &amp; Product Tracking</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono text-emerald-400">{activeDrops.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono tracking-widest">ACTIVE DROPS</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Map */}
        <div className="lg:col-span-2 bg-zinc-950 border-2 border-[#106011] relative rounded-2xl overflow-hidden h-[620px]">
          <div className="absolute top-4 left-4 z-[400] bg-black/80 border border-[#106011] px-3 py-1.5 rounded text-[10px] font-mono text-[#106011] uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            LIVE SATCOM + AGENT TRACKING
          </div>

          <MapContainer center={NUEVA_ECIJA_CENTER} zoom={13} className="h-full w-full">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

            {/* Pinned Active Drops (the Goods) */}
            {activeDrops.map(drop => (
              <Marker key={drop.id} position={[drop.lat, drop.lng]}>
                <Popup>
                  <div className="font-mono text-xs text-black">
                    <strong>DROP:</strong> {drop.title}<br />
                    <span className="text-emerald-600">STATUS: {drop.status}</span><br />
                    Assigned to: {drop.assigned_to?.slice(0,8)}...
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Live Agents + Trails (the Eye) */}
            {liveAgents.map(({ userId, latest }) => {
              if (!latest) return null;
              const trail = userTrails[userId] || [];
              
              return (
                <React.Fragment key={userId}>
                  {trail.length > 1 && (
                    <Polyline positions={trail} color="#ef4444" weight={2.5} opacity={0.6} />
                  )}
                  <Marker position={[latest.lat, latest.lng]}>
                    <Popup>
                      <div className="font-mono text-xs text-black">
                        <strong>AGENT LIVE</strong><br />
                        User: {userId.slice(0,8)}...<br />
                        Accuracy: ±{Math.round(latest.accuracy || 0)}m<br />
                        {new Date(latest.recorded_at).toLocaleTimeString()}
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>

        {/* Sidebar - Active Drops + Live Agents */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col">
          <h3 className="font-semibold mb-4 text-[#106011] font-mono uppercase tracking-widest text-sm flex items-center justify-between">
            ACTIVE DROPS + LIVE AGENTS
            <span className="bg-[#106011] text-black px-2 py-0.5 rounded-full text-[10px] font-bold">LIVE</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {activeDrops.length === 0 && (
              <div className="text-center text-zinc-500 py-8 font-mono text-xs border border-dashed border-zinc-800 rounded-xl">
                No active drops
              </div>
            )}

            {activeDrops.map(drop => {
              const assignedAgent = liveAgents.find(a => a.userId === drop.assigned_to);
              return (
                <div key={drop.id} className="bg-black border border-zinc-800 p-4 rounded-xl">
                  <div className="font-mono text-xs text-[#106011] mb-1 tracking-wider">DROP • {drop.title}</div>
                  <div className="text-[10px] text-zinc-400 mb-2">
                    {drop.lat.toFixed(5)}, {drop.lng.toFixed(5)}
                  </div>
                  
                  {assignedAgent?.latest && (
                    <div className="text-emerald-400 text-[10px] font-mono">
                      AGENT ON FIELD • Live {new Date(assignedAgent.latest.recorded_at).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(dropsError || locationsError) && (
        <div className="fixed bottom-6 right-6 bg-red-950/80 border border-red-900 text-red-400 px-4 py-3 rounded-xl font-mono text-xs z-[999]">
          SYS_ERR: {dropsError || locationsError}
        </div>
      )}
    </div>
  );
}
