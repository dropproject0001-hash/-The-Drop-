import React, { useEffect, useState } from 'react';
import { locationBroadcastService } from '../../services/LocationBroadcastService';
import { usePresenceTracking } from '../../hooks/realtime/usePresenceTracking';

interface DebugPanelProps {
  visible?: boolean;
}

export function LocationDebugPanel({ visible = true }: DebugPanelProps) {
  const [queueSize, setQueueSize] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [lastBroadcast, setLastBroadcast] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(visible);
  const [isMinimized, setIsMinimized] = useState(() => localStorage.getItem('location_debug_minimized') === 'true');

  const { activeBroadcasters } = usePresenceTracking();

  // Poll service state
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueSize(locationBroadcastService.queueSize);
      setIsOnline(locationBroadcastService.isOnline);
      setIsBroadcasting(locationBroadcastService.isCurrentlyBroadcasting());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const toggleMinimized = () => {
    setIsMinimized(prev => {
      const next = !prev;
      localStorage.setItem('location_debug_minimized', String(next));
      return next;
    });
  };

  const handleFlushQueue = async () => {
    await locationBroadcastService.flushQueue();
    setQueueSize(locationBroadcastService.queueSize);
  };

  const handleClearQueue = async () => {
    await locationBroadcastService.clearQueue();
    setQueueSize(0);
  };

  const handleStartTracking = async () => {
    await locationBroadcastService.startTracking();
    setLastBroadcast(new Date().toLocaleTimeString());
  };

  const handleStopTracking = () => {
    locationBroadcastService.stopTracking();
  };

  if (!showPanel) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] bg-zinc-950 border border-[#106011] rounded-2xl shadow-[0_0_30px_rgba(16,96,17,0.3)] text-white font-mono text-xs overflow-hidden transition-all duration-200 ${isMinimized ? 'w-48' : 'w-80'}`}>
      {/* Header */}
      <div 
        onClick={toggleMinimized}
        className={`flex items-center justify-between bg-[#106011]/10 px-4 py-2 border-[#106011]/30 select-none cursor-pointer hover:bg-[#106011]/20 transition ${isMinimized ? '' : 'border-b'}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className={`w-2 h-2 shrink-0 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
          <span className="font-bold tracking-widest text-[#0ad111] truncate">
            {isMinimized ? 'LOC DBG' : 'LOCATION DEBUG'}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimized();
            }} 
            className="text-[#106011] hover:text-white transition font-bold"
            title={isMinimized ? "Expand Panel" : "Minimize Panel"}
          >
            {isMinimized ? '[+]' : '[-]'}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowPanel(false);
            }} 
            className="text-[#106011] hover:text-white transition"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-4 text-[11px]">
          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/60 border border-zinc-800 rounded-lg p-3">
              <div className="text-zinc-500 text-[9px] tracking-widest">NETWORK</div>
              <div className={`font-bold text-lg ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </div>
            </div>

            <div className="bg-black/60 border border-zinc-800 rounded-lg p-3">
              <div className="text-zinc-500 text-[9px] tracking-widest">QUEUE</div>
              <div className="font-bold text-lg text-amber-400 flex items-baseline gap-1">
                {queueSize}
                <span className="text-[9px] text-zinc-500">pending</span>
              </div>
            </div>

            <div className="bg-black/60 border border-zinc-800 rounded-lg p-3">
              <div className="text-zinc-500 text-[9px] tracking-widest">BROADCASTING</div>
              <div className={`font-bold text-lg ${isBroadcasting ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {isBroadcasting ? 'ACTIVE' : 'IDLE'}
              </div>
            </div>

            <div className="bg-black/60 border border-zinc-800 rounded-lg p-3">
              <div className="text-zinc-500 text-[9px] tracking-widest">LAST UPDATE</div>
              <div className="font-mono text-emerald-400">
                {lastBroadcast || '—'}
              </div>
            </div>
          </div>

          {/* Active Broadcasters */}
          <div>
            <div className="text-[#106011] text-[9px] tracking-[2px] mb-1.5">ACTIVE FIELD AGENTS ({activeBroadcasters.length})</div>
            <div className="max-h-24 overflow-auto bg-black/60 border border-zinc-800 rounded-lg p-2 text-[10px] space-y-1">
              {activeBroadcasters.length === 0 && (
                <div className="text-zinc-500 italic">No active broadcasters</div>
              )}
              {activeBroadcasters.map((agent, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-emerald-400">{agent.user_id?.slice(0, 8)}...</span>
                  <span className="text-zinc-500 text-[9px]">{agent.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
            <button
              onClick={handleStartTracking}
              disabled={isBroadcasting}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-black text-[10px] font-bold tracking-widest rounded-lg transition"
            >
              START TRACKING
            </button>
            
            <button
              onClick={handleStopTracking}
              disabled={!isBroadcasting}
              className="flex-1 py-2 bg-red-600/80 hover:bg-red-600 disabled:bg-zinc-700 text-white text-[10px] font-bold tracking-widest rounded-lg transition"
            >
              STOP TRACKING
            </button>

            <button
              onClick={handleFlushQueue}
              className="flex-1 py-2 bg-amber-600/80 hover:bg-amber-600 text-black text-[10px] font-bold tracking-widest rounded-lg transition"
            >
              FLUSH QUEUE
            </button>

            <button
              onClick={handleClearQueue}
              className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-[10px] font-bold tracking-widest rounded-lg transition"
            >
              CLEAR QUEUE
            </button>
          </div>

          <div className="text-center text-[8px] text-zinc-600 pt-1">
            LocationBroadcastService v1 • Edge Function + Dexie + Presence
          </div>
        </div>
      )}
    </div>
  );
}
