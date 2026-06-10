import React, { useState, useEffect, useMemo } from 'react';
import { Compass, Crosshair, MapPin, Navigation2, Target, CheckCircle, AlertTriangle, ChevronRight, X } from 'lucide-react';
import { Drop } from '@/types/domain';

interface TelemetryNavigatorProps {
  userLocation: [number, number] | null;
  accuracy: number | null;
  drops: Drop[];
  activeDrop: Drop | null;
  onSelectDrop: (drop: Drop | null) => void;
  onFlyTo: (coords: [number, number]) => void;
  isTracking: boolean;
  onToggleTracking: () => void;
  className?: string;
}

// Haversine formula for distance in meters
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const q1 = (lat1 * Math.PI) / 180;
  const q2 = (lat2 * Math.PI) / 180;
  const dq = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dq / 2) * Math.sin(dq / 2) +
    Math.cos(q1) * Math.cos(q2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Bearing formula relative to true North
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const q1 = (lat1 * Math.PI) / 180;
  const q2 = (lat2 * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(dl) * Math.cos(q2);
  const x =
    Math.cos(q1) * Math.sin(q2) -
    Math.sin(q1) * Math.cos(q2) * Math.cos(dl);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Convert bearing to compass symbol
function getCompassDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

export function TelemetryNavigator({
  userLocation,
  accuracy,
  drops,
  activeDrop,
  onSelectDrop,
  onFlyTo,
  isTracking,
  onToggleTracking,
  className,
}: TelemetryNavigatorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-select first active or claimed drop if none is selected and we have drops
  useEffect(() => {
    if (!activeDrop && drops.length > 0) {
      // Find first drop that is active or claimed
      const priorityDrop = drops.find(d => d.status === 'active' || d.status === 'claimed') || drops[0];
      onSelectDrop(priorityDrop);
    }
  }, [drops, activeDrop, onSelectDrop]);

  // Extract flat coordinates cleanly
  const dropLat = activeDrop?.lat ?? (activeDrop as any)?.location?.lat;
  const dropLng = activeDrop?.lng ?? (activeDrop as any)?.location?.lng;

  // Real-time computations
  const telemetry = useMemo(() => {
    if (!userLocation || !dropLat || !dropLng) {
      return {
        distance: null,
        distanceStr: '---',
        bearing: 0,
        direction: '---',
        etaWalking: '---',
        etaDrive: '---',
      };
    }

    const dist = calculateHaversineDistance(userLocation[0], userLocation[1], dropLat, dropLng);
    const brng = calculateBearing(userLocation[0], userLocation[1], dropLat, dropLng);
    const dir = getCompassDirection(brng);

    // Human readable distance conversion
    let distStr = '';
    if (dist >= 1000) {
      distStr = `${(dist / 1000).toFixed(2)} KM`;
    } else {
      distStr = `${Math.round(dist)} M`;
    }

    // Walking ETA (assume 4.5 km/h -> 1.25 m/s)
    const walkSeconds = dist / 1.25;
    const walkMins = Math.round(walkSeconds / 60);
    const etaWalkStr = walkMins > 60 
      ? `${Math.floor(walkMins / 60)}h ${walkMins % 60}m`
      : `${walkMins} Min`;

    // Transport ETA (assume 30 km/h -> 8.33 m/s)
    const driveSeconds = dist / 8.33;
    const driveMins = Math.round(driveSeconds / 60);
    const etaDriveStr = driveMins > 60
      ? `${Math.floor(driveMins / 60)}h ${driveMins % 60}m`
      : driveMins < 1 
        ? '< 1 Min' 
        : `${driveMins} Min`;

    return {
      distance: dist,
      distanceStr: distStr,
      bearing: Math.round(brng),
      direction: dir,
      etaWalking: etaWalkStr,
      etaDrive: etaDriveStr,
    };
  }, [userLocation, dropLat, dropLng]);

  return (
    <div className={className || "absolute top-[80px] left-4 z-[400] w-72 sm:w-80 select-none"}>
      <div className="bg-black/95 border-2 border-[#106011]/50 hover:border-[#106011]/85 shadow-[0_0_25px_rgba(16,96,17,0.3)] rounded-xl transition-all duration-300 relative overflow-hidden">
        {/* Cyberpunk HUD Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#0ad111] pointer-events-none" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#0ad111] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#0ad111] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#0ad111] pointer-events-none" />
        <div className="absolute inset-px border border-dashed border-[#106011]/15 pointer-events-none" />

        {/* Header Bar */}
        <div className="p-3 border-b border-[#106011]/20 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Crosshair className="w-4 h-4 text-[#0ad111] animate-spin-slow shrink-0" />
              <span className="absolute inset-0 bg-[#0ad111]/15 rounded-full blur-sm" />
            </div>
            <div>
              <h4 className="text-[9px] font-black font-mono text-[#0ad111] tracking-[0.25em] uppercase">
                VECTOR CALCULATOR
              </h4>
              <p className="text-[7px] text-slate-500 font-mono tracking-widest leading-none mt-0.5">
                TELEMETRY NAVIGATOR
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[8px] font-mono border border-[#106011]/40 hover:border-[#0ad111] px-1.5 py-0.5 rounded text-[#0ad111] tracking-wider transition-all"
          >
            {isExpanded ? 'MINIMIZE_HUD' : 'EXPAND_HUD'}
          </button>
        </div>

        {isExpanded && (
          <div className="p-3 space-y-3">
            {/* Target Select Dropdown */}
            <div className="space-y-1">
              <label className="text-[7px] font-mono text-slate-500 tracking-wider uppercase flex items-center justify-between">
                <span>SELECT_WAYPOINT_TARGET</span>
                {activeDrop && (
                  <span className="text-[#0ad111] font-bold">LOCKED_ON</span>
                )}
              </label>
              
              <div className="relative">
                <select
                  value={activeDrop?.id || ''}
                  onChange={(e) => {
                    const drop = drops.find(d => d.id === e.target.value) || null;
                    onSelectDrop(drop);
                  }}
                  className="w-full bg-black border-2 border-[#106011]/40 rounded p-2 text-[10px] font-mono text-[#0ad111] tracking-wide focus:outline-none focus:border-[#0ad111] hover:border-[#106011]/80 cursor-pointer transition-all appearance-none"
                >
                  <option value="" className="bg-black text-slate-500">
                    -- SELECT ACTIVE TARGET --
                  </option>
                  {drops.map((d) => (
                    <option key={d.id} value={d.id} className="bg-black text-[#0ad111]">
                      {d.title || `DROP_${d.id.substring(0, 6).toUpperCase()}`} ({d.status.toUpperCase()})
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#106011]">
                  <ChevronRight size={12} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* GPS Vector Readout Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Distance Display */}
              <div className="bg-zinc-950 border border-[#106011]/30 rounded p-2 text-center relative overflow-hidden group hover:border-[#0ad111]/50 transition-colors">
                <p className="text-[7px] font-mono text-slate-500 tracking-wider uppercase mb-1">
                  GEODESIC_DISTANCE
                </p>
                {telemetry.distanceStr !== '---' ? (
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-black text-[#0ad111] tracking-wider font-mono drop-shadow-[0_0_4px_rgba(10,209,17,0.35)]">
                      {telemetry.distanceStr}
                    </p>
                    <span className="text-[6.5px] text-slate-400 font-mono mt-0.5">LINE_OF_SIGHT</span>
                  </div>
                ) : (
                  <div className="text-center py-0.5 flex flex-col items-center">
                    <AlertTriangle className="w-3 h-3 text-amber-500 mb-0.5 animate-pulse" />
                    <span className="text-[6.5px] font-mono text-amber-500 pr-0.5 font-bold animate-pulse">NO_GPS_LOC</span>
                  </div>
                )}
              </div>

              {/* Bearing / Heading Display */}
              <div className="bg-zinc-950 border border-[#106011]/30 rounded p-2 text-center relative overflow-hidden group hover:border-[#0ad111]/50 transition-colors">
                <p className="text-[7px] font-mono text-slate-500 tracking-wider uppercase mb-1">
                  BEARING_NORTH
                </p>
                {telemetry.distanceStr !== '---' ? (
                  <div className="flex items-center justify-center gap-2">
                    {/* Compact Rotating Vector Needle */}
                    <div className="relative w-7 h-7 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-[#106011]/25 border-dashed" />
                      <Navigation2 
                        className="w-3.5 h-3.5 text-[#0ad111] transition-transform duration-500"
                        style={{ transform: `rotate(${telemetry.bearing}deg)` }}
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-[#0ad111] font-mono leading-tight">
                        {telemetry.bearing}° {telemetry.direction}
                      </p>
                      <span className="text-[6.5px] text-slate-500 font-mono uppercase">GRID_NORTH</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-0.5">
                    <div className="relative w-6 h-6 mx-auto flex items-center justify-center">
                      <Compass className="w-4 h-4 text-slate-600 animate-spin-slow" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Travel ETAs */}
            {telemetry.distanceStr !== '---' && (
              <div className="bg-zinc-950/60 border border-[#106011]/25 rounded p-2 flex justify-between items-center text-[8.5px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">ETA_WALK:</span>
                  <span className="text-[#0ad111] font-bold">{telemetry.etaWalking}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#106011]/30" />
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">ETA_VEHICLE:</span>
                  <span className="text-[#0ad111] font-bold">{telemetry.etaDrive}</span>
                </div>
              </div>
            )}

            {/* Signal Status and Lock Coordinates */}
            <div className="pt-2 border-t border-[#106011]/10 space-y-1.5 text-[8px] font-mono">
              <div className="flex justify-between items-center text-slate-400">
                <span>SIGNAL_ACCURACY:</span>
                {accuracy != null ? (
                  <span className="text-[#0ad111] font-bold">±{Math.round(accuracy)} M</span>
                ) : (
                  <span className="text-amber-500 font-semibold animate-pulse">NO_FIX_ESTABLISHED</span>
                )}
              </div>
              
              {userLocation && (
                <div className="flex justify-between items-center text-slate-400 gap-1.5">
                  <span>GPS_COORDS:</span>
                  <span className="text-slate-300 font-mono text-[7px] truncate select-all bg-black px-1 rounded border border-[#106011]/20">
                    {userLocation[0].toFixed(5)}N, {userLocation[1].toFixed(5)}E
                  </span>
                </div>
              )}

              {activeDrop && (dropLat != null) && (
                <div className="flex justify-between items-center text-slate-400 gap-1.5">
                  <span>TARGET_COORDS:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[#0ad111] font-bold text-[7px] truncate bg-black px-1 rounded border border-[#106011]/40">
                      {dropLat.toFixed(5)}N, {dropLng.toFixed(5)}E
                    </span>
                    <button
                      onClick={() => onFlyTo([dropLat, dropLng])}
                      className="p-0.5 border border-[#106011]/30 hover:border-[#0ad111] hover:bg-[#106011]/10 rounded transition-all text-[#0ad111]"
                      title="Fly map to waypoint"
                    >
                      <Target size={9} />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Button: GPS toggle shortcut */}
              {!isTracking && (
                <button
                  onClick={onToggleTracking}
                  className="w-full mt-2 bg-[#106011]/10 hover:bg-[#0ad111]/20 border border-[#106011]/40 hover:border-[#0ad111] text-[#0ad111] font-bold py-1.5 rounded transition-all duration-300 flex items-center justify-center gap-1.5 uppercase tracking-widest text-[8px] cursor-pointer"
                >
                  <Navigation2 size={10} className="animate-pulse" />
                  STRIKE_GPS_LINK_SIGNAL
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
