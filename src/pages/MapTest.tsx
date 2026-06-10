import React from 'react';
import { TacticalMap } from '@/components/map/TacticalMap';
import { motion } from 'framer-motion';
import { Shield, Crosshair, Zap } from 'lucide-react';

export function MapTest() {
  return (
    <div className="min-h-screen bg-[--bg-primary] flex flex-col font-mono text-slate-100 overflow-hidden relative">

      {/* Header Overlay */}
      <div className="relative z-20 px-6 py-6 border-b border-[#106011]/30 bg-black/40 backdrop-blur-md flex items-center justify-between mt-16 sm:mt-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0ad111] animate-pulse" />
            <h1 className="text-lg font-bold tracking-[0.3em] uppercase text-[#0ad111]">UAV_UPLINK_CONSOLE</h1>
          </div>
          <p className="text-[9px] text-slate-500 tracking-[0.2em] font-mono">SECTOR VII // OPS MONITOR</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-slate-500 uppercase">Signal Stability</span>
            <span className="text-xs font-bold text-[#0ad111]">98.4%</span>
          </div>
          <div className="w-px h-8 bg-[#106011]/30" />
          <div className="flex flex-col items-end text-right">
            <span className="text-[8px] text-slate-500 uppercase">Operational Status</span>
            <motion.span 
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-xs font-bold text-blue-400"
            >
              NOMINAL
            </motion.span>
          </div>
        </div>
      </div>

      {/* Main Map Content */}
      <div className="flex-1 relative z-10 p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
        {/* Map Container Wrapper */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 border-2 border-[#106011]/80 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,96,17,0.3)] bg-black relative"
        >
          <TacticalMap />
          
          {/* Internal Map Overlays */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#0ad111]/40 to-transparent z-[1001]" />
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-transparent via-[#0ad111]/20 to-transparent z-[1001]" />
        </motion.div>

        {/* Tactical Info Panel (Right Side on Tablet+) */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full sm:w-80 space-y-6"
        >
          {/* Operative Registry */}
          <div className="p-5 bg-black/60 border border-[#106011]/40 rounded-2xl space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#106011]/20 pb-3">
              <span className="text-[10px] font-bold tracking-widest text-[#0ad111]">FIELD_REGISTRY</span>
              <Shield className="w-3 h-3 text-[#0ad111]" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#0ad111] animate-pulse" />
                  <span className="text-[10px] text-slate-300">HQ_CENTRAL</span>
                </div>
                <span className="text-[9px] text-[#0ad111]/60 font-mono">ONLINE</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-slate-300">GHOST_UNIT</span>
                </div>
                <span className="text-[9px] text-blue-500/60 font-mono">ENCRYPTED</span>
              </div>
            </div>
          </div>

          {/* Comms Feed */}
          <div className="flex-1 p-5 bg-black/60 border border-[#106011]/40 rounded-2xl space-y-4 backdrop-blur-sm overflow-hidden flex flex-col max-h-[300px]">
            <div className="flex items-center justify-between border-b border-[#106011]/20 pb-3">
              <span className="text-[10px] font-bold tracking-widest text-slate-400">MISSION_LOG</span>
              <Crosshair className="w-3 h-3 text-slate-400" />
            </div>
            
            <div className="space-y-3 text-[9px] font-mono leading-relaxed overflow-y-auto scrollbar-hide pr-2">
              <p className="text-slate-500"><span className="text-[#0ad111]">[08:42]</span> GPS_UPLINK SECURED</p>
              <p className="text-slate-500"><span className="text-[#0ad111]">[08:43]</span> SECTOR SWEEP COMPLETED</p>
              <p className="text-slate-500"><span className="text-[#0ad111]">[08:45]</span> NO HOSTILES DETECTED</p>
              <p className="text-[#0ad111] animate-pulse"><span className="text-white">&gt;</span> AWAITING_CMD_INPUT</p>
            </div>
          </div>

          <button className="w-full py-4 bg-[#106011]/10 border border-[#106011] rounded-xl text-[#0ad111] font-bold text-[10px] tracking-[0.3em] hover:bg-[#106011]/20 transition-all uppercase">
            Execute Signal Sweep
          </button>
        </motion.div>
      </div>

      {/* Terminal Footer */}
      <div className="p-4 bg-[#106011]/10 border-t border-[#106011]/30 text-center relative z-20">
        <p className="text-[8px] text-[#106011] tracking-[0.5em] uppercase font-black">
          Operational Security Level 5 // No Unauthorized Access
        </p>
      </div>
    </div>
  );
}
