import { useState } from 'react';
import { supabase, isMock } from '@/lib/supabase';
import { useToast } from '@/components/ui/ToastContainer';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isMock) {
        if (email === 'super@test.com') {
          showToast('Mock Login Successful', { type: 'success' });
          navigate('/');
          return;
        }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      showToast('Login Successful', { type: 'success' });
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Login failed', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center tracking-tighter">THE DROP <span className="text-emerald-500 text-xs block tracking-widest font-mono">OPERATIONAL UPLINK</span></h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-500 mb-2 tracking-widest">Identifier (Email)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition"
              placeholder="agent@ops.net"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-500 mb-2 tracking-widest">Passkey</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black py-4 rounded-xl transition uppercase tracking-widest text-sm disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            {loading ? 'AUTHENTICATING...' : 'ESTABLISH UPLINK'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col gap-4">
            <button
                onClick={() => navigate('/register')}
                className="text-zinc-500 hover:text-emerald-500 text-xs font-mono uppercase tracking-widest transition"
            >
                Request New operative status (Register)
            </button>
        </div>

        {isMock && (
            <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg">
                <p className="text-[10px] font-mono text-emerald-500/70 uppercase text-center tracking-tighter">
                    Mock Mode Active: super@test.com
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
