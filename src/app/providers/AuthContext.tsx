/**
 * AuthContext — single source of truth for auth state.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types/domain';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  role: UserRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isDropper: boolean;
  isClient: boolean;
  signOut: () => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOtp: (phone: string) => Promise<{ error: Error | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: Error | null; user: User | null }>;
  signUp: (
    email: string,
    password: string,
    role: 'super_admin' | 'admin' | 'client',
    fullName: string
  ) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Failed to fetch profile:', error.message);
        setProfile(null);
        return null;
      }
      setProfile(data as Profile);
      useAuthStore.getState().setProfile(data as Profile);
      return data as Profile;
    } catch (err) {
      console.error('[AuthContext] Unexpected error fetching profile:', err);
      setProfile(null);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (user?.id) return fetchProfile(user.id);
    return null;
  }, [user?.id, fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
      setProfile(null);
      useAuthStore.getState().clear();
      return { error: null };
    } catch (err: any) {
      console.error('[AuthContext] Sign out error:', err.message || err);
      return { error: err as Error };
    }
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          if (data.session.user?.id) {
            await fetchProfile(data.session.user.id);
          }
        }
        return { error: null };
      } catch (err: any) {
        console.error('[AuthContext] Sign in error:', err.message || err);
        return { error: err as Error };
      }
    },
    [fetchProfile]
  );

  const signInWithOtp = useCallback(async (phone: string) => {
    try {
      // FIX: Use custom Edge Function to bypass "unsupported phone provider"
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone, purpose: 'login' }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return { error: null };
    } catch (err: any) {
      console.error('[AuthContext] OTP request error:', err.message || err);
      return { error: err as Error };
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    try {
      // FIX: Use custom Edge Function for verification
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone_number: phone, otp_code: token, purpose: 'login' }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.user?.id) {
        await fetchProfile(data.user.id);
        return { error: null, user: data.user as User };
      }

      return { error: null, user: null };
    } catch (err: any) {
      console.error('[AuthContext] OTP verify error:', err.message || err);
      return { error: err as Error, user: null };
    }
  }, [fetchProfile]);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      role: 'super_admin' | 'admin' | 'client',
      fullName: string
    ) => {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: fullName, role } },
        });
        if (authError) throw authError;

        if (authData?.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            display_name: fullName,
            role,
          });
          if (profileError) {
            console.warn('[AuthContext] Profile insert warning:', profileError.message);
          }
        }
        return { error: null };
      } catch (err: any) {
        console.error('[AuthContext] Sign up error:', err.message || err);
        return { error: err as Error };
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        console.log('[AuthContext] Initial session:', !!initialSession);
        if (!active) return;
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          fetchProfile(initialSession.user.id).then(() => {
            console.log('[AuthContext] Initial profile fetched');
            if (active) setLoading(false);
          });
        } else {
          console.log('[AuthContext] No initial session');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('[AuthContext] Get initial session error:', err);
        if (active) setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!active) return;
        console.log(`[AuthContext] ${event}`);

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          useAuthStore.getState().clear();
        } else if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchProfile(currentSession.user.id);
        }
        setLoading(false);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const derivedRole = (profile?.role ?? null) as UserRole | null;

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      profile,
      loading,
      role: derivedRole,
      isSuperAdmin: derivedRole === 'super_admin',
      isAdmin: derivedRole === 'admin',
      isDropper: derivedRole === 'dropper',
      isClient: derivedRole === 'client',
      signOut,
      signInWithPassword,
      signInWithOtp,
      verifyOtp,
      signUp,
      refreshProfile,
    }),
    [user, session, profile, loading, signOut, signInWithPassword, signInWithOtp, verifyOtp, signUp, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

