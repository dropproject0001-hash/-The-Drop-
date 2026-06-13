// src/hooks/useTTS.ts
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';

const ROLE_PHRASES: Record<string, Record<string, string>> = {
  super_admin: {
    'pending': "New drop request received. Awaiting assignment.",
    'assigned': "Drop assigned to operative. Monitoring initiated.",
    'in_transit': "Drop in transit. Live tracking active.",
    'claimed': "Drop successfully claimed by client. Transaction logged.",
    'completed': "Operation complete. All parties confirmed.",
    'cancelled': "Drop cancelled. Review required.",
    default: "Drop status updated. System notified."
  },
  client: {
    'pending': "Drop is preparing. Stand by for coordinates.",
    'assigned': "Drop assigned. Coordinates incoming.",
    'claimed': "Claim confirmed. Secure the package.",
    'completed': "Operation successful. Thank you operative.",
    default: "Drop update received."
  },
  dropper: {
    'pending': "New assignment pending.",
    'assigned': "New mission assigned. Check coordinates.",
    'in_transit': "Tracking active. Proceed to drop point.",
    'claimed': "Drop retrieval confirmed.",
    'completed': "Mission accomplished.",
    default: "Mission update received."
  }
};

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { profile } = useAuthStore();

  const speak = useCallback(async (text: string, voice: string = 'en-US-EmmaMultilingualNeural') => {
    if (isSpeaking || !text?.trim()) return;
    setIsSpeaking(true);

    try {
      const { data, error } = await supabase.functions.invoke('tts-speak', {
        body: { text, voice },
      });

      if (error) throw error;

      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        await audio.play();
      }
    } catch (err) {
      console.warn('Edge TTS failed, using browser fallback:', err);
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } finally {
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  // Role-aware status announcement
  const announceDropStatus = useCallback((drop: any, oldStatus?: string) => {
    const role = profile?.role || 'client';
    const newStatus = drop.status;

    const phrases = ROLE_PHRASES[role] || ROLE_PHRASES.client;
    const message = phrases[newStatus] || phrases.default || `Drop status changed to ${newStatus}.`;

    speak(message);
  }, [profile, speak]);

  return { speak, announceDropStatus, isSpeaking };
}
