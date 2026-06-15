import React, { useEffect, useState } from 'react';
import { locationBroadcastService } from '../../services/LocationBroadcastService';
import { usePresenceTracking } from '../../hooks/realtime/usePresenceTracking';
import { useLocationOutboxStatus } from '../../hooks/useLocationOutboxStatus';
import { LocationOutbox } from '../../services/LocationOutbox';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DebugPanelProps {
  visible?: boolean;
}

export function LocationDebugPanel({ visible = true }: DebugPanelProps) {
  const { queueSize, flush, clear } = useLocationOutboxStatus();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [lastBroadcast, setLastBroadcast] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(visible);
  const [isMinimized, setIsMinimized] = useState(() => localStorage.getItem('location_debug_minimized') === 'true');
  const [history, setHistory] = useState<{ time: string; count: number; kb: number }[]>([]);

  const { activeBroadcasters } = usePresenceTracking();

  // Poll service state
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setIsOnline(locationBroadcastService.isOnline);
      setIsBroadcasting(locationBroadcastService.isCurrentlyBroadcasting());
    }, 2000);

    return () => clearInterval(statusInterval);
  }, []);

  // Poll storage history
  useEffect(() => {
    let mounted = true;
    const pollStorage = async () => {
      if (!mounted) return;
      try {
        const items = await LocationOutbox.getAll();
        const count = items.length;
        const bytes = new Blob([JSON.stringify(items)]).size;
        const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
        
        setHistory(prev => {
          const next = [...prev, { time, count, kb: Number((bytes / 1024).toFixed(2)) }];
          if (next.length > 15) return next.slice(next.length - 15);
          return next;
        });
      } catch (e) {
        console.error("Storage diagnostic polling error:", e);
      }
    };

    pollStorage();
    const storageInterval = setInterval(pollStorage, 3000);
    return () => {
      mounted = false;
      clearInterval(storageInterval);
    };
  }, []);

  const toggleMinimized = () => {
    setIsMinimized(prev => {
      const next = !prev;
      localStorage.setItem('location_debug_minimized', String(next));
      return next;
    });
  };

  const handleFlushQueue = async () => {
    await flush();
  };

  const handleClearQueue = async () => {
    await clear();
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
        <div className="p-4 space-y-4 text-[11px] max-h-[85vh] overflow-y-auto w-[100%]">
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

          {/* Diagnostic Chart */}
          <div className="bg-black/60 border border-zinc-800 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-zinc-500 text-[9px] tracking-widest">STORAGE DIAGNOSTIC (IndexedDB)</span>
              <span className="text-emerald-400 text-[10px]">{history.length > 0 ? `${history[history.length-1].kb} KB` : '0 KB'}</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <LineChart data={history} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#10b981" 
                    tick={{ fontSize: 9, fill: '#10b981' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#f59e0b" 
                    tick={{ fontSize: 9, fill: '#f59e0b' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '10px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="kb" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-1 px-1">
              <span className="text-[8px] text-emerald-500">── Size (KB)</span>
              <span className="text-[8px] text-amber-500">── Count</span>
            </div>
          </div>

          {/* Active Broadcasters */}
          <div>
            <div className="text-[#106011] text-[9px] tracking-[2px] mb-1.5">ACTIVE FIELD AGENTS ({activeBroadcasters.length})</div>
            <div className="max-h-20 overflow-auto bg-black/60 border border-zinc-800 rounded-lg p-2 text-[10px] space-y-1">
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
              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-black text-[10px] font-bold tracking-widest rounded-lg transition"
            >
              START
            </button>
            
            <button
              onClick={handleStopTracking}
              disabled={!isBroadcasting}
              className="flex-1 py-1.5 bg-red-600/80 hover:bg-red-600 disabled:bg-zinc-700 text-white text-[10px] font-bold tracking-widest rounded-lg transition"
            >
              STOP
            </button>

            <button
              onClick={handleFlushQueue}
              className="flex-1 py-1.5 bg-amber-600/80 hover:bg-amber-600 text-black text-[10px] font-bold tracking-widest rounded-lg transition"
            >
              FLUSH
            </button>

            <button
              onClick={handleClearQueue}
              className="flex-1 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-[10px] font-bold tracking-widest rounded-lg transition"
            >
              CLEAR
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
