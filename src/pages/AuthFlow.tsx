import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Fingerprint, 
  Phone, 
  ShieldCheck, 
  Key, 
  Terminal, 
  Wifi, 
  User, 
  Cpu, 
  Sparkles,
  RefreshCw,
  AlertOctagon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useOTP } from '../hooks/useOTP';
import { useRole } from '../context/RoleContext';

type LoginMode = 'client' | 'staff';

export default function AuthFlow() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [mode, setMode] = useState<LoginMode>('client');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  
  const featureGridRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    const el = featureGridRef.current;
    if (!el) return;

    let requestId: number;
    const scroll = () => {
      // scroll down slowly
      if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
        el.scrollTop = 0; // jump back to top
      } else {
        el.scrollTop += 0.4; // very slow speed
      }
      requestId = requestAnimationFrame(scroll);
    };

    requestId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(requestId);
  }, [showIntro]);
  // Tactical simulation states for HUD realism
  const [systemLogs, setSystemLogs] = useState<string[]>([
    'INITIALIZING SECURE HANDSHAKE...',
    'ESTABLISHING VPN TUNNEL: UP',
  ]);
  const [systemTime, setSystemTime] = useState('');

  const { otp, setOtp, loading, error, requestOTP, verifyOTP } = useOTP();
  const { refreshRole } = useRole();

  // Update virtual systems clock & simulated logs
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const logs = [
      'TUNNEL ROUTE SECURED VIA CRYPTO_NET',
      'PEER HANDSHAKE COMPLETED',
      'READY FOR MULTI-FACTOR ENCRYPTION',
      'WARNING: NO PERSONAL IDENTIFIABLE DATA LOGGED',
      'STANDBY FOR GPS TELEMETRY EXPORT',
    ];
    const logInterval = setInterval(() => {
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      setSystemLogs(prev => [randomLog, prev[0]].slice(0, 3));
    }, 4500);
    return () => clearInterval(logInterval);
  }, []);

  // ==================== CLIENT LOGIN ====================
  const handleClientLogin = async () => {
    if (!phone) return;

    if (step === 'input') {
      setSystemLogs(prev => [`REQUESTING OTP FOR TELEMETRY LINK: ${phone}`, ...prev].slice(0, 3));
      const result = await requestOTP(phone, 'login');
      if (result.success) {
        setStep('otp');
        setSystemLogs(prev => [`OTP DISPATCH SUCCESSFUL`, ...prev].slice(0, 3));
      }
    } else {
      setSystemLogs(prev => ['VERIFYING PORTAL KEY...', ...prev].slice(0, 3));
      const result = await verifyOTP(phone, otp, 'login');
      if (result.success) {
        await handleSuccessfulLogin();
      }
    }
  };

  // ==================== STAFF LOGIN ====================
  const handleStaffLogin = async () => {
    if (!username || !password) return;

    setSystemLogs(prev => [`AUTHENTICATING STAFF CORRESPONDENT: ${username.toUpperCase()}`, ...prev].slice(0, 3));
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: `${username}@thedrop.local`, // Custom template format
        password: password,
      });

      if (error) throw error;

      await handleSuccessfulLogin();
    } catch (err: any) {
      setSystemLogs(prev => [`AUTH FAILURE: ${err.message || 'DECLINED'}`, ...prev].slice(0, 3));
      alert(err.message || 'Login failed');
    }
  };

  // ==================== COMMON SUCCESS HANDLER ====================
  const handleSuccessfulLogin = async () => {
    setSystemLogs(prev => ['DECRYPTING ROLE SECURITY CLEARANCE...', ...prev].slice(0, 3));
    const userRole = await refreshRole(); // Get actual database role from profile
    
    setSystemLogs(prev => [`CLEARANCE LEVEL: ${userRole?.toUpperCase() || 'NONE'}`, ...prev].slice(0, 3));

    if (userRole === 'super_admin') {
      navigate('/super-admin');
    } else if (userRole === 'dropper') {
      navigate('/dropper');
    } else if (userRole === 'client') {
      navigate('/client');
    } else {
      navigate('/'); // Default fallback
    }
  };

  return (
    <div 
      className="min-h-screen text-[#106011] relative flex items-center justify-center p-4 overflow-y-auto font-sans select-none bg-cover bg-center"
      style={{
        backgroundImage: `url('/Backgroundimage.png')`
      }}
    >
      
      {/* Introduction Page Overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="introduction-page"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4 overflow-y-auto"
          >
            {/* Ambient Background Video */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
              <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('/Backgroundimage.png')" }} />
              <video
                src="/grok_video_2026-06-10-00-44-15.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-60 filter brightness-[0.55] contrast-[1.3] hue-rotate-[10deg]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black pointer-events-none" />
              <div className="absolute inset-0 bg-black/60 pointer-events-none" />
            </div>

            {/* Glowing Tech Scan Grid Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.1] pointer-events-none z-1" 
              style={{
                backgroundImage: `
                  linear-gradient(#106011 2px, transparent 2px),
                  linear-gradient(90deg, #106011 2px, transparent 2px)
                `,
                backgroundSize: '32px 32px'
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,black_85%)] z-1 pointer-events-none" />

            {/* Tactical Scan Line */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#0ad111]/90 to-transparent shadow-[0_0_15px_#0ad111] animate-bounce z-10 pointer-events-none" style={{ animationDuration: '6s' }} />

            {/* High-Fidelity Tactical HUD Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-full max-w-xl bg-black/95 border-2 border-[#106011]/80 rounded-3xl p-6 sm:p-8 relative z-10 shadow-[0_0_50px_rgba(16,96,17,0.7)] backdrop-blur-xl text-center"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(5, 20, 5, 0.98) 100%)'
              }}
            >
              <div className="absolute inset-2 border border-[#106011]/30 rounded-[20px] pointer-events-none" />
              
              {/* Corner Sci-Fi Brackets */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-[#0ad111] rounded-tl-3xl drop-shadow-[0_0_8px_rgba(10,209,17,0.9)]" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-[#0ad111] rounded-tr-3xl drop-shadow-[0_0_8px_rgba(10,209,17,0.9)]" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-[#0ad111] rounded-bl-3xl drop-shadow-[0_0_8px_rgba(10,209,17,0.9)]" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-[#0ad111] rounded-br-3xl drop-shadow-[0_0_8px_rgba(10,209,17,0.9)]" />

              {/* Status Header */}
              <div className="flex justify-between items-center text-[8px] font-mono tracking-widest text-[#0ad111] border-b border-[#106011]/30 pb-3 mb-6 relative">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ad111] animate-ping" />
                  <span>OC01.MINDO DIRECT LINK ESTABLISHED</span>
                </div>
                <div className="text-right">THC420 // {systemTime || 'LIVE'}</div>
              </div>

              {/* Main Central Icon Container */}
              <div className="inline-flex relative mb-4 group/icon">
                <div className="absolute -inset-3 rounded-full bg-[#0ad111]/25 blur-md animate-pulse" />
                <motion.div 
                  className="absolute -inset-2.5 rounded-full border border-dashed border-[#0ad111]/50"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                />
                
                {/* Visual Target Reticle with App Icon */}
                <div className="relative w-20 h-20 rounded-full border-2 border-[#0ad111] overflow-hidden bg-black flex items-center justify-center shadow-[0_0_30px_rgba(10,209,17,0.8)]">
                  <img 
                    src="/Appicon.png" 
                    alt="THE DROP APP ICON" 
                    className="w-full h-full object-cover rounded-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#0ad111]/0 via-[#0ad111]/15 to-[#0ad111]/45 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '4s' }} />
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#0ad111]/30 pointer-events-none" />
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-[#0ad111]/30 pointer-events-none" />
                </div>
              </div>

              {/* Title Header */}
              <h1 className="text-4xl md:text-5xl font-display font-black tracking-[0.25em] text-white drop-shadow-[0_0_15px_rgba(10,209,17,0.85)] uppercase">
                THE DROP
              </h1>
              <p className="text-xs font-mono tracking-[0.25em] text-[#0ad111] mt-1.5 uppercase font-bold">
                OCCI.MINDORO DROP SHOP
              </p>

              {/* Premium Operations Parameters - Explicitly match original image text! */}
              <div 
                ref={featureGridRef}
                className="mt-6 mb-7 border-2 border-[#106011]/60 bg-black/85 rounded-2xl p-4 sm:p-5 relative overflow-hidden text-left h-48 overflow-y-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#106011]/10 to-transparent pointer-events-none" />
                <div className="text-[10px] sm:text-xs font-mono text-center font-bold tracking-[0.2em] text-[#0ad111] border-b border-[#106011]/30 pb-2.5 mb-3.5 uppercase">
                  PREMIUM QUALITY • HIGH STANDARDS • CULTIVATED TO ELEVATE
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 uppercase text-[9px] sm:text-[10px] font-mono tracking-wider">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[#0ad111]">●</span> EXOTIC THC PRODUCTS
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[#0ad111]">●</span> THC INFUSED
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[#0ad111]">●</span> TOP SHELF QUALITY
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[#0ad111]">●</span> HIGH THC PERCENTAGE
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[#0ad111]">●</span> TESTED. TRUSTED.
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[#0ad111]">●</span> LAB TESTED. CLEAN
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[#0ad111]">●</span> PURE EXCELLENCE
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[#0ad111]">●</span> SLOW BURN. FAST EFFECTS
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[#0ad111]">●</span> PREMIUM CANNABIS
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[#0ad111]">●</span> RICH TERPENES
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[#0ad111]">●</span> CULTIVATED RIGHT
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[#0ad111]">●</span> ELEVATE YOUR EXPERIENCE
                  </div>
                </div>
              </div>

              {/* Activation Trigger */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowIntro(false);
                    setSystemLogs(prev => ['SYSTEM INITIALIZED: AUTHORIZED HANDSHAKE', ...prev].slice(0, 3));
                  }}
                  className="w-full py-4 bg-[#106011] hover:bg-[#168117] text-white border-2 border-[#0ad111]/80 rounded-2xl font-mono uppercase tracking-[0.2em] font-black text-xs transition duration-300 shadow-[0_0_25px_rgba(10,209,17,0.6)] cursor-pointer active:scale-[0.98] inline-flex items-center justify-center gap-2"
                >
                  <Fingerprint className="w-5 h-5 text-white animate-pulse" />
                  DECRYPT & ENTER PORTAL APPARATUS
                </button>
                <button
                  type="button"
                  onClick={() => setShowIntro(false)}
                  className="text-[9px] font-mono tracking-widest text-[#0ad111] hover:text-white transition duration-300 uppercase cursor-pointer"
                >
                  SKIP INTRO & ACCESS TERMINAL DIRECTLY
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* High-Tech Grid Overlays from the design */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(#106011 2px, transparent 2px),
            linear-gradient(90deg, #106011 2px, transparent 2px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Cyber Circuit Vectors and Radar Sweeps */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.95)_100%)] z-0" />
      
      {/* Animated Sci-Fi Scanning Horizontal Laser Line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#0ad111]/90 to-transparent shadow-[0_0_15px_#0ad111] animate-bounce z-10 pointer-events-none" style={{ animationDuration: '8s' }} />

      {/* 2. MAIN ULTRA-PREMIUM TACTICAL HUD PANEL */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full max-w-md bg-black/95 border border-[#106011]/60 rounded-3xl p-6 sm:p-8 relative z-10 shadow-[0_0_50px_rgba(16,96,17,0.45)] backdrop-blur-xl"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(5, 20, 5, 0.98) 100%)'
        }}
      >
        {/* Decorative inner double border for premium sci-fi aesthetic */}
        <div className="absolute inset-2 border border-[#106011]/25 rounded-[20px] pointer-events-none z-0" />
        
        {/* High-Fidelity Corner Brackets / Crosshairs */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-[#0ad111] rounded-tl-3xl drop-shadow-[0_0_8px_rgba(10,209,17,0.9)] z-10" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-[#0ad111] rounded-tr-3xl drop-shadow-[0_0_8px_rgba(10,209,17,0.9)] z-10" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-[#0ad111] rounded-bl-3xl drop-shadow-[0_0_8px_rgba(10,209,17,0.9)] z-10" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-[#0ad111] rounded-br-3xl drop-shadow-[0_0_8px_rgba(10,209,17,0.9)] z-10" />

        {/* Small tech layout elements */}
        <div className="absolute -left-[5px] top-1/2 w-2 h-10 bg-[#106011]/80 rounded-full" />
        <div className="absolute -right-[5px] top-1/2 w-2 h-10 bg-[#106011]/80 rounded-full" />

        {/* 3. TACTICAL COVER PHOTO BANNER - Match double border theme */}
        <div className="relative w-full h-32 sm:h-36 rounded-2xl border-2 border-[#106011]/50 overflow-hidden mb-6 group shadow-[0_0_20px_rgba(16,96,17,0.3)] z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-15" />
          <div className="absolute inset-0 bg-[#0ad111]/10 mix-blend-overlay z-10" />
          
          <img 
            src="/regenerated_image_1781027109738.jpg" 
            alt="COVERT OPERATIONS COUNTERPART" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-[0.6] contrast-[1.25] transition-transform duration-1000 group-hover:scale-105"
          />

        </div>

        {/* 4. DYNAMIC STATUS / DECRYPTED TELEMETRY HEADER BLOCK */}
        <div className="flex justify-between items-center text-[8px] font-mono tracking-widest text-[#0ad111] border-b border-[#106011]/30 pb-3 mb-6 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0ad111] animate-ping" />
            <span className="uppercase font-semibold">shop is active</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3 text-[#0ad111] animate-pulse" />
            <span>LATENCY: 12ms</span>
          </div>
        </div>

        {/* 5. LOGO HEADER PORTION */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex relative mb-4 group/icon">
            {/* Outer neon tactical radial pulses */}
            <div className="absolute -inset-3 rounded-full bg-[#0ad111]/25 blur-md animate-pulse" />
            
            {/* Double radar wave effects */}
            <motion.div 
              className="absolute -inset-2.5 rounded-full border border-[#0ad111]/50"
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />

            {/* Circle Cropped App Icon Container */}
            <div className="relative w-[72px] h-[72px] rounded-full border-2 border-[#0ad111] overflow-hidden bg-black flex items-center justify-center shadow-[0_0_30px_rgba(10,209,17,0.8)]">
              {/* Spinning app icon image */}
              <motion.img 
                src="/Appicon.png" 
                alt="THE DROP APP ICON" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              />

              {/* Covert radar sweep scanner overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0ad111]/0 via-[#0ad111]/15 to-[#0ad111]/45 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '4s' }} />
              
              {/* Tech target crosshair needles */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#0ad111]/30 pointer-events-none" />
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-[#0ad111]/30 pointer-events-none" />
            </div>
          </div>

          <h1 className="text-3xl font-display font-black tracking-[0.25em] text-white drop-shadow-[0_0_15px_rgba(10,209,17,0.75)] uppercase">
            THE DROP
          </h1>
          
          <div className="mx-auto mt-3 max-w-[290px]">
            <p className="text-[#f59e0b] font-mono text-[9px] uppercase tracking-[0.14em] drop-shadow-[0_0_10px_rgba(245,158,11,0.65)] animate-pulse bg-amber-950/40 border border-amber-500/35 py-1.5 px-3 rounded-lg">
              Warning: Do Not Use Personal Identity ⚠️
            </p>
          </div>
        </div>

        {/* 6. FUTURISTIC SWITCHER */}
        <div className="relative flex bg-[#106011]/10 border border-[#106011]/40 rounded-xl p-1 mb-6 overflow-hidden z-10">
          <button
            onClick={() => {
              setMode('client');
              setStep('input');
              setOtp('');
              setSystemLogs(prev => ['SWITCHING INTERFACE: CLIENT PORTAL', ...prev].slice(0, 3));
            }}
            className="flex-1 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 relative z-10 flex items-center justify-center gap-2"
            style={{ color: mode === 'client' ? '#fff' : '#106011' }}
          >
            <User className="w-3.5 h-3.5" />
            <span style={{ color: '#c8d1c8' }}>GETTO/CLIENT</span>
          </button>
          <button
            onClick={() => {
              setMode('staff');
              setStep('input');
              setSystemLogs(prev => ['SWITCHING INTERFACE: COVERT RESTRICTED PORTAL', ...prev].slice(0, 3));
            }}
            className="flex-1 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 relative z-10 flex items-center justify-center gap-2"
            style={{ color: mode === 'staff' ? '#fff' : '#106011' }}
          >
            <Terminal className="w-3.5 h-3.5" />
            Restricted Portal
          </button>

          {/* Glowing Animated Slider Tab */}
          <motion.div 
            className="absolute top-1 bottom-1 left-1 bg-[#106011] rounded-lg shadow-[0_0_20px_rgba(16,96,17,0.7)] border border-[#0ad111]/30"
            layoutId="activePortalTab"
            style={{ 
              width: 'calc(50% - 4px)',
              left: mode === 'client' ? '4px' : 'calc(50%)'
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          />
        </div>

        {/* 7. SLIDING FORM PORTALS */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {mode === 'client' ? (
              <motion.div
                key="client-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {step === 'input' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Phone className="w-3.5 h-3.5 text-[#0ad111]" />
                        Regester Mobile number for OTP confirmation
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+639171234567"
                          className="w-full bg-black border-2 border-[#106011]/50 focus:border-[#0ad111] rounded-xl px-4 py-4 font-mono text-sm text-white focus:outline-none transition shadow-[0_0_15px_rgba(10,209,17,0.15)] focus:shadow-[0_0_15px_rgba(10,209,17,0.4)]"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#0ad111] animate-pulse shadow-[0_0_8px_#0ad111]" />
                      </div>
                    </div>

                    <button
                      onClick={handleClientLogin}
                      disabled={loading || !phone}
                      className="w-full py-4 bg-[#106011] hover:bg-[#168117] disabled:bg-[#106011]/20 text-white disabled:text-[#106011]/50 border-2 border-[#0ad111]/60 rounded-xl font-mono uppercase tracking-widest font-black text-xs transition duration-300 shadow-[0_0_20px_rgba(10,209,17,0.5)] relative overflow-hidden group active:scale-[0.98]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 text-shadow-glow">
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            DISPATCHING OTP INGRESS...
                          </>
                        ) : (
                          <>
                            <Key className="w-4 h-4 text-white" />
                            Send OTP VERIFICATION
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full duration-1000 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-950/90 border-2 border-[#106011]/40 rounded-xl text-center space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#0ad111] to-transparent" />
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        Enter Security clearance code sent to
                      </p>
                      <p className="text-sm font-mono text-[#0ad111] text-glow-green uppercase tracking-wider font-bold">
                        {phone}
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-2.5">
                        <Lock className="w-3.5 h-3.5 text-[#0ad111]" />
                        Operational OTP Passphrase (6-Digits)
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        placeholder="••••••"
                        className="w-full bg-black border-2 border-[#106011]/60 focus:border-[#0ad111] rounded-xl px-4 py-4 text-center text-white font-mono text-3xl tracking-[12px] placeholder-zinc-850 focus:outline-none transition-all shadow-[0_0_15px_rgba(10,209,17,0.2)] focus:shadow-[0_0_20px_rgba(10,209,17,0.5)]"
                      />
                    </div>

                    <button
                      onClick={handleClientLogin}
                      disabled={loading || otp.length !== 6}
                      className="w-full py-4 bg-[#106011] hover:bg-[#168117] disabled:bg-[#106011]/20 text-white disabled:text-[#106011]/50 border-2 border-[#0ad111]/60 rounded-xl font-mono uppercase tracking-widest font-black text-xs transition duration-300 shadow-[0_0_20px_rgba(10,209,17,0.5)] active:scale-[0.98]"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            VERIFYING PORTAL MATRIX...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-white" />
                            CONNECT & ENTER SECURE PORTAL
                          </>
                        )}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setStep('input');
                        setOtp('');
                        setSystemLogs(prev => ['RESET TELEMETRY ADDRESS ROUTE', ...prev].slice(0, 3));
                      }}
                      className="w-full text-[10px] font-mono uppercase tracking-wider text-slate-500 hover:text-[#0ad111] transition duration-300 py-1.5 flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset Mobile Target Link
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="staff-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <User className="w-3.5 h-3.5 text-[#0ad111]" />
                    Internal Staff Codename/Alias
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. ghostwalker"
                    className="w-full bg-black border-2 border-[#106011]/50 focus:border-[#0ad111] rounded-xl px-4 py-4 font-mono text-sm text-white focus:outline-none transition shadow-[0_0_15px_rgba(10,209,17,0.15)] focus:shadow-[0_0_15px_rgba(10,209,17,0.4)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Lock className="w-3.5 h-3.5 text-[#0ad111]" />
                    Cryptographic Password Key
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black border-2 border-[#106011]/50 focus:border-[#0ad111] rounded-xl px-4 py-4 font-mono text-sm text-white focus:outline-none transition shadow-[0_0_15px_rgba(10,209,17,0.15)] focus:shadow-[0_0_15px_rgba(10,209,17,0.4)]"
                  />
                </div>

                <button
                  onClick={handleStaffLogin}
                  disabled={loading || !username || !password}
                  className="w-full py-4 mt-2 bg-[#106011] hover:bg-[#168117] disabled:bg-[#106011]/20 text-white disabled:text-[#106011]/50 border-2 border-[#0ad111]/60 rounded-xl font-mono uppercase tracking-widest font-black text-xs transition duration-300 shadow-[0_0_20px_rgba(10,209,17,0.5)] active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Terminal className="w-4 h-4 text-white" />
                    EXECUTE COVERT LOGIN
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 8. DYNAMIC DECRYPTED LIVE LOGS CONSOLE FEED */}
        <div className="mt-6 pt-4 border-t border-[#106011]/30 relative z-10">
          <div className="bg-black/95 border border-[#106011]/40 rounded-xl p-4 font-mono text-[9px] text-[#0ad111] space-y-1.5 tracking-widest min-h-[72px] relative shadow-inner">
            
            {/* Fine circuit corner detail inside the terminal block */}
            <div className="absolute top-2 right-2.5 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-[#0ad111] animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-[7px] font-bold">CORE_SYSTEM_LINK</span>
            </div>
            
            {systemLogs.map((log, index) => (
              <motion.div 
                key={index + log}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1 - index * 0.32, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-1"
              >
                <span className="text-[#0ad111]/40 shrink-0 select-none">&gt;&gt;</span>
                <span className="break-all">{log}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 9. CRITICAL ERROR CALLOUT WITH WIGGLE - Match high contrast cyber style */}
        {error && (
          <motion.div 
            animate={{ x: [-10, 10, -6, 6, -3, 3, 0] }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-[#f87171] bg-red-950/40 border-2 border-red-500/40 text-[10px] font-mono rounded-xl p-3.5 text-center mt-5 leading-relaxed uppercase tracking-wider flex items-center justify-center gap-2 relative z-10"
          >
            <AlertOctagon className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
            <span>CRITICAL INTRUSION ERROR: {error}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
