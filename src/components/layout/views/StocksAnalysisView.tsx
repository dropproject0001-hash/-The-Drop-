import { useState, useEffect } from 'react';
import { Activity, RefreshCw, Radio, TrendingUp, Sliders, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function StocksAnalysisView() {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationLog, setCalibrationLog] = useState<string[]>([]);
  const [signalStrength, setSignalStrength] = useState(98.4);
  const [activeFrequency, setActiveFrequency] = useState(106.011);

  // Animate mock stock levels slightly
  const [stocks, setStocks] = useState([
    { id: 'S1', name: 'Tactical Supply Crate', zone: 'Mamburao West S1', qty: 24, max: 30, code: 'X-901', claimRate: 'High' },
    { id: 'S2', name: 'Encrypted Radio Node', zone: 'Sector-4 Alpha', qty: 3, max: 10, code: 'Z-204', claimRate: 'Critical' },
    { id: 'S3', name: 'Medical Rations Pack', zone: 'Centro Terminal B', qty: 45, max: 50, code: 'M-112', claimRate: 'Medium' },
    { id: 'S4', name: 'Secure Courier Cache', zone: 'Paypay Offshore', qty: 12, max: 15, code: 'P-502', claimRate: 'Optimal' },
  ]);

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setCalibrationLog(prev => [`[${new Date().toLocaleTimeString()}] UPLINK: Initiating signal sweep...`, ...prev]);
    
    setTimeout(() => {
      setActiveFrequency(106.011 + (Math.random() - 0.5) * 0.05);
      setSignalStrength(Math.min(100, 95 + Math.random() * 5));
      setCalibrationLog(prev => [
        `[${new Date().toLocaleTimeString()}] SWEEP COMPLETE: Refinement verified.`,
        `[${new Date().toLocaleTimeString()}] FREQUENCY LOCK: ${activeFrequency.toFixed(3)} MHz`,
        ...prev
      ]);
      setIsCalibrating(false);
    }, 1500);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      // Small real-time fluctuations
      setSignalStrength(s => Math.max(90, Math.min(100, s + (Math.random() - 0.5) * 0.4)));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 text-[#106011] space-y-8 select-none relative custom-scrollbar overflow-y-auto h-[calc(100vh-80px)]">
      
      {/* Header telemetry info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#106011]/40 pb-6 relative z-10">
        <div>
          <span className="text-[9px] font-mono tracking-[0.25em] bg-[#106011]/15 px-2.5 py-1 rounded border border-[#106011]/30 uppercase font-black">
            Secured Overlord Terminal
          </span>
          <h2 className="text-2xl font-display font-black tracking-[0.15em] uppercase text-white drop-shadow-[0_0_12px_rgba(16,96,17,0.85)] mt-2">
            STOCKS ANALYSIS // SUPPLY INDEX
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase font-bold text-slate-300">
          <div className="p-2 bg-black/80 border-2 border-[#106011] rounded shadow-[0_0_12px_rgba(16,96,17,0.3)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#106011] animate-ping shrink-0"></span>
            <span>Freq: {activeFrequency.toFixed(3)} MHz</span>
          </div>
          <div className="p-2 bg-black/80 border-2 border-[#106011] rounded shadow-[0_0_12px_rgba(16,96,17,0.3)] flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#106011] animate-pulse" />
            <span>Signal: {signalStrength.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left column: SVG telemetry waveform */}
        <div className="lg:col-span-2 flex flex-col bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_25px_rgba(16,96,17,0.4)] relative overflow-hidden h-[420px]">
          {/* Tactical HUD corners */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
          
          <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center border-b border-[#106011]/30 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.8)]" />
              <span className="text-white font-display font-bold tracking-[0.16em] text-xs">ONLINE WAVEFORM MONITOR</span>
            </div>
            <span className="text-[8px] font-mono font-black text-slate-400">FPS: 60.0 // SPAN: LIVE</span>
          </div>

          {/* SVG Waveform Chart */}
          <div className="flex-1 w-full bg-[#106011]/5 border border-[#106011]/30 rounded relative overflow-hidden flex items-center justify-center">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,96,17,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,96,17,0.1)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            
            {/* Center target circle lines */}
            <div className="absolute w-48 h-48 rounded-full border border-dashed border-[#106011]/15 animate-spin-slow pointer-events-none"></div>
            <div className="absolute w-32 h-32 rounded-full border border-[#106011]/10 pointer-events-none"></div>

            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Semi-filled glowing waves */}
              <path 
                d="M 0,100 Q 80,40 160,110 T 320,80 T 500,100 L 500,200 L 0,200 Z" 
                fill="url(#glowGrad)" 
              />
              <path 
                d="M 0,100 Q 80,40 160,110 T 320,80 T 500,100" 
                fill="none" 
                stroke="#22c55e" 
                strokeWidth="3.5" 
                className="drop-shadow-[0_0_8px_#22c55e] animate-pulse"
              />
              <path 
                d="M 0,110 Q 100,150 200,90 T 400,120 T 500,100" 
                fill="none" 
                stroke="#106011" 
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
            
            {/* Realtime dynamic coordinates info */}
            <div className="absolute bottom-3 left-3 bg-black/90 p-2 border border-[#106011]/40 text-slate-300 font-mono text-[8px] space-y-0.5 tracking-wider rounded select-none z-10">
              <p>WAVEFORM LOCK: SECURE</p>
              <p>MAX AMPLITUDE: 8.42 dBm</p>
              <p>S/N RATIO: 34.2 dB</p>
            </div>
          </div>
        </div>

        {/* Right column: Controls & Calibrations */}
        <div className="flex flex-col bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_25px_rgba(16,96,17,0.4)] relative overflow-hidden h-[420px]">
          {/* Tactical HUD corners */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
          
          <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

          <div className="flex justify-between items-center border-b border-[#106011]/30 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.8)]" />
              <span className="text-white font-display font-bold tracking-[0.16em] text-xs">TACTICAL FREQUENCY CALIBRATOR</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <p className="text-[10px] font-mono text-slate-300 tracking-wider leading-relaxed">
              Maintain optimal supply data integrity. Perform frequent sweeps of the Mamburao sector networks when cargo volumes drop.
            </p>

            <button
              onClick={handleCalibrate}
              disabled={isCalibrating}
              className={`w-full h-11 border-2 border-[#106011] rounded-xl flex items-center justify-center gap-2 font-mono text-xs font-black uppercase tracking-widest relative overflow-hidden transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(16,96,17,0.3)] hover:shadow-[0_0_22px_rgba(16,96,17,0.6)] ${isCalibrating ? 'bg-[#106011]/40 text-slate-400' : 'bg-black text-[#106011] hover:bg-[#106011]/25'}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin text-green-400' : ''}`} />
              <span className="relative z-10">{isCalibrating ? 'Sweeping Frequency...' : 'Re-Calibrate Signal'}</span>
            </button>

            {/* Calibration Log Terminal Output */}
            <div className="flex-1 flex flex-col border border-[#106011]/40 bg-black rounded p-3 text-[9px] font-mono uppercase tracking-widest text-[#106011] overflow-y-auto custom-scrollbar gap-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 text-white/90 pb-1.5 border-b border-[#106011]/25">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span>HUD_TERMINAL_SESSION: LOG</span>
              </div>
              {calibrationLog.length === 0 ? (
                <span className="text-slate-400/60 font-medium">No cycles executed this session. awaiting sweep.</span>
              ) : (
                calibrationLog.map((log, index) => (
                  <div key={index} className={index === 0 ? "text-green-400 font-bold" : "text-slate-400"}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Stocks and Inventory Tables */}
      <div className="bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_25px_rgba(16,96,17,0.4)] relative overflow-hidden z-10">
        {/* Tactical HUD corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
        
        <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

        <div className="flex justify-between items-center border-b border-[#106011]/30 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.8)]" />
            <span className="text-white font-display font-bold tracking-[0.16em] text-xs">MAMBURAO SECURED CARGO STOCK REGISTRY</span>
          </div>
          <span className="text-[9px] font-mono font-bold uppercase rounded border-2 border-[#106011] px-2 py-0.5 shadow-[0_0_5px_rgba(16,96,17,0.3)] text-[#106011]">ACTIVE: 4 OPERATIONS</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-mono text-xs uppercase text-slate-300">
            <thead>
              <tr className="border-b border-[#106011]/30 text-white font-black text-[10px] tracking-wider">
                <th className="pb-3 pl-2">CARGO ID</th>
                <th className="pb-3">PRODUCT</th>
                <th className="pb-3">LAST DROP SECTOR</th>
                <th className="pb-3 text-center">QUANTITY / LIMIT</th>
                <th className="pb-3">SIGNAL CODE</th>
                <th className="pb-3 text-right">LOAD RATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#106011]/15">
              {stocks.map((item) => {
                const isCritical = item.qty < item.max * 0.4;
                return (
                  <tr key={item.id} className="hover:bg-[#106011]/10 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-white">{item.id}</td>
                    <td className="py-3.5 font-bold tracking-wide text-white">{item.name}</td>
                    <td className="py-3.5 text-slate-400 font-semibold">{item.zone}</td>
                    <td className="py-3.5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`font-bold ${isCritical ? 'text-red-500 animate-pulse' : 'text-slate-200'}`}>{item.qty} / {item.max}</span>
                        {/* Custom visual horizontal meter */}
                        <div className="w-24 h-2 bg-slate-900 border border-[#106011]/35 rounded overflow-hidden">
                          <div 
                            className={`h-full ${isCritical ? 'bg-red-600' : 'bg-green-500'}`}
                            style={{ width: `${(item.qty / item.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-[#106011] font-bold drop-shadow-[0_0_4px_#106011]">{item.code}</td>
                    <td className="py-3.5 text-right pr-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        item.claimRate === 'Critical' ? 'bg-red-950/40 text-red-400 border border-red-800' : 
                        item.claimRate === 'High' ? 'bg-orange-950/40 text-orange-400 border border-orange-800' :
                        'bg-green-950/40 text-green-400 border border-green-800'
                      }`}>
                        {item.claimRate}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
