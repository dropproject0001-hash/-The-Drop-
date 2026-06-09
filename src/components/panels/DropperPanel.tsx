import { lazy, Suspense } from 'react';
import { Radio, Crosshair, Package, Upload } from 'lucide-react';

const DropMap = lazy(() => import('@/components/map/DropMap'));

export function DropperPanel() {
  return (
    <div className="flex flex-col h-full bg-black/40 rounded-2xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-blue-500/10 border-b border-blue-500/20">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-blue-500" />
          <h2 className="text-blue-500 font-display font-bold tracking-widest uppercase text-sm">Admin / Dropper</h2>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-[10px] font-mono text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> UPLINK SECURE
          </span>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative min-h-[300px]">
        <Suspense fallback={
          <div className="flex-1 h-full w-full bg-black/95 flex items-center justify-center font-mono text-xs uppercase text-blue-400 tracking-widest animate-pulse min-h-[300px]">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping mr-2"></span>
            Loading Dropper Map telemetry...
          </div>
        }>
          <DropMap height="100%" />
        </Suspense>
        {/* Absolute HUD */}
        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
          <HUDItem bg="bg-blue-950/80" border="border-blue-500/30" text="text-blue-200">
            <Crosshair className="w-3 h-3 text-blue-400" /> GPS SIGNAL: STRONG
          </HUDItem>
          <HUDItem bg="bg-blue-950/80" border="border-blue-500/30" text="text-blue-200">
            <Package className="w-3 h-3 text-blue-400" /> INVENTORY: 4 ITEMS
          </HUDItem>
        </div>
        
        {/* Quick Action Overlay */}
        <div className="absolute bottom-4 right-4 z-[400]">
           <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all font-mono text-xs font-bold tracking-widest uppercase">
             <Crosshair className="w-4 h-4" /> Pin Drop
           </button>
        </div>
      </div>

      {/* Control Panel Area */}
      <div className="h-48 border-t border-blue-500/20 bg-background/50 p-4 shrink-0 flex flex-col gap-2">
        {/* Tabs */}
        <div className="flex text-xs font-mono text-blue-400/60 uppercase tracking-widest border-b border-blue-500/10 pb-2">
          <button className="text-blue-400 border-b border-blue-500 pb-2 -mb-[9px] mr-6">Drop Console</button>
          <button className="hover:text-blue-300 transition-colors mr-6">Client Chat</button>
          <button className="hover:text-blue-300 transition-colors">Evidence</button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-3 py-2">
          <div className="flex items-center justify-between px-3 py-2 rounded bg-blue-950/20 border border-blue-500/10 hover:border-blue-500/30 transition-colors">
            <div className="flex flex-col">
              <span className="text-xs font-mono text-blue-100">Initiate New Drop</span>
              <span className="text-[10px] font-mono text-blue-400/60">Requires image/video upload & exact coordinates</span>
            </div>
            <button className="p-2 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/40">
              <Upload className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded bg-blue-950/20 border border-blue-500/10 hover:border-blue-500/30 transition-colors">
            <div className="flex flex-col">
              <span className="text-xs font-mono text-blue-100">Pending Approvals</span>
              <span className="text-[10px] font-mono text-blue-400/60">0 clients awaiting drop coordinates</span>
            </div>
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
