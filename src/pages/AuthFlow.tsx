/**
 * AuthFlow — main login page.
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
  Clock,
  Leaf,
  ShieldCheck,
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

  useEffect(() => {
    const update = () =>
      setSystemTime(
        new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

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

  const handleStaffLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    setSystemLogs((prev) =>
      [`AUTHENTICATING: ${username.toUpperCase()}`, ...prev].slice(0, 3)
    );

    const email = username.includes('@')
      ? username
      : `${username}@internal.droppinops.local`;

    const { error } = await signInWithPassword(email, password);

    if (error) {
      showToast(error.message, { type: 'error' });
      setLoading(false);
      return;
    }

    await handleSuccessfulLogin();
  };

  const routeByRole = (role: string | null) => {
    if (role === 'super_admin' || role === 'admin') {
      navigate('/super-admin', { replace: true });
    } else if (role === 'dropper') {
      navigate('/dropper', { replace: true });
    } else if (role === 'client') {
      navigate('/client', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleSuccessfulLogin = async () => {
    setSystemLogs((prev) =>
      ['DECRYPTING ROLE SECURITY CLEARANCE...', ...prev].slice(0, 3)
    );
    const userRole = await refreshRole();
    setSystemLogs((prev) =>
      [`CLEARANCE: ${userRole?.toUpperCase() ?? 'NONE'}`, ...prev].slice(0, 3)
    );
    routeByRole(userRole);
  };

  return (
    <div
      className="min-h-screen text-[#106011] relative flex items-center justify-center p-4 overflow-y-auto font-sans select-none bg-black"
    >
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[0.3] brightness-75 pointer-events-none"
          style={{ backgroundImage: `url('/coverphoto002.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(10,209,17,0.15)_1px,transparent_1px)] bg-[length:100%_4px]" />
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'circOut' }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#0ad111]/10 rounded-full animate-ping" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-[#0ad111]/20 rounded-full animate-pulse" />
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'backOut' }}
              className="relative mb-12"
            >
              <div className="w-48 h-48 bg-black border-4 border-[#106011] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(16,96,17,0.4)] relative group overflow-hidden">
                <img
                  src="/logo.png"
                  alt="THE DROP"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center z-10"
            >
              <h1 className="text-5xl font-black tracking-[0.4em] text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                THE DROP
              </h1>
              <div className="h-1 w-64 bg-[#106011] mx-auto mb-6 relative overflow-hidden">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-emerald-400 shadow-[0_0_10px_#34d399]"
                />
              </div>
              <p className="text-xs font-mono text-emerald-500/80 tracking-[0.5em] uppercase mb-12">
                NUEVA ECIJA • OPS_LINK_v1.0.8
              </p>

              <button
                onClick={() => setShowIntro(false)}
                className="group relative px-12 py-5 bg-transparent border-2 border-[#106011] overflow-hidden transition-all hover:border-[#0ad111]"
              >
                <div className="absolute inset-0 bg-[#106011]/10 group-hover:bg-[#106011]/20 transition-all" />
                <span className="relative z-10 text-white font-mono font-black text-sm tracking-[0.4em] uppercase">
                  INITIALIZE SESSION
                </span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md bg-black/95 border border-[#106011]/60 rounded-[2.5rem] p-6 relative z-10 shadow-[0_0_80px_rgba(16,96,17,0.5)] backdrop-blur-2xl">
        <div className="absolute -top-0.5 -left-0.5 w-10 h-10 border-t-2 border-l-2 border-[#0ad111] rounded-tl-[2.5rem]" />
        <div className="absolute -top-0.5 -right-0.5 w-10 h-10 border-t-2 border-r-2 border-[#0ad111] rounded-tr-[2.5rem]" />
        <div className="absolute -bottom-0.5 -left-0.5 w-10 h-10 border-b-2 border-l-2 border-[#0ad111] rounded-bl-[2.5rem]" />
        <div className="absolute -bottom-0.5 -right-0.5 w-10 h-10 border-b-2 border-r-2 border-[#0ad111] rounded-br-[2.5rem]" />

        <div className="relative h-28 mb-4 rounded-2xl overflow-hidden border border-[#106011]/40">
          <BannerSlider />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <h2 className="text-xl font-black tracking-[0.3em] text-white uppercase">THE DROP</h2>
            <p className="text-[7px] font-mono text-zinc-300 tracking-widest mt-1 uppercase">
              Secure Operational Portal
            </p>
          </div>
        </div>

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
              {m === 'client' ? 'CLIENT PORTAL' : 'STAFF PORTAL'}
            </button>
          ))}
        </div>

        {mode === 'client' ? (
          <ClientLogin />
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2 font-black">
                <User className="w-3.5 h-3.5 text-[#0ad111]" /> STAFF CODENAME
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
                <Lock className="w-3.5 h-3.5 text-[#0ad111]" /> ACCESS PASSWORD
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
              {loading ? 'AUTHENTICATING...' : 'EXECUTE LOGIN'}
            </button>
          </div>
        )}

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
