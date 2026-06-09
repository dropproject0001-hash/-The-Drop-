import { useState } from 'react';
import { Users, Wifi, ShieldAlert, Navigation, MessageSquare, Radar } from 'lucide-react';

interface DropperListViewProps {
  onSwitchToChat?: () => void;
}

export function DropperListView({ onSwitchToChat }: DropperListViewProps) {
  const [agents, setAgents] = useState([
    { id: 'D10', alias: 'Phantom', sector: 'Mamburao Central East', status: 'Active', signal: '106.011 MHz', strength: 98, lat: 13.2265, lng: 120.5961, latency: '4ms' },
    { id: 'D12', alias: 'Ghost', sector: 'Paypay Offshore Terminal', status: 'Running', signal: '106.045 MHz', strength: 71, lat: 13.2450, lng: 120.5822, latency: '22ms' },
    { id: 'D14', alias: 'Vanguard', sector: 'Centro West Base 2', status: 'Standby', signal: '106.002 MHz', strength: 89, lat: 13.2118, lng: 120.6050, latency: '8ms' },
    { id: 'D17', alias: 'Ranger', sector: 'Northern Airport Zone', status: 'Offline', signal: '106.014 MHz', strength: 0, lat: 13.2554, lng: 120.6121, latency: 'N/A' },
  ]);

  const [pingingAgent, setPingingAgent] = useState<string | null>(null);
  const [pingLogs, setPingLogs] = useState<string[]>([]);

  const handlePing = (alias: string, index: number) => {
    setPingingAgent(alias);
    setPingLogs(prev => [`[${new Date().toLocaleTimeString()}] PINGING Operative: ${alias}...`, ...prev]);
    
    setTimeout(() => {
      // Randomly fluctuation coordinates on ping
      setAgents(prev => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          lat: Number((next[index].lat + (Math.random() - 0.5) * 0.002).toFixed(4)),
          lng: Number((next[index].lng + (Math.random() - 0.5) * 0.002).toFixed(4)),
          latency: `${Math.floor(2 + Math.random() * 30)}ms`
        };
        return next;
      });
      setPingLogs(prev => [
        `[${new Date().toLocaleTimeString()}] PING SUCCESS: ${alias} response received.`,
        `[${new Date().toLocaleTimeString()}] POSITION RETRIEVED: ${agents[index].lat}, ${agents[index].lng}`,
        ...prev
      ]);
      setPingingAgent(null);
    }, 1200);
  };

  return (
    <div className="p-6 text-[#106011] space-y-8 select-none relative custom-scrollbar overflow-y-auto h-[calc(100vh-80px)]">
      
      {/* Header info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#106011]/40 pb-6 relative z-10">
        <div>
          <span className="text-[9px] font-mono tracking-[0.25em] bg-[#106011]/15 px-2.5 py-1 rounded border border-[#106011]/30 uppercase font-black">
            Mamburao Operator Network
          </span>
          <h2 className="text-2xl font-display font-black tracking-[0.15em] uppercase text-white drop-shadow-[0_0_12px_rgba(16,96,17,0.85)] mt-2">
            DROPPER LIST // OPERATIVES INDEX
          </h2>
        </div>
        
        <div className="p-2.5 bg-black/80 border-2 border-[#106011] rounded shadow-[0_0_12px_rgba(16,96,17,0.3)] flex items-center gap-2 text-slate-300 font-mono text-[10px] uppercase font-bold">
          <Users className="w-4 h-4 text-[#106011]" />
          <span>OPERATOR DUPLEX STREAMS: 4 CONNECTED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        {/* Left Side: Agents Roster */}
        <div className="xl:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent, index) => {
              const isPinging = pingingAgent === agent.alias;
              const isOffline = agent.status === 'Offline';
              
              return (
                <div 
                  key={agent.id} 
                  className="bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_20px_rgba(16,96,17,0.3)] hover:shadow-[0_0_28px_rgba(16,96,17,0.5)] transition-all relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#106011] rounded-tl-lg pointer-events-none drop-shadow-[0_0_4px_#106011]"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#106011] rounded-tr-lg pointer-events-none drop-shadow-[0_0_4px_#106011]"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#106011] rounded-bl-lg pointer-events-none drop-shadow-[0_0_4px_#106011]"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#106011] rounded-br-lg pointer-events-none drop-shadow-[0_0_4px_#106011]"></div>

                  {/* High contrast nested double borders */}
                  <div className="absolute inset-1 border border-dashed border-[#106011]/25 rounded-xl pointer-events-none"></div>

                  <div className="relative z-10 space-y-4 w-full">
                    <div className="flex justify-between items-center border-b border-[#106011]/30 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className={`absolute -inset-0.5 rounded-full blur-xs opacity-60 ${isOffline ? 'bg-red-500' : 'bg-green-500 animate-ping'}`}></span>
                          <span className={`relative w-2 h-2 rounded-full block ${isOffline ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">OPERATIVE ID: {agent.id}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isOffline ? 'bg-red-950/40 text-red-500 border-red-800' : 'bg-green-950/40 text-green-400 border-green-800 font-bold'}`}>
                        {agent.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-display font-black tracking-widest text-white uppercase">{agent.alias}</h3>
                      <p className="text-[11px] font-mono text-slate-300 tracking-wider">SECTOR: {agent.sector}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300 py-2 border-y border-[#106011]/20">
                      <div>
                        <span className="text-[#106011] font-bold">FRQ:</span> {agent.signal}
                      </div>
                      <div>
                        <span className="text-[#106011] font-bold">LATENCY:</span> {agent.latency}
                      </div>
                      <div className="col-span-2 text-[8.5px] tracking-wide text-slate-400">
                        <span className="text-[#106011] font-bold">GPS:</span> {agent.lat.toFixed(4)}° N, {agent.lng.toFixed(4)}° E
                      </div>
                    </div>

                    {/* Agent stream state */}
                    <div className="flex items-center gap-2 text-[9px] font-mono uppercase font-black tracking-widest text-[#106011]">
                      <Wifi className="w-3.5 h-3.5" />
                      <span>UPLINK DUPLEX STREAM: {agent.strength}% STABLE</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-3">
                      <button
                        onClick={() => handlePing(agent.alias, index)}
                        disabled={isPinging || isOffline}
                        className={`flex-1 h-9 border-2 border-[#106011]/60 rounded-lg flex items-center justify-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-wider relative overflow-hidden transition-all select-none ${isOffline ? 'bg-red-950/15 border-red-900/40 text-slate-500 cursor-not-allowed' : isPinging ? 'bg-[#106011]/30 text-slate-300' : 'bg-black text-[#106011] hover:bg-[#106011]/20 shadow-sm shadow-[#106011]/30 hover:scale-[1.02]'}`}
                      >
                        <Radar className={`w-3 h-3 ${isPinging ? 'animate-spin text-green-400' : ''}`} />
                        <span>{isPinging ? 'PINGING...' : 'PING GPS'}</span>
                      </button>

                      <button
                        onClick={onSwitchToChat}
                        disabled={isOffline}
                        className="flex-1 h-9 border-2 border-[#106011]/60 rounded-lg flex items-center justify-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-wider bg-black text-[#106011] hover:bg-[#106011]/20 hover:scale-[1.02] shadow-sm shadow-[#106011]/30 transition-all cursor-pointer disabled:bg-red-950/15 disabled:border-red-900/40 disabled:text-slate-500 disabled:cursor-not-allowed"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>COMMS FEED</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Radar telemetry / logs */}
        <div className="flex flex-col bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_20px_rgba(16,96,17,0.3)] relative overflow-hidden h-full min-h-[400px]">
          {/* Tactical HUD corners */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
          
          <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

          <div className="flex items-center gap-2 border-b border-[#106011]/30 pb-3 mb-4">
            <ShieldAlert className="w-4.5 h-4.5 text-[#106011] animate-pulse drop-shadow-[0_0_4px_#106011]" />
            <span className="text-white font-display font-bold tracking-[0.16em] text-xs">GPS PING TELEMETRY LOGS</span>
          </div>

          <p className="text-[10px] font-mono text-slate-400 tracking-wider leading-relaxed mb-4">
            Broadcast encrypted pings to scan and lock coordinate displacements for active operaters on Mamburao grid.
          </p>

          <div className="flex-1 flex flex-col border border-[#106011]/30 bg-[#106011]/5 rounded p-3 text-[9px] font-mono uppercase tracking-widest text-[#106011] overflow-y-auto custom-scrollbar gap-1.5 shadow-inner">
            <div className="flex items-center gap-1.5 text-white/90 pb-1.5 border-b border-[#106011]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#106011] animate-ping"></span>
              <span>GPS_PING_MONITOR: UP</span>
            </div>
            {pingLogs.length === 0 ? (
              <span className="text-slate-400/60 font-medium">No ping sweeps conducted. trigger "PING GPS" on an operator.</span>
            ) : (
              pingLogs.map((log, index) => (
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
