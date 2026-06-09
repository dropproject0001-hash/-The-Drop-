import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white relative overflow-hidden font-sans">
      {/* Background visual details */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black z-0" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-900/50 to-transparent animate-pulse z-0" />

      <div className="w-full max-w-md bg-zinc-950/80 border border-red-500/25 rounded-2xl p-8 text-center relative z-10 backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.15)]">
        <div className="mx-auto w-16 h-16 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-mono uppercase font-black tracking-widest text-red-500 mb-2">
          ACCESS SCHEME DENIED
        </h1>
        <p className="text-zinc-500 font-mono text-xs mb-8 uppercase tracking-wider">
          Security clearance level: INSUFFICIENT
        </p>

        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          The requested operational node is restricted. unauthorised connection attempts are logged and tracked by operations security (OPSEC).
        </p>

        <div className="space-y-3">
          <Link
            to="/auth"
            className="block w-full py-3 bg-red-950/20 hover:bg-red-900/30 border border-red-500/30 text-red-400 hover:text-white rounded-xl text-sm font-mono uppercase tracking-widest font-semibold transition"
          >
            Authenticate Portal
          </Link>
          <Link
            to="/"
            className="block w-full py-3 text-zinc-500 hover:text-zinc-300 text-xs font-mono uppercase tracking-wider transition"
          >
            Return to Base
          </Link>
        </div>
      </div>
    </div>
  );
}
