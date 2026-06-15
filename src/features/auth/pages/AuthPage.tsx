import { useState, FormEvent } from 'react';
import { Shield, User, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { ClientRegistration } from './ClientRegistration';

export function AuthPage() {
  const [mode, setMode] = useState<'client' | 'staff'>('client');
  const [staffAction, setStaffAction] = useState<'login' | 'signup'>('login');
  
  // Login Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStaffLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Developer bypass for UI preview if strictly using mock mode
    const envMeta = (import.meta as any).env || {};
    if ((supabase as any).supabaseUrl?.includes('mock') || envMeta.VITE_SUPABASE_URL?.includes('mock')) {
      const isSuper = email.toLowerCase().includes('super');
      useAuthStore.getState().setSession({ user: { id: 'mock-id' }, access_token: 'mock', refresh_token: 'mock' });
      useAuthStore.getState().setProfile({
        id: 'mock-id',
        role: isSuper ? 'super_admin' : 'dropper',
        alias: null,
        username: null,
        phone: null,
        phone_verified: null,
        created_by: null,
        display_name: isSuper ? 'Super Admin (Mock)' : 'Dropper (Mock)',
        avatar_url: null,
        is_online: true,
        last_seen: new Date().toISOString(),
        push_endpoint: null,
        push_keys: null, tracking_locked: false,
        created_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // App.tsx auth observer will handle fetching profile and setting state
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Developer bypass for testing client
  const mockClientLogin = () => {
    useAuthStore.getState().setSession({ user: { id: 'mock-client' }, access_token: 'mock', refresh_token: 'mock' });
    useAuthStore.getState().setProfile({
        id: 'mock-client',
        role: 'client',
        alias: null,
        username: null,
        phone: null,
        phone_verified: null,
        created_by: null,
        display_name: 'Client User (Mock)',
        avatar_url: null,
        is_online: true,
        last_seen: new Date().toISOString(),
        push_endpoint: null,
        push_keys: null, tracking_locked: false,
        created_at: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">The Drop 👽</h1>
          <p className="text-amber-500 font-mono text-xs mt-2 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(245,158,11,0.55)] animate-pulse">
            Warning: Do Not Use Personal Identity ⚠️
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-900 rounded-xl p-1 mb-8">
          <button
            onClick={() => setMode('client')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg text-sm font-medium transition ${
              mode === 'client' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <User size={18} /> Client Admission
          </button>
          <button
            onClick={() => {
              setMode('staff');
              setError('');
            }}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg text-sm font-medium transition ${
              mode === 'staff' ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Shield size={18} /> Dropper/Boss Logins☢️
          </button>
        </div>

        {/* Content */}
        {mode === 'client' ? (
          <div className="space-y-4">
            <ClientRegistration />
            {((supabase as any).supabaseUrl?.includes('mock') || ((import.meta as any).env || {}).VITE_SUPABASE_URL?.includes('mock')) && (
               <button onClick={mockClientLogin} className="w-full text-center text-sm text-slate-500 hover:text-slate-400 mt-4 underline">
                 Wait, I just want to bypass as a test Client
               </button>
             )}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield size={20} className="text-primary" /> 
                Dropper & Boss Logins
              </h2>
            </div>

            {staffAction === 'login' && (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email / Username</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@droppin.ops"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-white text-sm"
                    required
                  />
                </div>
                
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500">{error}</div>}
                {((supabase as any).supabaseUrl?.includes('mock') || ((import.meta as any).env || {}).VITE_SUPABASE_URL?.includes('mock')) && (
                   <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-500">
                     Mock Mode Active: Enter "super@test.com" for Super Admin. Dropper accounts must be created by Super Admin.
                   </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium transition disabled:opacity-50 text-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                     <LogIn size={16} />
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </span>
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
