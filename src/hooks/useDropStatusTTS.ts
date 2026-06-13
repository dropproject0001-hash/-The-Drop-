// src/hooks/useDropStatusTTS.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTTS } from './useTTS';
import { useAuthStore } from '@/stores';

export function useDropStatusTTS() {
  const { announceDropStatus } = useTTS();
  const { profile } = useAuthStore();

  useEffect(() => {
    if (!profile?.id) return;

    console.log('🔊 [useDropStatusTTS] Initializing realtime subscription for status announcements...');

    // Subscribe to all drops relevant to the user
    const channel = supabase
      .channel('drop-status-tts')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drops',
          // Filter if not super_admin (super_admin monitors everything)
          filter: profile.role === 'super_admin'
            ? undefined
            : (profile.role === 'dropper' ? `assigned_to=eq.${profile.id}` : `assigned_to=eq.${profile.id}`),
        },
        (payload) => {
          const newDrop = payload.new;
          const oldDrop = payload.old;

          if (newDrop.status !== oldDrop?.status) {
            console.log(`🔊 [useDropStatusTTS] Drop ${newDrop.id} status transition: ${oldDrop?.status} -> ${newDrop.status}`);
            announceDropStatus(newDrop, oldDrop?.status);
          }
        }
      )
      .subscribe((status) => {
        console.log(`🔊 [useDropStatusTTS] Subscription status: ${status}`);
      });

    return () => {
      console.log('🔊 [useDropStatusTTS] Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, [profile, announceDropStatus]);
}
