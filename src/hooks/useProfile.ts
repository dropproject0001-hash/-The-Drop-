/**
 * @file src/hooks/useProfile.ts
 *
 * FIX C-3: isClient now correctly checks for role === 'client' (not 'tanod').
 * FIX C-4: Profile is kept in sync via supabase.auth.onAuthStateChange so it
 *           updates on sign-in and is cleared on sign-out.
 * FIX M-6: Ambiguous comment removed; role check is now definitive.
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/domain';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[useProfile] Failed to fetch profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('[useProfile] Unexpected error:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // FIX C-4: Subscribe to auth state changes so the profile is always fresh.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setLoading(true);
          await fetchProfile(session.user.id);
        } else {
          // Signed out or no session
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Also attempt an immediate fetch for the initial render.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return {
    profile,
    loading,
    // FIX C-3: role values now match DB enum ('super_admin' | 'admin' | 'client')
    isSuperAdmin: profile?.role === 'super_admin',
    isAdmin: profile?.role === 'admin',
    // FIX C-3, M-6: 'client' is the correct role name from the DB
    isClient: profile?.role === 'client',
  };
}
