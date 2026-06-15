import { useMemo } from 'react';
import { validateSupabaseCredentials, supabaseValidationErrors } from '@/lib/supabase';

/**
 * ENV CHECKER
 * Blocks the app with a full-screen error if critical configuration is missing.
 * Ensures a secure and functional environment before the first render.
 */

export function EnvChecker({ children }: { children: React.ReactNode }) {
  const validation = useMemo(() => validateSupabaseCredentials(), []);

  if (!validation.isValid) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-6 z-[9999] font-mono">
        <div className="max-w-md w-full bg-zinc-950 border-2 border-red-900 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,0,0,0.2)]">
          <div className="flex items-center gap-3 mb-6 text-red-500">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center animate-pulse">
              <span className="text-xl font-black">!</span>
            </div>
            <h1 className="text-lg font-black uppercase tracking-tighter">System Critical Error</h1>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-xs text-zinc-400 leading-relaxed uppercase tracking-widest">
              Deployment halted. The following configuration vulnerabilities were detected in the environment:
            </p>

            <ul className="space-y-2">
              {validation.errors.map((err, i) => (
                <li key={i} className="text-[11px] text-red-400 bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-lg">
                  {err}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 mb-8">
            <h2 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Required Action:</h2>
            <p className="text-[10px] text-zinc-300 font-mono leading-relaxed">
              Verify your <code className="text-white bg-zinc-800 px-1 rounded">.env.local</code> file contains valid Supabase credentials and restart the development server.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition shadow-lg active:scale-95"
          >
            Retry Uplink
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ [EnvChecker] Secure environment validated. Initializing UI.');
  return <>{children}</>;
}
