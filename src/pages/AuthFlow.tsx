/**
 * AuthFlow — main login page.
 *
 * FIX Bug-3: handleSuccessfulLogin now routes 'client' to /client instead of /
 * FIX Bug-5: removed dead showPinModal / selectedRole state and PinVerification
 *            import — nothing ever set showPinModal=true so the modal could
 *            never appear. Cleaned up to avoid confusion.
 * FIX Bug-2 (staff path): handleStaffLogin uses AuthContext.signInWithPassword
 *            which fetches the profile inline, so handleSuccessfulLogin can
 *            immediately read the correct role without a race.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Terminal,
  User,
  Cpu,
  RefreshCw,
  Fingerprint,
  Users,
  FlaskConical,
  ShieldCheck,
  Clock,
  Leaf,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useRole } from '@/context/RoleContext';
import { BannerSlider } from '../components/ui/BannerSlider';
import { useToast } from '@/components/ui/ToastContainer';
import ClientLogin from '@/components/auth/ClientLogin';

type LoginMode = 'client' | 'staff';

export default function AuthFlow() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { signInWithPassword, user } = useAuth();
  const { refreshRole } = useRole();

  useEffect(() => {
    if (user) {
      console.log('[AuthFlow] User already logged in, redirecting...');
      handleSuccessfulLogin();
    }
  }, [user]);

  const [showIntro, setShowIntro] = useState(true);
  const [mode, setMode] = useState<LoginMode>('client');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [systemLogs, setSystemLogs] = useState<string[]>([
    'INITIALIZING SECURE HANDSHAKE...',
    'ESTABLISHING VPN TUNNEL: UP',
  ]);
  const [systemTime, setSystemTime] = useState('');

  // Clock
  useEffect(() => {
    const update = () =>
      setSystemTime(
        new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Simulated log scroll
  useEffect(() => {
    const logs = [
      'TUNNEL ROUTE SECURED VIA CRYPTO_NET',
      'PEER HANDSHAKE COMPLETED',
      'READY FOR MULTI-FACTOR ENCRYPTION',
      'WARNING: NO PERSONAL DATA LOGGED',
      'STANDBY FOR GPS TELEMETRY EXPORT',
    ];
    const id = setInterval(() => {
      setSystemLogs((prev) =>
        [logs[Math.floor(Math.random() * logs.length)], prev[0]].slice(0, 3)
      );
    }, 4500);
    return () => clearInterval(id);
  }, []);

  // ── Staff Login ──────────────────────────────────────────────────────────
  const handleStaffLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    setSystemLogs((prev) =>
      [`AUTHENTICATING: ${username.toUpperCase()}`, ...prev].slice(0, 3)
    );

    // Accept bare username (ghostwalker) or full email (ghostwalker@thedrop.local)
    const email = username.includes('@')
      ? username
      : `${username}@thedrop.local`;

    // signInWithPassword fetches the profile inline — no race
    const { error } = await signInWithPassword(email, password);

    if (error) {
      setSystemLogs((prev) =>
        [`AUTH FAILURE: ${error.message || 'DECLINED'}`, ...prev].slice(0, 3)
      );
      showToast(error.message || 'Login failed', { type: 'error' });
      setLoading(false);
      return;
    }

    await handleSuccessfulLogin();
    setLoading(false);
  };

  // ── Shared navigation helper ─────────────────────────────────────────────
  const routeByRole = (role: string | null) => {
    if (role === 'super_admin' || role === 'admin') navigate('/super-admin', { replace: true });
    else if (role === 'dropper') navigate('/dropper', { replace: true });
    // FIX Bug-3: was `else navigate('/')` — clients landed on RoleSelector
    else if (role === 'client') navigate('/client', { replace: true });
    else navigate('/', { replace: true });
  };

  const handleSuccessfulLogin = async () => {
    setSystemLogs((prev) =>
      ['DECRYPTING ROLE SECURITY CLEARANCE...', ...prev].slice(0, 3)
    );
    // FIX Bug-4: refreshRole() returns the actual fresh role from DB
    const userRole = await refreshRole();
    setSystemLogs((prev) =>
      [`CLEARANCE: ${userRole?.toUpperCase() ?? 'NONE'}`, ...prev].slice(0, 3)
    );
    routeByRole(userRole);
  };

  return (
    <div
      className="min-h-screen text-[#106011] relative flex items-center justify-center p-4 overflow-y-auto font-sans select-none bg-black"
      id="auth-root-container"
    >
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[0.3] brightness-75 pointer-events-none"
          style={{ backgroundImage: `url('/coverphoto002.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(10,209,17,0.15)_1px,transparent_1px)] bg-[length:100%_4px]" />
      </div>

      {/* ── Intro overlay ── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[60] bg-[#050505] flex flex-col items-center justify-between p-6 md:p-8 overflow-y-auto"
            id="premium-portal-intro-screen"
          >
            {/* Fine HUD Grid Background */}
            <div 
              className="absolute inset-0 pointer-events-none z-0 opacity-15"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 255, 102, 0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 255, 102, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px',
              }}
            />

            {/* Ambient Blurred Colored Orbs */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[500px] h-[350px] md:h-[500px] rounded-full bg-[#00ff66]/[0.025] blur-[150px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] md:w-[500px] h-[350px] md:h-[500px] rounded-full bg-[#00ff66]/[0.025] blur-[150px] pointer-events-none" />

            {/* Continuous Vertical Scanner sweep */}
            <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-transparent via-[#00ff66]/[0.03] to-transparent bg-[length:100%_400px] animate-[scan_8s_linear_infinite]" />

            {/* Giant blurred logo watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none font-display font-black text-[12vw] select-none text-[#00ff66]">
              THE DROP
            </div>

            {/* Random rising tactical hud data particles */}
            {Array.from({ length: 15 }).map((_, idx) => (
              <motion.div
                key={idx}
                className="absolute rounded-full bg-[#00ff66]/30 pointer-events-none z-0"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 1.5}px`,
                  height: `${Math.random() * 4 + 1.5}px`,
                }}
                animate={{
                  y: [0, -80, 0],
                  opacity: [0.1, 0.7, 0.1],
                }}
                transition={{
                  duration: Math.random() * 7 + 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: Math.random() * 4,
                }}
              />
            ))}

            {/* Top Spacer to push content center on desktop */}
            <span className="hidden md:block h-2" />

            {/* ── Main Futuristic Portal Box ── */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-xl bg-black/90 border border-[#00ff66]/20 rounded-[2rem] p-6 relative z-10 backdrop-blur-xl shadow-[0_0_80px_rgba(0,255,102,0.12)] flex flex-col gap-6"
            >
              {/* Premium glowing custom tactical corners */}
              <div className="absolute -top-[1.5px] -left-[1.5px] w-14 h-14 border-t-4 border-l-4 border-[#00ff66] rounded-tl-[2rem] shadow-[0_0_15px_#00ff66]" />
              <div className="absolute -top-[1.5px] -right-[1.5px] w-14 h-14 border-t-4 border-r-4 border-[#00ff66] rounded-tr-[2rem] shadow-[0_0_15px_#00ff66]" />
              <div className="absolute -bottom-[1.5px] -left-[1.5px] w-14 h-14 border-b-4 border-l-4 border-[#00ff66] rounded-bl-[2rem] shadow-[0_0_15px_#00ff66]" />
              <div className="absolute -bottom-[1.5px] -right-[1.5px] w-14 h-14 border-b-4 border-r-4 border-[#00ff66] rounded-br-[2rem] shadow-[0_0_15px_#00ff66]" />

              <div className="relative space-y-6 pt-4 pb-2">
                {/* Connection Status line */}
                <div className="flex justify-between items-center text-[8px] md:text-[9.5px] font-mono text-[#00ff66] tracking-[0.15em] opacity-90">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping" />
                    NE01.ECIJA DIRECT LINK ESTABLISHED
                  </span>
                  <span className="font-semibold">
                    THC420 // {systemTime}
                  </span>
                </div>

                {/* Main Titles */}
                <div className="text-center space-y-1">
                  <h2 className="text-xs md:text-[13px] font-display font-black tracking-[0.45em] text-white/95 uppercase">
                    PURE. NATURAL. LEGITIMATE.
                  </h2>
                  <h1 className="text-[#00ff66] text-xs md:text-[12.5px] font-mono tracking-[0.35em] uppercase font-bold text-shadow-glow">
                    NUEVA ECIJA DROP SHOP
                  </h1>
                </div>

                {/* Immersive Holographic Cover Image Card */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-[#00ff66]/20 bg-zinc-950/40 group">
                  {/* Background leaf banner */}
                  <img
                    src="/coverphoto004.jpg"
                    className="w-full h-full object-cover filter brightness-[0.4] contrast-[1.15] scale-105 group-hover:scale-110 transition-transform duration-[12s] ease-out-expo"
                    alt="Tactical Cannabis Canopy Cover"
                  />
                  
                  {/* Holographic Concentric Ring Graphics */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.15] z-10">
                    <div className="w-56 h-56 rounded-full border border-dashed border-[#00ff66] animate-spin-slow" />
                    <div className="absolute w-40 h-40 rounded-full border border-dotted border-[#00ff66] animate-spin-reverse-slow" />
                  </div>

                  {/* Gradient Fade Protection */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30" />

                  {/* Banner Content (Bottom aligned with beautiful spacing) */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end gap-1 z-20">
                    <span className="text-[8px] font-mono text-[#00ff66]/80 tracking-[0.2em] font-semibold">
                      OPERATIONAL SUB-LINK
                    </span>
                    <h3 className="text-2xl md:text-3xl font-display font-extrabold tracking-[0.18em] text-white drop-shadow-[0_0_12px_rgba(0,255,102,0.3)]">
                      THE DROP
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-300">
                      Legit Drop Shop 100%
                    </p>
                    <p className="text-[9px] text-zinc-400 font-sans tracking-wide max-w-[280px] leading-relaxed mt-1">
                      Premium products crafted with care and integrity. Real quality. Real results.
                    </p>

                    {/* Learn more micro-action */}
                    <motion.button
                      whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 102, 0.65)' }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-3.5 self-start px-3.5 py-1.5 rounded-lg border border-[#00ff66]/30 bg-black/60 backdrop-blur-md text-[8.5px] font-mono text-[#00ff66] uppercase tracking-[0.15em] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Leaf className="w-3 h-3 text-[#00ff66] animate-pulse" />
                      LEARN MORE
                    </motion.button>
                  </div>
                </div>

                {/* Primary CTA and Skip option with enhanced micro interactions */}
                <div className="space-y-4 pt-1">
                  <motion.button
                    onClick={() => setShowIntro(false)}
                    whileHover={{ 
                      scale: 1.015, 
                      boxShadow: "0 0 35px rgba(0, 255, 102, 0.45)", 
                      borderColor: "rgba(0, 255, 102, 0.85)" 
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-5 bg-gradient-to-r from-emerald-950/85 to-emerald-900/85 hover:from-emerald-900 hover:to-emerald-800 text-[#00ff66] rounded-2xl font-mono uppercase tracking-[0.15em] text-[11px] font-black shadow-[0_0_20px_rgba(0,255,102,0.12)] transition-all flex items-center justify-center gap-3 border-2 border-[#00ff66]/50 cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <Fingerprint className="w-5 h-5 text-[#00ff66] animate-pulse" />
                      <div className="absolute inset-0 rounded-full border border-[#00ff66]/50 animate-ping opacity-60" />
                    </div>
                    DECRYPT & ENTER PORTAL APPARATUS
                  </motion.button>
                  
                  <button
                    onClick={() => setShowIntro(false)}
                    className="w-full text-center text-[8px] font-mono text-zinc-500 hover:text-[#00ff66] transition-colors uppercase tracking-[0.25em] cursor-pointer"
                  >
                    SKIP INTRO & ACCESS TERMINAL DIRECTLY
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ── Bottom Statistics Panel (Bento row) ── */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full max-w-2xl bg-black/40 border border-[#00ff66]/15 rounded-[1.5rem] p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md relative overflow-hidden"
              id="portal-stats-panel"
            >
              {/* Dynamic top gradient trace */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00ff66]/25 to-transparent" />

              {/* Stats Block 1 */}
              <div className="flex-1 flex justify-around items-center gap-4 w-full min-w-[200px]">
                {/* Stat ID 1: Satisfied Customers */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/40 border border-emerald-500/25 flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#00ff66]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-mono font-bold text-xs text-white leading-none tracking-wider">10K+</span>
                    <span className="text-[7.5px] font-sans font-medium text-zinc-500 uppercase tracking-widest mt-1">Satisfied Customers</span>
                  </div>
                </div>

                {/* Stat ID 2: Lab Tested */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/40 border border-emerald-500/25 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-[#00ff66]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-mono font-bold text-xs text-white leading-none tracking-wider">50+</span>
                    <span className="text-[7.5px] font-sans font-medium text-zinc-500 uppercase tracking-widest mt-1">Lab Tested Products</span>
                  </div>
                </div>
              </div>

              {/* Central Glowing Spinning Badge */}
              <div className="hidden md:flex justify-center items-center relative mx-4 shrink-0">
                {/* Outer halo */}
                <div className="absolute w-14 h-14 rounded-full bg-[#00ff66]/15 blur-xl animate-pulse" />
                
                {/* Concentric spin HUD frames */}
                <div className="absolute w-[72px] h-[72px] rounded-full border border-dashed border-[#00ff66]/20 animate-spin-slow" />
                <div className="absolute w-[64px] h-[64px] rounded-full border border-dotted border-[#00ff66]/35 animate-spin-reverse-slow" />

                {/* Elegant rotating text circle */}
                <svg viewBox="0 0 100 100" className="w-[58px] h-[58px] animate-spin-slow z-10 pointer-events-none">
                  <path id="textPath-badge" d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                  <text fontSize="8.5" fontFamily="monospace" letterSpacing="4.5" fill="#00ff66" fontWeight="900" className="opacity-90">
                    <textPath href="#textPath-badge" startOffset="0%">
                      THE DROP • NUEVA ECIJA • THE DROP •
                    </textPath>
                  </text>
                </svg>

                {/* Inner central branding logo leaf */}
                <div className="absolute w-9 h-9 rounded-full bg-black border border-[#00ff66]/30 flex items-center justify-center z-20 shadow-[0_0_10px_rgba(0,255,102,0.2)]">
                  <Leaf className="w-4 h-4 text-[#00ff66] animate-breathe" />
                </div>
              </div>

              {/* Stats Block 2 */}
              <div className="flex-1 flex justify-around items-center gap-4 w-full min-w-[200px]">
                {/* Stat ID 3: Deliveries */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/40 border border-emerald-500/25 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#00ff66]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-mono font-bold text-xs text-white leading-none tracking-wider">99.8%</span>
                    <span className="text-[7.5px] font-sans font-medium text-zinc-500 uppercase tracking-widest mt-1">Successful Deliveries</span>
                  </div>
                </div>

                {/* Stat ID 4: Secure Support */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/40 border border-emerald-500/25 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#00ff66]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-mono font-bold text-xs text-white leading-none tracking-wider">24/7</span>
                    <span className="text-[7.5px] font-sans font-medium text-zinc-500 uppercase tracking-widest mt-1">Secure Support</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main panel ── */}
      <div className="w-full max-w-md bg-black/95 border border-[#106011]/60 rounded-[2.5rem] p-6 relative z-10 shadow-[0_0_80px_rgba(16,96,17,0.5)] backdrop-blur-2xl">
        <div className="absolute -top-0.5 -left-0.5 w-10 h-10 border-t-2 border-l-2 border-[#0ad111] rounded-tl-[2.5rem] shadow-[0_0_10px_#0ad111]" />
        <div className="absolute -top-0.5 -right-0.5 w-10 h-10 border-t-2 border-r-2 border-[#0ad111] rounded-tr-[2.5rem] shadow-[0_0_10px_#0ad111]" />
        <div className="absolute -bottom-0.5 -left-0.5 w-10 h-10 border-b-2 border-l-2 border-[#0ad111] rounded-bl-[2.5rem] shadow-[0_0_10px_#0ad111]" />
        <div className="absolute -bottom-0.5 -right-0.5 w-10 h-10 border-b-2 border-r-2 border-[#0ad111] rounded-br-[2.5rem] shadow-[0_0_10px_#0ad111]" />

        {/* Banner */}
        <div className="relative h-28 mb-4 rounded-2xl overflow-hidden border border-[#106011]/40">
          <BannerSlider />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <h2 className="text-xl font-black tracking-[0.3em] text-white">THE DROP</h2>
            <p className="text-[7px] font-mono text-zinc-300 tracking-widest mt-1 uppercase">
              Nueva Ecija Legit Drop Shop 100%
            </p>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#0ad111] rounded-full animate-pulse shadow-[0_0_8px_#106011]" />
            <span className="text-[8px] font-mono text-[#0ad111] tracking-widest font-bold">
              SHOP IS ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Cpu className="w-3 h-3" />
            <span className="text-[8px] font-mono tracking-widest font-bold uppercase">
              LATENCY: 12ms
            </span>
          </div>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-black border-2 border-[#106011] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,96,17,0.4)] overflow-hidden mb-3">
            <img src="/logo.png" alt="App Icon" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-2xl font-black tracking-[0.4em] text-white">THE DROP</h1>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6">
          {(['client', 'staff'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-mono font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                mode === m
                  ? 'bg-[#106011] text-white shadow-[0_0_15px_rgba(16,96,17,0.4)] border border-[#0ad111]/30'
                  : 'bg-black/40 text-slate-500 border border-[#106011]/20 hover:border-[#106011]/50'
              }`}
            >
              {m === 'client' ? <User className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
              {m === 'client' ? 'GETTO / CLIENT' : 'RESTRICTED PORTAL'}
            </button>
          ))}
        </div>

        {/* Form */}
        {mode === 'client' ? (
          <ClientLogin />
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2 font-black">
                <User className="w-3.5 h-3.5 text-[#0ad111]" /> INTERNAL STAFF CODENAME/ALIAS
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStaffLogin()}
                placeholder="e.g. ghostwalker"
                className="w-full bg-black/60 border-2 border-[#106011]/40 focus:border-[#0ad111] rounded-2xl px-5 py-4 font-mono text-sm text-white outline-none transition placeholder:text-zinc-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2 font-black">
                <Lock className="w-3.5 h-3.5 text-[#0ad111]" /> CRYPTOGRAPHIC PASSWORD KEY
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStaffLogin()}
                placeholder="••••••••••••"
                className="w-full bg-black/60 border-2 border-[#106011]/40 focus:border-[#0ad111] rounded-2xl px-5 py-4 font-mono text-sm text-white outline-none transition placeholder:text-zinc-700"
              />
            </div>
            <button
              onClick={handleStaffLogin}
              disabled={loading || !username || !password}
              className="w-full py-5 bg-[#106011]/80 hover:bg-[#168117] disabled:bg-[#106011]/10 text-white rounded-2xl font-mono uppercase tracking-[0.3em] font-black text-[11px] transition-all border border-[#0ad111]/30 shadow-[0_0_20px_rgba(16,96,17,0.3)] flex items-center justify-center gap-3"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Terminal className="w-4 h-4" />
              )}
              {loading ? 'AUTHENTICATING...' : 'EXECUTE COVERT LOGIN'}
            </button>
          </div>
        )}

        {/* System terminal */}
        <div className="mt-8 pt-4 border-t border-[#106011]/20">
          <div className="flex justify-between items-center mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#0ad111] rounded-full animate-pulse" />
              <span className="text-[8px] font-mono text-[#0ad111]/80 uppercase tracking-widest font-black">
                CORE_SYSTEM_LINK
              </span>
            </div>
            <span className="text-[8px] font-mono text-[#0ad111]/50">{systemTime}</span>
          </div>
          <div className="bg-black border border-[#106011]/30 rounded-xl p-4 font-mono text-[9px] text-[#0ad111] space-y-1.5 min-h-[70px] relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px] pointer-events-none" />
            <div className="relative z-10">
              {systemLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 opacity-80">
                  <span className="text-[#0ad111]/40">&gt;&gt;</span>
                  <span className="break-all font-medium uppercase tracking-tighter">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
