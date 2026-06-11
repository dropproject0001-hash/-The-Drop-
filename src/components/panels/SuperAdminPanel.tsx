import { lazy, Suspense } from 'react';
import { Activity, Radio, Shield, Users, PackageSearch, Terminal, Plus } from 'lucide-react';
import { CreateDropPanel } from './CreateDropPanel';
import { useState } from 'react';

const DropMap = lazy(() => import('@/components/map/DropMap'));

export function SuperAdminPanel() {
  const [showCreateDrop, setShowCreateDrop] = useState(false);
  
  return (
    <div className="flex flex-col h-full bg-black/95 rounded-2xl border border-[#106011]/50 shadow-[0_0_20px_rgba(16,96,17,0.3)] overflow-hidden relative select-none">
      {showCreateDrop && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <CreateDropPanel onClose={() => setShowCreateDrop(false)} />
        </div>
      )}
      {/* Tactical HUD Corner Brackets */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#106011] rounded-tl-xl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.8)] z-30"></div>
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#106011] rounded-tr-xl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.8)] z-30"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#106011] rounded-bl-xl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.8)] z-30"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#106011] rounded-br-xl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.8)] z-30"></div>

      {/* Inner Nested Rectangle Tactical HUD lines */}
      <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none z-20"></div>
      <div className="absolute inset-2 border border-[#106011]/15 rounded-lg pointer-events-none z-20"></div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-[#106011]/10 border-b border-[#106011]/50 relative z-20">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#106011] drop-shadow-[0_0_6px_rgba(16,96,17,0.8)] animate-pulse" />
          <h2 className="text-[#106011] font-display font-black tracking-[0.18em] uppercase text-sm drop-shadow-[0_0_8px_rgba(16,96,17,0.7)]">
            Gods Eye for The Owner
          </h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreateDrop(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#106011]/20 hover:bg-[#106011]/40 border border-[#106011] text-[10px] font-mono font-bold tracking-widest uppercase transition-colors"
          >
            <Plus size={12} /> ADD
          </button>
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#106011] font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#106011] animate-ping mr-1.5" /> OVERSEER
          </span>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative min-h-[300px] z-10">
        <Suspense fallback={
          <div className="flex-1 h-full w-full bg-black/95 flex items-center justify-center font-mono text-xs uppercase text-[#106011]/80 tracking-widest animate-pulse min-h-[300px]">
            <span className="w-2 h-2 rounded-full bg-[#106011] animate-ping mr-2"></span>
            Loading Gods Eye Map telemetry...
          </div>
        }>
          <DropMap height="100%" />
        </Suspense>
        {/* Absolute HUD */}
        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
          <HUDItem bg="bg-black/85" border="border-[#106011]/40" text="text-[#106011] drop-shadow-[0_0_4px_rgba(16,96,17,0.5)]">
            <Terminal className="w-3 h-3 text-[#106011]" /> ALL AGENTS VISIBLE
          </HUDItem>
          <HUDItem bg="bg-black/85" border="border-[#106011]/40" text="text-[#106011] drop-shadow-[0_0_4px_rgba(16,96,17,0.5)]">
            <Activity className="w-3 h-3 text-[#106011]" /> SYSTEM OVERRIDE ACTIVE
          </HUDItem>
        </div>
      </div>

      {/* Control Panel Area */}
      <div className="h-48 border-t border-[#106011]/40 bg-[#090b09]/95 p-4 shrink-0 flex flex-col gap-2 relative z-20">
        {/* Tabs */}
        <div className="flex text-xs font-mono text-[#106011]/60 uppercase tracking-widest border-b border-[#106011]/25 pb-2">
          <button className="text-[#106011] border-b-2 border-[#106011] pb-2 -mb-[9px] mr-6 font-bold tracking-wider drop-shadow-[0_0_4px_rgba(16,96,17,0.5)]">Live Logs</button>
          <button className="hover:text-slate-300 transition-colors mr-6">Inventory</button>
          <button className="hover:text-slate-300 transition-colors">Agents (12)</button>
        </div>

        {/* Content */}
        <div className="flex-1 rounded border border-[#106011]/20 bg-[#106011]/5 p-2 overflow-y-auto font-mono text-[10px] flex flex-col gap-1 custom-scrollbar">
          <div className="flex gap-2">
            <span className="text-[#106011]/50 font-bold">[12:04:22]</span>
            <span className="text-slate-300">System uplink established. Scanning DropZones...</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[#106011]/50 font-bold">[12:05:11]</span>
            <span className="text-[#106011] font-semibold drop-shadow-[0_0_4px_rgba(16,96,17,0.5)]">Dropper 'DROPPER-01' is online.</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[#106011]/50 font-bold">[12:06:40]</span>
            <span className="text-slate-300">Awaiting encrypted comms from active operations.</span>
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
