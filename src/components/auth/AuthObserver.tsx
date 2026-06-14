import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';

export function AuthObserver() {
  const { setSession, setProfile, setInitialized, clear } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session) {
            setSession(session);
            await fetchProfile(session.user.id);
          } else {
            clear();
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setInitialized(true);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (session) {
          setSession(session);
          await fetchProfile(session.user.id);
        } else {
          clear();
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setProfile, setInitialized, clear]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as any);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setInitialized(true);
    }
  };

  return null;
}
