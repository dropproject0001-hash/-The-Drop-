import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Shield, Download, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function AfterDropModal({ drop, onClose }: { drop: any; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[1000] p-6"
    >
      {/* Tactical Grid Background for Modal */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-zinc-950 border-2 border-blue-500 rounded-[2.5rem] p-8 w-full max-w-sm flex flex-col items-center gap-6 relative shadow-[0_0_80px_rgba(37,99,235,0.3)]"
      >
        {/* Corner HUD Brackets */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-blue-500 rounded-tl-[2.5rem]" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-blue-500 rounded-tr-[2.5rem]" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-blue-500 rounded-bl-[2.5rem]" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-blue-500 rounded-br-[2.5rem]" />

        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center mb-2">
             <Shield className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
          <h3 className="text-blue-500 font-mono tracking-[0.3em] uppercase text-sm font-black">DROP_INITIALIZED</h3>
          <p className="text-slate-500 text-[9px] font-mono uppercase tracking-widest text-center">Satellite Uplink Synchronized</p>
        </div>

        <div className="relative group">
           {/* QR Glow Effect */}
           <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-75 animate-pulse" />
           <div className="bg-white p-6 rounded-3xl relative z-10 shadow-inner">
             <QRCodeSVG
               value={JSON.stringify({ dropId: drop.id, token: drop.qr_token })}
               size={180}
               level="H"
               includeMargin={false}
             />
           </div>
        </div>

        <div className="w-full space-y-4">
          <div className="bg-blue-950/20 border border-blue-500/10 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
               <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">ID_SIGNATURE</span>
               <span className="text-[10px] font-mono text-blue-400 font-black">{drop.id.substring(0, 12).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">COORDINATES</span>
               <span className="text-[10px] font-mono text-blue-400 font-black">{drop.lat.toFixed(4)}, {drop.lng.toFixed(4)}</span>
            </div>
          </div>

          <button
            className="w-full flex items-center justify-center gap-2 text-[9px] font-mono text-blue-500/60 hover:text-blue-400 transition-colors uppercase tracking-widest"
          >
            <Download className="w-3 h-3" /> Save QR Manifest to Device
          </button>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-mono text-xs uppercase tracking-[0.3em] font-black transition-all hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> ACKNOWLEDGE_LOG
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
