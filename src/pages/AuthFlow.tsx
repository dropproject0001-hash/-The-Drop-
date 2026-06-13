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
  const { signInWithPassword } = useAuth();
  const { refreshRole } = useRole();

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
    if (role === 'super_admin') navigate('/super-admin', { replace: true });
    else if (role === 'admin') navigate('/admin', { replace: true });
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
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4 overflow-hidden"
          >
            <div className="absolute inset-0 z-0">
              <motion.img
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                src="/coverphoto002.jpg"
                alt="Tactical Background"
                className="w-full h-full object-cover filter grayscale-[0.4] brightness-50 contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />
            </div>

            <div
              className="absolute inset-0 opacity-[0.15] pointer-events-none z-[1]"
              style={{
                backgroundImage: `
                  linear-gradient(#106011 1px, transparent 1px),
                  linear-gradient(90deg, #106011 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-lg bg-black/95 border border-[#106011]/80 rounded-[2rem] p-6 relative z-10 backdrop-blur-md shadow-[0_0_80px_rgba(16,96,17,0.6)]"
            >
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-[#0ad111] rounded-tl-[2rem] shadow-[0_0_15px_rgba(10,209,17,0.5)]" />
              <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-[#0ad111] rounded-tr-[2rem] shadow-[0_0_15px_rgba(10,209,17,0.5)]" />
              <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-[#0ad111] rounded-bl-[2rem] shadow-[0_0_15px_rgba(10,209,17,0.5)]" />
              <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-[#0ad111] rounded-br-[2rem] shadow-[0_0_15px_rgba(10,209,17,0.5)]" />

              <div className="relative space-y-6 pt-4 pb-2">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[7px] font-mono text-[#0ad111] tracking-widest">
                    OC01.MINDO DIRECT LINK ESTABLISHED
                  </span>
                  <span className="text-[7px] font-mono text-[#0ad111] tracking-widest">
                    THC420 // {systemTime}
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-sm font-black tracking-[0.5em] text-white/50 uppercase">
                    PURE. NATURAL. LEGITIMATE.
                  </h2>
                  <h1 className="text-[#0ad111] text-xs font-mono tracking-[0.4em] uppercase font-black">
                    NUEVA ECIJA DROP SHOP
                  </h1>
                </div>

                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#106011]/50">
                  <img
                    src="/coverphoto004.jpg"
                    className="w-full h-full object-cover filter brightness-50 contrast-125"
                    alt="cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-black tracking-[0.3em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                      THE DROP
                    </h2>
                    <p className="text-[7px] font-mono text-zinc-300 mt-2">
                      Nueva Ecija Legit Drop Shop 100%
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowIntro(false)}
                    className="w-full py-5 bg-[#106011]/80 hover:bg-[#168117] text-white rounded-2xl font-mono uppercase tracking-[0.2em] text-[10px] font-black shadow-[0_0_30px_rgba(16,96,17,0.4)] transition-all flex items-center justify-center gap-3 border border-[#0ad111]/30"
                  >
                    <Fingerprint className="w-5 h-5" />
                    DECRYPT & ENTER PORTAL APPARATUS
                  </button>
                  <button
                    onClick={() => setShowIntro(false)}
                    className="w-full text-center text-[8px] font-mono text-zinc-500 hover:text-[#0ad111] transition uppercase tracking-[0.3em]"
                  >
                    SKIP INTRO & ACCESS TERMINAL DIRECTLY
                  </button>
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
