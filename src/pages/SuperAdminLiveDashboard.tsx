import React from 'react';
import { useLiveDrops } from '../hooks/realtime/useLiveDrops';
import { useLiveLocations } from '../hooks/realtime/useLiveLocations';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Drop } from '../types';

export default function SuperAdminLiveDashboard() {
  const { drops, error: dropsError } = useLiveDrops();
  const { locations, error: locationsError } = useLiveLocations();

  const activeDrops = drops.filter(d => d.status === 'active' || d.status === 'executed');

  // Get latest location for each drop
  const getLatestLocation = (dropId: string) => {
    const locs = locations[dropId];
    return locs && locs.length > 0 ? locs[locs.length - 1] : null;
  };

  return (
    <div className="p-6 text-white min-h-screen bg-black">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-widest text-[#106011] uppercase drop-shadow-[0_0_10px_rgba(16,96,17,0.5)]">LIVE OPERATIONS</h1>
          <p className="text-[#106011] mt-1 font-mono text-sm tracking-wider">Super Admin • Real-time Command</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">{activeDrops.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono tracking-widest border border-zinc-800 bg-zinc-900/50 px-2 py-0.5 rounded mt-1">ACTIVE OPERATIONS</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Map */}
        <div className="lg:col-span-2 bg-zinc-950 border-2 border-[#106011] relative rounded-2xl overflow-hidden h-[620px] shadow-[0_0_20px_rgba(16,96,17,0.2)]">
          <div className="absolute top-4 left-4 z-[400] bg-black/80 border border-[#106011] px-3 py-1.5 rounded text-[10px] font-mono text-[#106011] uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,1)]"></span>
            LIVE SATCOM UPLINK
          </div>
          <MapContainer 
            center={[14.5995, 120.9842]} 
            zoom={12} 
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            {Object.entries(locations).map(([dropId, locs]) => {
              if (locs.length === 0) return null;
              const latest = locs[locs.length - 1];
              const path = locs.map(l => [l.lat, l.lng] as [number, number]);
              
              return (
                <React.Fragment key={dropId}>
                  {path.length > 1 && (
                    <Polyline positions={path} color="#10b981" weight={3} opacity={0.7} />
                  )}
                  <Marker position={[latest.lat, latest.lng]}>
                    <Popup>
                      <div className="font-mono text-xs text-black">
                        <strong>DROP IDENT:</strong> {dropId}<br />
                        <span className="text-zinc-600">TSTAMP: {new Date(latest.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>

        {/* Live Drops List */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col">
          <h3 className="font-semibold mb-4 text-[#106011] font-mono uppercase tracking-widest text-sm flex items-center justify-between">
            Active Drops
            <span className="bg-[#106011] text-black px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>
              LIVE
            </span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 max-h-[540px]">
            {activeDrops.length === 0 && (
              <div className="text-center text-zinc-500 py-8 font-mono text-xs uppercase tracking-widest border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                No active operations
              </div>
            )}

            {activeDrops.map(drop => {
              const latestLoc = getLatestLocation(drop.id);
              return (
                <div key={drop.id} className="bg-black border border-zinc-800/80 p-4 rounded-xl hover:border-[#106011]/80 transition-colors relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#106011]/20 group-hover:bg-[#106011]/80 transition-colors"></div>
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <div className="font-mono text-[10px] text-zinc-500 mb-1 tracking-wider">IDENT_CODE:</div>
                      <div className="font-mono text-xs text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.3)] break-all">{drop.id}</div>
                      <div className="mt-2 text-emerald-400 font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 bg-emerald-950 rounded border border-emerald-900 inline-block drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] select-none">
                        STATUS: {drop.status}
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono text-right flex flex-col items-end gap-1">
                      <span>T-{new Date(drop.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {latestLoc && (
                    <div className="mt-3 text-[10px] text-zinc-400 font-mono pl-2 border-t border-zinc-900 pt-2 flex items-center gap-2">
                      <span className="text-zinc-600">POS:</span> 
                      <span className="text-blue-400/80">{latestLoc.lat.toFixed(6)}, {latestLoc.lng.toFixed(6)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(dropsError || locationsError) && (
        <div className="fixed bottom-6 right-6 border border-red-900/50 bg-red-950/80 text-red-400 px-4 py-3 rounded-xl font-mono text-xs backdrop-blur-sm drop-shadow-[0_0_15px_rgba(220,38,38,0.3)] z-[999] flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <div>
            <span className="font-bold text-red-500">SYS_ERR:</span> {dropsError || locationsError}
          </div>
        </div>
      )}
    </div>
  );
}
