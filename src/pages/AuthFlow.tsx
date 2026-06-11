import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Terminal, 
  User, 
  Cpu, 
  RefreshCw,
  ShieldCheck,
  Fingerprint
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRole } from '../context/RoleContext';
import { BannerSlider } from '../components/ui/BannerSlider';
import { useToast } from '@/components/ui/ToastContainer';
import ClientLogin from '@/components/auth/ClientLogin';
import { PinVerification } from '../components/auth/PinVerification';

type LoginMode = 'client' | 'staff';

export default function AuthFlow() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [mode, setMode] = useState<LoginMode>('client');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  
  const { showToast } = useToast();
  const featureGridRef = useRef<HTMLDivElement>(null);

  // Tactical simulation states
  const [systemLogs, setSystemLogs] = useState<string[]>([
    'INITIALIZING SECURE HANDSHAKE...',
    'ESTABLISHING VPN TUNNEL: UP',
  ]);
  const [systemTime, setSystemTime] = useState('');

  const { refreshRole } = useRole();

  // Update virtual systems clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulated system logs
  useEffect(() => {
    const logs = [
      'TUNNEL ROUTE SECURED VIA CRYPTO_NET',
      'PEER HANDSHAKE COMPLETED',
      'READY FOR MULTI-FACTOR ENCRYPTION',
      'WARNING: NO PERSONAL DATA LOGGED',
      'STANDBY FOR GPS TELEMETRY EXPORT',
    ];
    const logInterval = setInterval(() => {
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      setSystemLogs(prev => [randomLog, prev[0]].slice(0, 3));
    }, 4500);
    return () => clearInterval(logInterval);
  }, []);

  // Staff Login
  const handleStaffLogin = async () => {
    if (!username || !password) return;

    setLoading(true);
    setSystemLogs(prev => [`AUTHENTICATING: ${username.toUpperCase()}`, ...prev].slice(0, 3));
    
    try {
      const emailMatch = username.includes('@') 
        ? username 
        : `${username}@thedrop.local`;

      const { error } = await supabase.auth.signInWithPassword({
        email: emailMatch, 
        password: password,
      });

      if (error) throw error;

      await handleSuccessfulLogin();
    } catch (err: any) {
      setSystemLogs(prev => [`AUTH FAILURE: ${err.message || 'DECLINED'}`, ...prev].slice(0, 3));
      showToast(err.message || 'Login failed', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Demo bypass for staff
  const handleDemoBypass = async (demoRole: string) => {
    setSystemLogs(prev => [`DEMO BYPASS: ${demoRole.toUpperCase()}`, ...prev].slice(0, 3));
    localStorage.setItem('demo_role', demoRole);
    await refreshRole();

    if (demoRole === 'super_admin') navigate('/super-admin');
    else if (demoRole === 'admin') navigate('/admin');
    else if (demoRole === 'dropper') navigate('/dropper');
  };

  const handleSuccessfulLogin = async () => {
    const userRole = await refreshRole();
    if (userRole === 'super_admin') navigate('/super-admin');
    else if (userRole === 'admin') navigate('/admin');
    else if (userRole === 'dropper') navigate('/dropper');
    else navigate('/');
  };

  return (
    <div className="min-h-screen text-[#106011] relative flex items-center justify-center p-4 overflow-y-auto font-sans select-none bg-black"
      id="auth-root-container">
      
      {/* Consolidated Tactical Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[0.3] brightness-75 pointer-events-none transition-opacity duration-1000"
          style={{ backgroundImage: `url('/regenerated_image_1781027109738.jpg')` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(10,209,17,0.15)_1px,transparent_1px)] bg-[length:100%_4px]" />
      </div>


      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4 overflow-hidden"
          >
            {/* Ambient Background for Intro using clean high-fidelity image */}
            <div className="absolute inset-0 z-0">
              <motion.img 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                src="/regenerated_image_1781027109738.jpg" 
                alt="Tactical Background" 
                className="w-full h-full object-cover filter grayscale-[0.4] brightness-50 contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />
            </div>

            {/* Tactical Grid Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.15] pointer-events-none z-1" 
              style={{
                backgroundImage: `
                  linear-gradient(#106011 1px, transparent 1px),
                  linear-gradient(90deg, #106011 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none z-[15] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] opacity-30" />

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-lg bg-black/95 border border-[#106011]/80 rounded-[2rem] p-6 relative z-10 backdrop-blur-md shadow-[0_0_80px_rgba(16,96,17,0.6)]"
            >
              {/* Corner Brackets */}
              <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-[#0ad111] rounded-tl-[2rem] shadow-[0_0_15px_rgba(10,209,17,0.5)]" />
              <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-[#0ad111] rounded-tr-[2rem] shadow-[0_0_15px_rgba(10,209,17,0.5)]" />
              <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-[#0ad111] rounded-bl-[2rem] shadow-[0_0_15px_rgba(10,209,17,0.5)]" />
              <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-[#0ad111] rounded-br-[2rem] shadow-[0_0_15px_rgba(10,209,17,0.5)]" />

              <div className="relative space-y-6 pt-4 pb-2">
                {/* Header Stats */}
                <div className="flex justify-between items-center px-2">
                  <div className="flex flex-col items-start">
                    <span className="text-[7px] font-mono text-[#0ad111] tracking-widest leading-none">OC01.MINDO DIRECT LINK ESTABLISHED</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] font-mono text-[#0ad111] tracking-widest leading-none">THC420 // {systemTime}</span>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-sm font-black tracking-[0.5em] text-white/50 uppercase">PURE. NATURAL. LEGITIMATE.</h2>
                  <h1 className="text-[#0ad111] text-xs font-mono tracking-[0.4em] uppercase font-black">OCCI.MINDORO DROP SHOP</h1>
                </div>

                {/* Central Feature Banner */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#106011]/50 group">
                  <img src="/coverphoto4.jpg" className="w-full h-full object-cover filter brightness-50 contrast-125 transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  
                  {/* Floating Overlay Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[8px] font-mono text-[#0ad111] tracking-[0.4em] mb-1">ELEVATE</span>
                    <span className="text-[6px] font-mono text-zinc-400 tracking-[0.2em] mb-4">PURE. NATURAL. LEGITIMATE.</span>
                    <h2 className="text-3xl font-black tracking-[0.3em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">THE DROP</h2>
                    <div className="mt-2 text-center text-[7px] font-mono text-zinc-300 leading-tight space-y-0.5">
                      <p>Occ.Mindoro Legit Drop Shop 100%</p>
                      <p>Premium cannabis products crafted with care</p>
                      <p>from Occidental Mindoro. Real quality. Real results.</p>
                    </div>
                  </div>

                  {/* Feature Checklist Overlay */}
                  <div className="absolute top-4 left-4 space-y-1 text-left">
                    {['EXOTIC THC PRODUCTS', 'TOP SHELF QUALITY', 'TESTED. TRUSTED.', 'PURE EXCELLENCE', 'PREMIUM CANNABIS', 'CULTIVATED RIGHT'].map(item => (
                      <div key={item} className="flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-[#0ad111] rounded-full shadow-[0_0_5px_#0ad111]" />
                        <span className="text-[6px] font-mono text-white/70 tracking-widest">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-4 right-4 space-y-1 text-right">
                    {['THC INFUSED', 'HIGH THC PERCENTAGE', 'LAB TESTED. CLEAN', 'SLOW BURN. FAST EFFECTS', 'RICH TERPENES', 'ELEVATE YOUR EXPERIENCE'].map(item => (
                      <div key={item} className="flex items-center justify-end gap-1.5">
                        <span className="text-[6px] font-mono text-white/70 tracking-widest">{item}</span>
                        <div className="w-1 h-1 bg-[#0ad111] rounded-full shadow-[0_0_5px_#0ad111]" />
                      </div>
                    ))}
                  </div>

                  {/* Circular Secondary Logo */}
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-[#106011]/80 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-md shadow-[0_0_15px_rgba(10,209,17,0.4)] overflow-hidden group">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-dashed border-[#0ad111]/30 rounded-full"
                    />
                    <img src="/Appicon.png" className="w-full h-full object-cover rounded-full p-1 opacity-80" alt="Secondary Logo" />
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setShowIntro(false)}
                    className="w-full py-5 bg-[#106011]/80 hover:bg-[#168117] text-white rounded-2xl font-mono uppercase tracking-[0.2em] text-[10px] font-black shadow-[0_0_30px_rgba(16,96,17,0.4)] transition-all transform hover:scale-[1.01] flex items-center justify-center gap-3 border border-[#0ad111]/30 group"
                  >
                    <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    DECRYPT & ENTER PORTAL APPARATUS
                  </button>

                  <button 
                    onClick={() => setShowIntro(false)}
                    className="w-full text-center text-[8px] font-mono text-zinc-500 hover:text-[#0ad111] transition-colors uppercase tracking-[0.3em] font-medium"
                  >
                    SKIP INTRO & ACCESS TERMINAL DIRECTLY
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md bg-black/95 border border-[#106011]/60 rounded-[2.5rem] p-6 relative z-10 shadow-[0_0_80px_rgba(16,96,17,0.5)] backdrop-blur-2xl">
        {/* Glowing Outer Corner Brackets */}
        <div className="absolute -top-0.5 -left-0.5 w-10 h-10 border-t-2 border-l-2 border-[#0ad111] rounded-tl-[2.5rem] shadow-[0_0_10px_#0ad111]" />
        <div className="absolute -top-0.5 -right-0.5 w-10 h-10 border-t-2 border-r-2 border-[#0ad111] rounded-tr-[2.5rem] shadow-[0_0_10px_#0ad111]" />
        <div className="absolute -bottom-0.5 -left-0.5 w-10 h-10 border-b-2 border-l-2 border-[#0ad111] rounded-bl-[2.5rem] shadow-[0_0_10px_#0ad111]" />
        <div className="absolute -bottom-0.5 -right-0.5 w-10 h-10 border-b-2 border-r-2 border-[#0ad111] rounded-br-[2.5rem] shadow-[0_0_10px_#0ad111]" />
        
        {/* Banner Section */}
        <div className="relative h-28 mb-4 rounded-2xl overflow-hidden border border-[#106011]/40">
          <BannerSlider />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <h2 className="text-xl font-black tracking-[0.3em] text-white">THE DROP</h2>
            <p className="text-[7px] font-mono text-zinc-300 tracking-widest mt-1 uppercase">Occ.Mindoro Legit Drop Shop 100%</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-1.5 group cursor-default">
            <div className="w-1.5 h-1.5 bg-[#0ad111] rounded-full animate-pulse shadow-[0_0_8px_#106011]" />
            <span className="text-[8px] font-mono text-[#0ad111] tracking-widest font-bold">SHOP IS ACTIVE</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Cpu className="w-3 h-3" />
            <span className="text-[8px] font-mono tracking-widest font-bold uppercase transition-colors group-hover:text-emerald-400">LATENCY: 12ms</span>
          </div>
        </div>

        {/* Logo and Identity */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3 group h-20 w-20">
            <motion.div 
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(10, 209, 17, 0.2), inset 0 0 10px rgba(10, 209, 17, 0.1)",
                  "0 0 50px rgba(10, 209, 17, 0.6), inset 0 0 20px rgba(10, 209, 17, 0.3)",
                  "0 0 20px rgba(10, 209, 17, 0.2), inset 0 0 10px rgba(10, 209, 17, 0.1)"
                ],
                scale: [1, 1.02, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#0ad111]/10 rounded-full blur-xl group-hover:bg-[#0ad111]/30 transition-all duration-500" 
            />
            <motion.div 
              animate={{ rotate: [0, 90, 180, 270, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-4px] border border-dashed border-[#106011]/40 rounded-full pointer-events-none"
            />
            <motion.div 
              animate={{ rotate: [0, -90, -180, -270, -360] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-8px] border border-dotted border-[#106011]/20 rounded-full pointer-events-none"
            />
            <div className="w-20 h-20 bg-black border-2 border-[#106011] rounded-full p-1 relative z-10 flex items-center justify-center shadow-[0_0_20px_rgba(16,96,17,0.4)] group-hover:border-[#0ad111] transition-colors duration-500 overflow-hidden">
              {/* Internal HUD scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px] pointer-events-none opacity-20" />
              
              <motion.img 
                animate={{ 
                  scale: [1, 1.15, 1],
                  filter: [
                    "drop-shadow(0 0 8px rgba(10,209,17,0.4))",
                    "drop-shadow(0 0 16px rgba(10,209,17,0.8))",
                    "drop-shadow(0 0 8px rgba(10,209,17,0.4))"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                src="/Appicon.png" 
                alt="App Icon" 
                className="w-full h-full object-cover rounded-full relative z-10" 
              />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-[0.4em] text-white">THE DROP</h1>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('client')}
            className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-mono font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
              mode === 'client' 
                ? 'bg-[#106011] text-white shadow-[0_0_15px_rgba(16,96,17,0.4)] border border-[#0ad111]/30' 
                : 'bg-black/40 text-slate-500 border border-[#106011]/20 hover:border-[#106011]/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            GETTO/CLIENT
          </button>
          <button
            onClick={() => setMode('staff')}
            className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-mono font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
              mode === 'staff' 
                ? 'bg-[#106011] text-white shadow-[0_0_15px_rgba(16,96,17,0.4)] border border-[#0ad111]/30' 
                : 'bg-black/40 text-slate-500 border border-[#106011]/20 hover:border-[#106011]/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            RESTRICTED PORTAL
          </button>
        </div>

        {mode === 'client' ? (
          <ClientLogin />
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2 font-black">
                <User className="w-3.5 h-3.5 text-[#0ad111]" /> INTERNAL STAFF CODENAME/ALIAS
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ghostwalker"
                  className="w-full bg-black/60 border-2 border-[#106011]/40 focus:border-[#0ad111] rounded-2xl px-5 py-4 font-mono text-sm text-white outline-none transition-all focus:shadow-[0_0_20px_rgba(16,96,17,0.2)] placeholder:text-zinc-700"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2 font-black">
                <Lock className="w-3.5 h-3.5 text-[#0ad111]" /> CRYPTOGRAPHIC PASSWORD KEY
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/60 border-2 border-[#106011]/40 focus:border-[#0ad111] rounded-2xl px-5 py-4 font-mono text-sm text-white outline-none transition-all focus:shadow-[0_0_20px_rgba(16,96,17,0.2)] placeholder:text-zinc-700"
                />
              </div>
            </div>
            <button
              onClick={handleStaffLogin}
              disabled={loading || !username || !password}
              className="w-full py-5 bg-[#106011]/80 hover:bg-[#168117] disabled:bg-[#106011]/10 text-white rounded-2xl font-mono uppercase tracking-[0.3em] font-black text-[11px] transition-all transform active:scale-95 border border-[#0ad111]/30 shadow-[0_0_20px_rgba(16,96,17,0.3)] flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Terminal className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
              EXECUTE COVERT LOGIN
            </button>
          </div>
        )}

        {/* System Terminal Interface */}
        <div className="mt-8 pt-4 border-t border-[#106011]/20">
          <div className="flex justify-between items-center mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#0ad111] rounded-full animate-pulse" />
              <span className="text-[8px] font-mono text-[#0ad111]/80 uppercase tracking-widest font-black">CORE_SYSTEM_LINK</span>
            </div>
            <span className="text-[8px] font-mono text-[#0ad111]/50">{systemTime}</span>
          </div>
          <div className="bg-black border border-[#106011]/30 rounded-xl p-4 font-mono text-[9px] text-[#0ad111] space-y-1.5 min-h-[70px] relative overflow-hidden shadow-inner">
            {/* Terminal Scanline Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px] pointer-events-none" />
            <div className="relative z-10">
              {systemLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 opacity-80 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-[#0ad111]/40 tracking-tight">&gt;&gt;</span>
                  <span className="break-all font-medium uppercase tracking-tighter">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {import.meta.env.DEV && mode === 'staff' && (
          <div className="mt-4 flex gap-2">
            {['super_admin', 'admin', 'dropper'].map(role => (
              <button 
                key={role}
                onClick={() => handleDemoBypass(role)} 
                className="flex-1 text-[7px] py-2 border border-[#106011]/30 rounded-lg text-zinc-500 hover:text-[#0ad111] transition-colors font-mono font-black uppercase tracking-widest"
              >
                {role.replace('_', '-')}
              </button>
            ))}
          </div>
        )}
      </div>

      {showPinModal && (
        <PinVerification
          role={selectedRole}
          onCancel={() => setShowPinModal(false)}
          onSuccess={() => {
            setShowPinModal(false);
            handleDemoBypass(selectedRole);
          }}
        />
      )}
    </div>
  );
}
