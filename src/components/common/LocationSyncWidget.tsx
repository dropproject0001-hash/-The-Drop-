import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useLocationOutboxStatus } from '@/hooks/useLocationOutboxStatus';

export function LocationSyncWidget() {
  const { isSyncing, queueSize, flush } = useLocationOutboxStatus();
  const [online, setOnline] = useState(navigator.onLine);
  const [stealthMode, setStealthMode] = useState(() => localStorage.getItem('setting_stealth_mode') === 'true');

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    const checkStealth = () => setStealthMode(localStorage.getItem('setting_stealth_mode') === 'true');
    const interval = setInterval(checkStealth, 2000);

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (isSyncing) return;
    try {
      await flush();
    } catch (e) {
      console.error('[LocationSyncWidget] Manual sync error:', e);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Mini Connection Strength Status */}
      <div 
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-mono tracking-widest uppercase transition-all duration-300 ${
          stealthMode 
            ? 'border-fuchsia-900 bg-fuchsia-950/20 text-fuchsia-500' // stealth style
            : online 
              ? 'border-[#106011]/30 bg-black/40 text-emerald-500' 
              : 'border-red-900 bg-red-950/20 text-red-500 animate-pulse'
        }`}
      >
        {stealthMode ? (
          <span className="font-bold">STEALTH</span>
        ) : online ? (
          <Wifi className="w-3.5 h-3.5 text-[#0ad111]" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-red-500" />
        )}
      </div>

      {/* Main Interactive Button */}
      <button
        onClick={handleManualSync}
        disabled={isSyncing || queueSize === 0}
        className={`h-8 rounded-xl border flex items-center justify-center px-4 font-mono text-[10px] font-bold tracking-widest transition-all duration-300 select-none relative group/sync overflow-hidden ${
          !online && queueSize > 0 
            ? 'border-red-900 bg-red-950/20 text-red-500'
            : isSyncing
            ? 'border-emerald-600 bg-emerald-950/20 text-emerald-500 animate-pulse'
            : 'border-[#106011]/50 bg-black/40 text-[#106011] hover:border-[#106011] hover:text-[#0ad111] hover:shadow-[0_0_15px_rgba(16,96,17,0.4)]'
        }`}
      >
        <span>
          {isSyncing ? 'SYNCING...' : queueSize > 0 ? `SYNC QUEUE (${queueSize})` : 'SYNC OK'}
        </span>
      </button>
    </div>
  );
}
