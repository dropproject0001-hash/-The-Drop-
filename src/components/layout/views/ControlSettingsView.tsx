import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders, Shield, Bell, HardDrive, Volume2, Globe, LogOut } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';

export function ControlSettingsView() {
  const [cacheMaps, setCacheMaps] = useState(true);
  const [geofencing, setGeofencing] = useState(true);
  const [autoExpire, setAutoExpire] = useState(true);
  const [voiceNotes, setVoiceNotes] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleToggle = (setting: string, val: boolean, setter: (v: boolean) => void) => {
    setter(!val);
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] UPDATE: ${setting} initialized as ${!val ? 'ON' : 'OFF'}.`, ...prev]);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="p-6 text-[#106011] space-y-8 select-none relative custom-scrollbar overflow-y-auto h-[calc(100vh-80px)]">
      
      {/* Header telemetry info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#106011]/40 pb-6 relative z-10">
        <div>
          <span className="text-[9px] font-mono tracking-[0.25em] bg-[#106011]/15 px-2.5 py-1 rounded border border-[#106011]/30 uppercase font-black">
            System Core Matrix
          </span>
          <h2 className="text-2xl font-display font-black tracking-[0.15em] uppercase text-white drop-shadow-[0_0_12px_rgba(16,96,17,0.85)] mt-2">
            CONTROL SETTINGS // CORE DECISIONS
          </h2>
        </div>
        
        <div className="flex gap-4">
          <div className="p-2.5 bg-black/80 border-2 border-[#106011] rounded shadow-[0_0_12px_rgba(16,96,17,0.3)] flex items-center gap-2 text-slate-300 font-mono text-[10px] uppercase font-bold">
            <Sliders className="w-4 h-4 text-[#106011]" />
            <span>FIRMWARE REVISION: 13.04-MBR</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 bg-red-900/20 border-2 border-red-700/50 rounded shadow-[0_0_12px_rgba(153,27,27,0.3)] flex items-center gap-2 text-red-400 font-mono text-[10px] uppercase font-bold hover:bg-red-900/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Session</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* Settings options grid */}
        <div className="bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_20px_rgba(16,96,17,0.3)] relative overflow-hidden space-y-6">
          {/* Tactical HUD corners */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
          
          <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

          {/* Setting Item: Hard Drive / Offline Support */}
          <div className="flex items-center justify-between border-b border-[#106011]/15 pb-4">
            <div className="flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-[#106011] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-xs font-display tracking-wider uppercase">Offline Map Rendering</span>
                <span className="text-[10px] font-mono text-slate-400">Save bandwidth and cache topographical assets</span>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle('Offline Maps Caching', cacheMaps, setCacheMaps)}
              className={`w-14 h-7 rounded-full border border-[#106011]/60 flex items-center px-1 cursor-pointer transition-colors duration-300 ${cacheMaps ? 'bg-[#106011]/30 border-[#106011]' : 'bg-black'}`}
            >
              <div className={`w-5 h-5 rounded-full shadow-md transition-all duration-300 ${cacheMaps ? 'bg-[#106011] translate-x-7 shadow-[0_0_10px_rgba(16,96,17,0.8)]' : 'bg-slate-500'}`} />
            </button>
          </div>

          {/* Setting Item: Geofencing Alerts */}
          <div className="flex items-center justify-between border-b border-[#106011]/15 pb-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-[#106011] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-xs font-display tracking-wider uppercase">Geofencing Realtime Alerts</span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">Uplink warnings on proximate field disruptions</span>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle('Geofencing Warnings', geofencing, setGeofencing)}
              className={`w-14 h-7 rounded-full border border-[#106011]/60 flex items-center px-1 cursor-pointer transition-colors duration-300 ${geofencing ? 'bg-[#106011]/30 border-[#106011]' : 'bg-black'}`}
            >
              <div className={`w-5 h-5 rounded-full shadow-md transition-all duration-300 ${geofencing ? 'bg-[#106011] translate-x-7 shadow-[0_0_10px_rgba(16,96,17,0.8)]' : 'bg-slate-500'}`} />
            </button>
          </div>

          {/* Setting Item: Auto-Expiring Pins */}
          <div className="flex items-center justify-between border-b border-[#106011]/15 pb-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#106011] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-xs font-display tracking-wider uppercase">Auto-Expiring Loot Pins</span>
                <span className="text-[10px] font-mono text-slate-400">Prune older locations once delivery is verified</span>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle('Auto-Expiring Pins', autoExpire, setAutoExpire)}
              className={`w-14 h-7 rounded-full border border-[#106011]/60 flex items-center px-1 cursor-pointer transition-colors duration-300 ${autoExpire ? 'bg-[#106011]/30 border-[#106011]' : 'bg-black'}`}
            >
              <div className={`w-5 h-5 rounded-full shadow-md transition-all duration-300 ${autoExpire ? 'bg-[#106011] translate-x-7 shadow-[0_0_10px_rgba(16,96,17,0.8)]' : 'bg-slate-500'}`} />
            </button>
          </div>

          {/* Setting Item: Voice Notes Comms */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-start gap-3">
              <Volume2 className="w-5 h-5 text-[#106011] shrink-0 mt-0.5 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-xs font-display tracking-wider uppercase">Comms Voice Notes Sub-Channel</span>
                <span className="text-[10px] font-mono text-slate-400">Stream recorded duplex voice files in operations chat</span>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle('Comms Voice Sub-Channel', voiceNotes, setVoiceNotes)}
              className={`w-14 h-7 rounded-full border border-[#106011]/60 flex items-center px-1 cursor-pointer transition-colors duration-300 ${voiceNotes ? 'bg-[#106011]/30 border-[#106011]' : 'bg-black'}`}
            >
              <div className={`w-5 h-5 rounded-full shadow-md transition-all duration-300 ${voiceNotes ? 'bg-[#106011] translate-x-7 shadow-[0_0_10px_rgba(16,96,17,0.8)]' : 'bg-slate-500'}`} />
            </button>
          </div>

        </div>

        {/* Console logs output */}
        <div className="flex flex-col bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_20px_rgba(16,96,17,0.3)] relative overflow-hidden h-full min-h-[300px]">
          {/* Tactical HUD corners */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
          
          <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

          <div className="flex items-center gap-2 border-b border-[#106011]/30 pb-3 mb-4">
            <Globe className="w-4.5 h-4.5 text-[#106011] drop-shadow-[0_0_4px_rgba(16,96,17,0.8)]" />
            <span className="text-white font-display font-bold tracking-[0.16em] text-xs">REGISTRATION UPDATES LEDGER</span>
          </div>

          <div className="flex-1 flex flex-col border border-[#106011]/30 bg-[#106011]/5 rounded p-3 text-[9px] font-mono uppercase tracking-widest text-[#106011] overflow-y-auto custom-scrollbar gap-1.5 shadow-inner">
            <div className="flex items-center gap-1.5 text-white/90 pb-1.5 border-b border-[#106011]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#106011] animate-ping"></span>
              <span>SYS_FIRMWARE_SERVICE: UP</span>
            </div>
            {logs.length === 0 ? (
              <span className="text-slate-400/60 font-medium">Session configurations stable. changes will update this stream.</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={index === 0 ? "text-green-400 font-bold" : "text-slate-400"}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
