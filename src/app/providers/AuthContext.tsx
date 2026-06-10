import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/domain';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isClient: boolean;
  signOut: () => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role: 'super_admin' | 'admin' | 'client', fullName: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the user's profile from the database
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Failed to fetch profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('[AuthContext] Unexpected error fetching profile:', err);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem('demo_role');
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setSession(null);
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (err: any) {
      console.error('[AuthContext] Sign out error:', err.message || err);
      return { error: err as Error };
    }
  }, []);

  // Sign in with email and password
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
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
  }, [fetchProfile]);

  // Sign up with registration flow
  const signUp = useCallback(async (
    email: string,
    password: string,
    role: 'super_admin' | 'admin' | 'client',
    fullName: string
  ) => {
    try {
      // Create user authentication record
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      const signUpUser = authData?.user;
      if (signUpUser) {
        // Create corresponding public profile record if it wasn't auto-created by a database trigger
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signUpUser.id,
            email,
            full_name: fullName,
            role,
          });

        if (profileError) {
          console.warn('[AuthContext] Profile record insertion error:', profileError.message);
        }
      }

      return { error: null };
    } catch (err: any) {
      console.error('[AuthContext] Sign up error:', err.message || err);
      return { error: err as Error };
    }
  }, []);

  // Set up auth state change listeners
  useEffect(() => {
    let active = true;

    // Get current initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
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
    }).catch((err) => {
      console.error('[AuthContext] Get initial session error:', err);
      if (active) setLoading(false);
    });

    // Listen for auth state revisions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!active) return;
        console.log(`🌐 [AuthContext] Auth state change event: ${event}`);

        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('demo_role');
        }

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchProfile(currentSession.user.id);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const value = useMemo(() => {
    return {
      user,
      session,
      profile,
      loading,
      isSuperAdmin: profile?.role === 'super_admin',
      isAdmin: profile?.role === 'admin',
      isClient: profile?.role === 'client',
      signOut,
      signInWithPassword,
      signUp,
      refreshProfile,
    };
  }, [user, session, profile, loading, signOut, signInWithPassword, signUp, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
