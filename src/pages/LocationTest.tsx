import React, { useState, useEffect } from 'react';
import { locationService, LocationCoords } from '@/services/LocationService';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Signal, SignalLow, SignalZero, Compass } from 'lucide-react';

export function LocationTest() {
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<LocationCoords[]>([]);

  const handleUpdate = (coords: LocationCoords) => {
    setCurrentLocation(coords);
    setHistory(prev => [coords, ...prev].slice(0, 5));
    setError(null);
  };

  const toggleTracking = () => {
    if (isTracking) {
      locationService.stopTracking();
      setIsTracking(false);
    } else {
      setIsTracking(true);
      locationService.startTracking(handleUpdate, (err) => {
        setError(err.message);
        setIsTracking(false);
      });
    }
  };

  const getSignalIcon = () => {
    if (!currentLocation) return <SignalZero className="w-5 h-5 text-red-500" />;
    if (currentLocation.accuracy < 20) return <Signal className="w-5 h-5 text-[#0ad111]" />;
    if (currentLocation.accuracy < 100) return <SignalLow className="w-5 h-5 text-yellow-500" />;
    return <SignalZero className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-[--bg-primary] p-6 pt-24 font-mono text-slate-100">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Tactical Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#106011] shadow-[0_0_8px_#106011]" />
            <h1 className="text-xl font-bold tracking-[0.3em] uppercase text-[#0ad111]">Laboratory // GPS Link</h1>
          </div>
          <p className="text-[10px] text-slate-500 tracking-widest uppercase">Secured terminal for spatial telemetry testing.</p>
        </div>

        {/* Status Card */}
        <div className="bg-black/60 border border-[#106011]/80 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-4 opacity-40">
             <Navigation className={`w-12 h-12 text-[#0ad111] ${isTracking ? 'animate-pulse' : ''}`} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {getSignalIcon()}
              <span className="text-xs font-bold tracking-[0.2em] text-[#0ad111]">
                {isTracking ? 'UPLINK ESTABLISHED' : 'LINK STANDBY'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[8px] text-slate-500 tracking-tighter">LATITUDE</p>
                <p className="text-sm font-bold text-white tabular-nums">
                  {currentLocation?.latitude.toFixed(6) || '---.------'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] text-slate-500 tracking-tighter">LONGITUDE</p>
                <p className="text-sm font-bold text-white tabular-nums">
                  {currentLocation?.longitude.toFixed(6) || '---.------'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] text-slate-500 tracking-tighter">ACCURACY</p>
                <p className={`text-sm font-bold tabular-nums ${currentLocation && currentLocation.accuracy > 50 ? 'text-yellow-500' : 'text-[#0ad111]'}`}>
                  {currentLocation ? `${currentLocation.accuracy.toFixed(1)}m` : '---'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] text-slate-500 tracking-tighter">BEARING</p>
                <p className="text-sm font-bold text-white tabular-nums">
                  {currentLocation?.heading ? `${currentLocation.heading.toFixed(1)}°` : 'N/A'}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded text-red-500 text-[9px] uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                SIGNAL_DENIED: {error}
              </div>
            )}

            <button 
              onClick={toggleTracking}
              className={`w-full py-4 rounded-xl border font-bold tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 ${
                isTracking 
                ? 'bg-red-950/20 border-red-600 text-red-500 animate-pulse' 
                : 'bg-[#106011]/20 border-[#106011] text-[#0ad111] hover:bg-[#106011]/30'
              }`}
            >
              <Compass className={`w-4 h-4 ${isTracking ? 'animate-spin' : ''}`} />
              {isTracking ? 'TERMINATE UPLINK' : 'ENGAGE GPS MODULE'}
            </button>
          </div>
        </div>

        {/* Telemetry Stream */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-[#0ad111] tracking-widest uppercase border-b border-[#106011]/30 pb-2">RAW TELEMETRY STREAM</h2>
          <div className="space-y-2">
            <AnimatePresence>
              {history.map((pt, idx) => (
                <motion.div 
                  key={pt.timestamp}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-black/40 border border-[#106011]/20 rounded-lg flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[8px] text-[#106011] font-bold">#{history.length - idx}</span>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-300 font-mono tracking-tighter">
                        {pt.latitude.toFixed(4)}, {pt.longitude.toFixed(4)}
                      </span>
                      <span className="text-[7px] text-slate-500">
                        {new Date(pt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-[7px] text-[#0ad111] opacity-40 group-hover:opacity-100 transition-opacity">
                    ACC: {pt.accuracy.toFixed(1)}m
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {history.length === 0 && (
              <p className="text-[8px] text-slate-600 italic text-center py-8">NO DATA IN BUFFER</p>
            )}
          </div>
        </div>

        {/* Operational Warning */}
        <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-lg">
          <p className="text-[8px] text-red-600 font-mono tracking-widest leading-relaxed">
            CRITICAL: Real-time tracking transmits coordinates to base headquarters (Supabase). Maintain operational awareness. Jamming or signal shielding will result in telemetry drift.
          </p>
        </div>
      </div>
    </div>
  );
}
