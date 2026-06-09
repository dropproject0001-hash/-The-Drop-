import { lazy, Suspense } from 'react';
import { Target, Lock, Navigation, AlertTriangle } from 'lucide-react';

const DropMap = lazy(() => import('@/components/map/DropMap'));

export function ClientPanel() {
  return (
    <div className="flex flex-col h-full bg-black/40 rounded-2xl border border-[--accent-primary]/20 shadow-[0_0_15px_rgba(34,197,94,0.1)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-[--accent-primary]/10 border-b border-[--accent-primary]/20">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[--accent-primary]" />
          <h2 className="text-[--accent-primary] font-display font-bold tracking-widest uppercase text-sm">Getto/Lotter</h2>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-[10px] font-mono text-[--accent-primary]">
            <span className="w-1.5 h-1.5 rounded-full bg-[--accent-primary] animate-pulse" /> SYNC VERIFIED
          </span>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative min-h-[300px]">
        <Suspense fallback={
          <div className="flex-1 h-full w-full bg-black/95 flex items-center justify-center font-mono text-xs uppercase text-green-500 tracking-widest animate-pulse min-h-[300px]">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping mr-2"></span>
            Loading Client Map telemetry...
          </div>
        }>
          <DropMap height="100%" />
        </Suspense>
        {/* Absolute HUD */}
        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
          <HUDItem bg="bg-green-950/80" border="border-[--accent-primary]/30" text="text-green-200">
            <Lock className="w-3 h-3 text-[--accent-primary]" /> ENCRYPTED CONNECTION
          </HUDItem>
          <HUDItem bg="bg-green-950/80" border="border-[--accent-primary]/30" text="text-green-200">
            <Navigation className="w-3 h-3 text-[--accent-primary]" /> ROUTING STANDBY
          </HUDItem>
        </div>
      </div>

      {/* Control Panel Area */}
      <div className="h-48 border-t border-[--accent-primary]/20 bg-background/50 p-4 shrink-0 flex flex-col gap-2">
        {/* Tabs */}
        <div className="flex text-xs font-mono text-[--accent-primary]/60 uppercase tracking-widest border-b border-[--accent-primary]/10 pb-2">
          <button className="text-[--accent-primary] border-b border-[--accent-primary] pb-2 -mb-[9px] mr-6">Drop Info</button>
          <button className="hover:text-green-300 transition-colors mr-6">Secure Comms</button>
          <button className="hover:text-green-300 transition-colors">Payment Proof</button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center border border-dashed border-[--accent-primary]/20 rounded-lg bg-[--accent-primary]/5 mt-2">
           <div className="flex flex-col items-center gap-2 text-center p-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500/80 mb-1" />
              <span className="text-xs font-mono text-yellow-500/90 font-bold uppercase tracking-widest">Awaiting Dropper Approval</span>
              <span className="text-[10px] font-mono text-[--text-secondary] max-w-[200px]">
                Upon verification, encrypted drop coordinates, image data, and QR payload will be transmitted.
              </span>
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
