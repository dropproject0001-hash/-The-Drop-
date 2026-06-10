import React, { useState } from 'react';
import { ProofCaptureBox } from '@/components/ui/ProofCaptureBox';
import { CaptureResult } from '@/services/CaptureService';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Trash2, Download } from 'lucide-react';

export function CaptureTest() {
  const [capturedMedia, setCapturedMedia] = useState<CaptureResult[]>([]);
  const [showCapture, setShowCapture] = useState(false);

  const handleCaptureComplete = (results: CaptureResult[]) => {
    setCapturedMedia(prev => [...prev, ...results]);
    setShowCapture(false);
  };

  const deleteMedia = (idx: number) => {
    URL.revokeObjectURL(capturedMedia[idx].url);
    setCapturedMedia(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-[--bg-primary] p-6 pt-24 font-mono text-slate-100">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Tactical Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#106011] shadow-[0_0_8px_#106011]" />
            <h1 className="text-xl font-bold tracking-[0.3em] uppercase text-[#0ad111]">Laboratory // Proofs Hub</h1>
          </div>
          <p className="text-[10px] text-slate-500 tracking-widest uppercase">Secured terminal for media evidence testing.</p>
        </div>

        {/* Action Center */}
        {!showCapture && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border-2 border-dashed border-[#106011]/40 rounded-2xl flex flex-col items-center justify-center space-y-6 bg-black/40 backdrop-blur-sm"
          >
            <div className="text-center space-y-2">
              <p className="text-xs text-slate-400">NO ACTIVE LENS FEED</p>
              <p className="text-[8px] text-slate-600">Awaiting tactical initialization...</p>
            </div>
            <button 
              onClick={() => setShowCapture(true)}
              className="px-10 py-4 bg-[#106011] hover:bg-[#168117] text-white rounded-xl border border-[#0ad111] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(16,96,17,0.4)] transition-all"
            >
              DEPLOY LENS UNIT
            </button>
          </motion.div>
        )}

        {/* Capture Interface */}
        <AnimatePresence>
          {showCapture && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <ProofCaptureBox 
                onCaptureComplete={handleCaptureComplete}
                onCancel={() => setShowCapture(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Gallery */}
        {capturedMedia.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-[10px] font-bold text-[#0ad111] tracking-widest uppercase border-b border-[#106011]/30 pb-2">STORAGE MEMORY // {capturedMedia.length} ITEMS</h2>
            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence>
                {capturedMedia.map((media, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="group relative border border-[#106011]/60 bg-black/60 rounded-xl overflow-hidden aspect-video"
                  >
                    {media.type === 'image' ? (
                      <img src={media.url} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <video src={media.url} className="w-full h-full object-cover opacity-80" controls />
                    )}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-3 p-4">
                      <div className="text-[8px] font-mono text-white tracking-widest bg-[#106011] px-2 py-1 rounded">
                        {media.type.toUpperCase()} // MARKER: {idx + 1}
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 border border-blue-500/40 rounded-lg hover:bg-blue-500/20 text-blue-400">
                           <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteMedia(idx)} className="p-2 border border-red-500/40 rounded-lg hover:bg-red-500/20 text-red-400">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Operational Warning */}
        <div className="p-4 bg-yellow-900/10 border border-yellow-900/30 rounded-lg">
          <p className="text-[8px] text-yellow-600 font-mono tracking-widest leading-relaxed">
            NOTICE: All media stored in temporary browser memory. Unsaved data will be purged on terminal reset (session end). Ensure archival via encrypted uplink before shutdown.
          </p>
        </div>
      </div>
    </div>
  );
}
