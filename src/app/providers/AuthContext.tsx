/**
 * AuthContext — single source of truth for auth state.
 *
 * FIX N-4 (partial): Dual-subscription root cause lives here.
 * RoleContext now derives from this context instead of running its own
 * onAuthStateChange + profile fetch, eliminating duplicate DB round-trips
 * and the race that caused inconsistent role/profile state.
 *
 * FIX Bug-4: fetchProfile and refreshProfile now return the Profile object
 * so callers who need the freshly fetched role can use the return value
 * rather than reading from (potentially stale) React state.
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
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types/domain';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  // Convenience role flags
  role: UserRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isDropper: boolean;       // FIX: was missing from AuthContext
  isClient: boolean;
  // Auth actions
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
  // FIX Bug-4: returns the freshly fetched Profile (not void)
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // FIX Bug-4: returns the fetched Profile so callers get the fresh value
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
      return data as Profile;
    } catch (err) {
      console.error('[AuthContext] Unexpected error fetching profile:', err);
      setProfile(null);
      return null;
    }
  }, []);

  // FIX Bug-4: now returns Profile | null instead of void
  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (user?.id) return fetchProfile(user.id);
    return null;
  }, [user?.id, fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem('demo_role');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
      setProfile(null);
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
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      console.error('[AuthContext] OTP request error:', err.message || err);
      return { error: err as Error };
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) throw error;
      // Session is set via onAuthStateChange; also fetch profile immediately
      if (data?.user?.id) {
        await fetchProfile(data.user.id);
      }
      return { error: null, user: data?.user ?? null };
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
          options: { data: { full_name: fullName, role } },
        });
        if (authError) throw authError;

        if (authData?.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            email,
            full_name: fullName,
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

  // Single auth subscription — only one in the whole app
  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!active) return;
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          fetchProfile(initialSession.user.id).then(() => {
            if (active) setLoading(false);
          });
        } else {
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
          localStorage.removeItem('demo_role');
          setSession(null);
          setUser(null);
          setProfile(null);
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
      isDropper: derivedRole === 'dropper',   // FIX: was missing
      isClient: derivedRole === 'client',
      signOut,
      signInWithPassword,
      signInWithOtp,
      verifyOtp,
      signUp,
      refreshProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
