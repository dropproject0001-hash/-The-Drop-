import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuperAdminSetup() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    setupToken: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCreateSuperAdmin = async () => {
    if (!form.username || !form.password || !form.setupToken) {
      setMessage('All operational intelligence fields must be filled.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('bootstrap-super-admin', {
        body: { 
            username: form.username, 
            password: form.password, 
            setupToken: form.setupToken 
        },
      });

      if (error || data?.error) {
        throw new Error(error?.message || data?.error || 'Operational setup failure.');
      }

      setSuccess(true);
      setMessage('Super Admin credential deployment complete! The token has been permanently invalidated.');
    } catch (err: any) {
      setMessage(err.message || 'Operational setup failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black z-0" />

      <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-800 rounded-2xl p-8 relative z-10 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-mono uppercase tracking-widest font-black text-white">
            ROOT AUTHENTICATOR SETUP
          </h1>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mt-1">
            Super Admin bootstrapping console
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl font-mono">
              {message}
            </div>
            <Link
              to="/auth"
              className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold font-mono uppercase tracking-wider text-sm text-center transition"
            >
              Access Secure Portal
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Tactical Username/Alias</label>
              <input
                type="text"
                placeholder="rootadmin"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full mt-1.5 bg-black border border-zinc-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Secure Cryptographic Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full mt-1.5 bg-black border border-zinc-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">One-time Deployment Token</label>
              <input
                type="password"
                placeholder="e.g. key-ops-token..."
                value={form.setupToken}
                onChange={(e) => setForm({ ...form, setupToken: e.target.value })}
                className="w-full mt-1.5 bg-black border border-zinc-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none transition"
              />
            </div>

            <button
              onClick={handleCreateSuperAdmin}
              disabled={loading || !form.username || !form.password || !form.setupToken}
              className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 rounded-xl font-mono uppercase tracking-widest font-bold text-sm transition"
            >
              {loading ? 'Bootstrapping Access...' : 'DEPLOY ROOT CREDENTIALS'}
            </button>

            {message && (
              <p className="text-center text-xs font-mono text-red-400 mt-4 leading-relaxed p-3 bg-red-950/20 border border-red-900/20 rounded-xl">
                {message}
              </p>
            )}

            <div className="text-center mt-6">
              <Link to="/auth" className="text-xs font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-wider">
                Cancel Initial Boot
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
