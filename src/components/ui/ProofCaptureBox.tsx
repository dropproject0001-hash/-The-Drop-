import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Square, RefreshCcw, Check, X, ShieldAlert } from 'lucide-react';
import { captureService, CaptureResult } from '@/services/CaptureService';
import { motion, AnimatePresence } from 'framer-motion';

interface ProofCaptureBoxProps {
  onCaptureComplete: (results: CaptureResult[]) => void;
  onCancel: () => void;
}

export function ProofCaptureBox({ onCaptureComplete, onCancel }: ProofCaptureBoxProps) {
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState<CaptureResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize stream
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await captureService.initialize();
      setIsActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('CAMERA ACCESS DENIED // CHECK PERMISSIONS');
    }
  };

  // Take photo
  const handleTakePhoto = async () => {
    try {
      const result = await captureService.takePhoto();
      setResults(prev => [...prev, result]);
    } catch (err) {
      setError('PHOTO CAPTURE FAILED');
    }
  };

  // Toggle recording
  const handleToggleRecording = async () => {
    if (isRecording) {
      const result = await captureService.stopRecording();
      setResults(prev => [...prev, result]);
      setIsRecording(false);
    } else {
      captureService.startRecording();
      setIsRecording(true);
    }
  };

  const handleFinish = () => {
    onCaptureComplete(results);
    captureService.stopStream();
    setIsActive(false);
  };

  const handleRetake = () => {
    results.forEach(r => URL.revokeObjectURL(r.url));
    setResults([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      captureService.stopStream();
    };
  }, []);

  return (
    <div className="w-full bg-black/80 border border-[#106011]/40 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(16,96,17,0.2)]">
      {!isActive ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#106011]/20 flex items-center justify-center border border-[#106011]/80 animate-pulse">
            <Camera className="w-10 h-10 text-[#0ad111]" />
          </div>
          <div className="text-center">
            <h3 className="text-[#0ad111] font-mono font-bold tracking-widest text-lg">PROOFS CAPTURE SYSTEM</h3>
            <p className="text-slate-400 font-mono text-[10px] mt-2 tracking-wider">SECURED ENCRYPTED CHANNEL</p>
          </div>
          <button 
            onClick={startCamera}
            className="px-8 py-3 bg-[#106011] hover:bg-[#168117] text-white border border-[#0ad111] rounded-xl font-mono text-sm tracking-[0.2em] transition-all"
          >
            INITIALIZE LENS
          </button>
          <button onClick={onCancel} className="text-slate-500 font-mono text-[10px] hover:text-white transition-colors">ABORT MISSION</button>
        </div>
      ) : (
        <div className="relative">
          {/* Live Preview / HUD */}
          <div className="relative aspect-video bg-black overflow-hidden bg-[radial-gradient(circle_at_center,rgba(16,96,17,0.1)_0%,transparent_100%)]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover grayscale-[0.3] contrast-125" 
            />
            
            {/* HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none border-2 border-[#106011]/20" />
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="px-2 py-0.5 bg-black/60 border border-[#106011] text-[#0ad111] font-mono text-[8px] tracking-widest">
                REC: {isRecording ? 'ACTIVE' : 'STANDBY'}
              </div>
              <div className="px-2 py-0.5 bg-black/60 border border-[#106011] text-[#0ad111] font-mono text-[8px] tracking-widest">
                SENS: 100%
              </div>
            </div>
            
            {isRecording && (
              <motion.div 
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute top-4 right-4 flex items-center gap-1"
              >
                <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_#dc2626]" />
                <span className="text-red-500 font-mono text-[8px] tracking-tighter">LIVE</span>
              </motion.div>
            )}

            {/* Viewfinder crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-10 h-0.5 bg-[#0ad111]" />
              <div className="h-10 w-0.5 bg-[#0ad111] absolute" />
            </div>

            {error && (
              <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center p-6 text-center">
                <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
                <p className="text-red-200 font-mono text-sm tracking-wider">{error}</p>
                <button onClick={startCamera} className="mt-4 px-4 py-2 border border-red-500 text-red-500 font-mono text-xs hover:bg-red-500/20">RETRY</button>
              </div>
            )}
          </div>

          {/* Results Grid */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                className="bg-[#050f05] border-t border-[#106011]/40 p-4 scrollbar-hide overflow-x-auto"
              >
                <div className="flex gap-4">
                  {results.map((res, idx) => (
                    <div key={idx} className="relative w-24 aspect-square flex-shrink-0 border border-[#106011]/60 rounded-lg overflow-hidden group">
                      {res.type === 'image' ? (
                        <img src={res.url} className="w-full h-full object-cover" />
                      ) : (
                        <video src={res.url} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[8px] font-mono text-white tracking-tighter">{res.type.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={handleRetake}
                    className="w-24 aspect-square flex-shrink-0 border border-dashed border-red-900/40 rounded-lg flex flex-col items-center justify-center text-red-900 hover:text-red-500 hover:border-red-500 transition-all gap-1"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span className="text-[6px] font-mono uppercase">Flush Memory</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="p-6 bg-black border-t border-[#106011]/20 flex items-center justify-between">
            <button 
              onClick={() => { captureService.stopStream(); onCancel(); }}
              className="p-3 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-6">
              <button 
                onClick={handleTakePhoto}
                disabled={isRecording}
                className={`p-4 rounded-full border-2 border-[#106011] text-[#0ad111] hover:bg-[#106011]/20 transition-all ${isRecording ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <Camera className="w-8 h-8" />
              </button>

              <button 
                onClick={handleToggleRecording}
                className={`p-4 rounded-full border-2 transition-all ${isRecording ? 'border-red-600 bg-red-600/20 text-red-500 animate-pulse' : 'border-[#106011] text-[#0ad111] hover:bg-[#106011]/20'}`}
              >
                {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Video className="w-8 h-8" />}
              </button>
            </div>

            <button 
              onClick={handleFinish}
              disabled={results.length === 0 || isRecording}
              className={`p-3 rounded-lg border border-[#0ad111] bg-[#106011]/10 text-[#0ad111] transition-all ${results.length === 0 || isRecording ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#106011]/30'}`}
            >
              <Check className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
