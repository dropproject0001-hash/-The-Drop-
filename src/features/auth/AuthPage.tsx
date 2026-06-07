import { useState, FormEvent } from 'react';
import { Shield, User, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { ClientRegistration } from './ClientRegistration';

export function AuthPage() {
  const [mode, setMode] = useState<'client' | 'staff'>('client');
  const [staffAction, setStaffAction] = useState<'login' | 'signup'>('login');
  
  // Login Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up Fields
  const [displayName, setDisplayName] = useState('');
  const [registerRole, setRegisterRole] = useState<'super_admin' | 'admin'>('super_admin');
  
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
        role: isSuper ? 'super_admin' : 'admin',
        display_name: isSuper ? 'Super Admin (Mock)' : 'Admin Dropper (Mock)',
        avatar_url: null,
        is_online: true,
        last_seen: new Date().toISOString(),
        push_endpoint: null,
        push_keys: null,
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

  const handleStaffSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const envMeta = (import.meta as any).env || {};
    const isMock = (supabase as any).supabaseUrl?.includes('mock') || envMeta.VITE_SUPABASE_URL?.includes('mock');

    if (isMock) {
      const mockUserId = 'mock-' + Math.random().toString(36).substr(2, 9);
      useAuthStore.getState().setSession({ user: { id: mockUserId }, access_token: 'mock', refresh_token: 'mock' });
      useAuthStore.getState().setProfile({
        id: mockUserId,
        role: registerRole,
        display_name: displayName || (registerRole === 'super_admin' ? 'Super Admin' : 'Admin'),
        avatar_url: null,
        is_online: true,
        last_seen: new Date().toISOString(),
        push_endpoint: null,
        push_keys: null,
        created_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    try {
      // 1. Sign up the user in Supabase Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from sign up');

      // 2. Create the profile row with the selected role (super_admin / admin)
      const { error: profileError } = await (supabase as any).from('profiles').insert({
        id: authData.user.id,
        role: registerRole,
        display_name: displayName,
        is_online: true,
        last_seen: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // 3. Retrieve and establish the user session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        useAuthStore.getState().setSession(session);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profileData) {
          useAuthStore.getState().setProfile(profileData as any);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
        display_name: 'Client User (Mock)',
        avatar_url: null,
        is_online: true,
        last_seen: new Date().toISOString(),
        push_endpoint: null,
        push_keys: null,
        created_at: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">DropPin Ops</h1>
          <p className="text-slate-400">Secure Location Tracking & Deployment</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-900 rounded-xl p-1 mb-8">
          <button
            onClick={() => setMode('client')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg text-sm font-medium transition ${
              mode === 'client' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <User size={18} /> Client Area
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
            <Shield size={18} /> Staff Portal
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
                {staffAction === 'login' ? 'Staff Login' : 'Staff Registration'}
              </h2>
              <button
                onClick={() => {
                  setStaffAction(staffAction === 'login' ? 'signup' : 'login');
                  setError('');
                }}
                className="text-xs text-primary hover:underline"
              >
                {staffAction === 'login' ? 'Create Account' : 'Back to Login'}
              </button>
            </div>

            {staffAction === 'login' ? (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
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
                     Mock Mode Active: Enter "super@test.com" for Super Admin, or click "Create Account" above to register custom roles.
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
            ) : (
              <form onSubmit={handleStaffSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Lead Agent"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@droppin.ops"
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
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Role Type</label>
                  <select
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value as any)}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-white text-sm"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500">{error}</div>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium transition disabled:opacity-50 text-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus size={16} />
                    {loading ? 'Creating Account...' : `Register as ${registerRole === 'super_admin' ? 'Super Admin' : 'Admin'}`}
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
