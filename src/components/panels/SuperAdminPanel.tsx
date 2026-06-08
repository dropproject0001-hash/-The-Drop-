import { DropMap } from '@/components/map/DropMap';
import { Activity, Radio, Shield, Users, PackageSearch, Terminal } from 'lucide-react';

export function SuperAdminPanel() {
  return (
    <div className="flex flex-col h-full bg-black/40 rounded-2xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-red-500/10 border-b border-red-500/20">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          <h2 className="text-red-500 font-display font-bold tracking-widest uppercase text-sm">Super Admin / Owner</h2>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-[10px] font-mono text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> OVERSEER
          </span>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative min-h-[300px]">
        <DropMap height="100%" />
        {/* Absolute HUD */}
        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
          <HUDItem bg="bg-red-950/80" border="border-red-500/30" text="text-red-200">
            <Terminal className="w-3 h-3 text-red-400" /> ALL AGENTS VISIBLE
          </HUDItem>
          <HUDItem bg="bg-red-950/80" border="border-red-500/30" text="text-red-200">
            <Activity className="w-3 h-3 text-red-400" /> SYSTEM OVERRIDE ACTIVE
          </HUDItem>
        </div>
      </div>

      {/* Control Panel Area */}
      <div className="h-48 border-t border-red-500/20 bg-background/50 p-4 shrink-0 flex flex-col gap-2">
        {/* Tabs */}
        <div className="flex text-xs font-mono text-red-400/60 uppercase tracking-widest border-b border-red-500/10 pb-2">
          <button className="text-red-400 border-b border-red-500 pb-2 -mb-[9px] mr-6">Live Logs</button>
          <button className="hover:text-red-300 transition-colors mr-6">Inventory</button>
          <button className="hover:text-red-300 transition-colors">Agents (12)</button>
        </div>

        {/* Content */}
        <div className="flex-1 rounded border border-red-500/10 bg-red-950/20 p-2 overflow-y-auto font-mono text-[10px] flex flex-col gap-1">
          <div className="flex gap-2">
            <span className="text-red-500/50">[12:04:22]</span>
            <span className="text-red-200">System uplink established. Scanning DropZones...</span>
          </div>
          <div className="flex gap-2">
            <span className="text-red-500/50">[12:05:11]</span>
            <span className="text-green-400">Agent 'Phantom' (Dropper) is online.</span>
          </div>
          <div className="flex gap-2">
            <span className="text-red-500/50">[12:06:40]</span>
            <span className="text-red-200">Awaiting encrypted comms from active operations.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HUDItem({ children, bg, border, text }: { children: React.ReactNode, bg: string, border: string, text: string }) {
  return (
    <div className={`px-3 py-1 rounded backdrop-blur-md flex items-center gap-2 border ${bg} ${border} ${text}`}>
      <span className="text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">{children}</span>
    </div>
  )
}
