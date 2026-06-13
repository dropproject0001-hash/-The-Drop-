// src/hooks/useTTS.ts
import { useState, useCallback, useRef, useEffect } from 'react';
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

interface QueueItem {
  text: string;
  voice: string;
  resolve: () => void;
}

const speechQueue: QueueItem[] = [];
let queueSpeaking = false;
const listeners = new Set<(speaking: boolean) => void>();

function notifyListeners(speaking: boolean) {
  listeners.forEach((listener) => listener(speaking));
}

function speakOnDevice(text: string): Promise<void> {
  return new Promise((resolve) => {
    // Stop any current speech to prevent queue overlapping
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

async function processQueue() {
  if (queueSpeaking || speechQueue.length === 0) return;
  queueSpeaking = true;
  notifyListeners(true);

  const item = speechQueue[0];
  try {
    const isLowData = localStorage.getItem('drop_low_data_mode') === 'true';
    if (isLowData) {
      console.log('🎙️ [TTS Log] Low Data Mode active: using on-device speech synthesis');
      await speakOnDevice(item.text);
    } else {
      try {
        const { data, error } = await supabase.functions.invoke('tts-speak', {
          body: { text: item.text, voice: item.voice },
        });

        if (error) throw error;

        if (data?.audioUrl) {
          const audio = new Audio(data.audioUrl);
          await new Promise<void>((resolve, reject) => {
            audio.onended = () => resolve();
            audio.onerror = (e) => reject(e);
            audio.play().catch(reject);
          });
        } else {
          await speakOnDevice(item.text);
        }
      } catch (err) {
        console.warn('Edge TTS failed, using browser fallback:', err);
        await speakOnDevice(item.text);
      }
    }
  } catch (err) {
    console.error('[TTS Global Handler] Playback error:', err);
  } finally {
    item.resolve();
    speechQueue.shift();
    queueSpeaking = false;
    notifyListeners(speechQueue.length > 0);
    // Process next item with a tiny breather delay
    setTimeout(processQueue, 150);
  }
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(queueSpeaking);
  const { profile } = useAuthStore();

  useEffect(() => {
    const handleSpeakingChange = (speaking: boolean) => {
      setIsSpeaking(speaking);
    };
    listeners.add(handleSpeakingChange);
    setIsSpeaking(queueSpeaking);
    return () => {
      listeners.delete(handleSpeakingChange);
    };
  }, []);

  const speak = useCallback((text: string, voice: string = 'en-US-EmmaMultilingualNeural', force = false) => {
    return new Promise<void>((resolve) => {
      const isVoiceEnabled = localStorage.getItem('setting_voice_notes') !== 'false';
      if ((!isVoiceEnabled && !force) || !text?.trim()) {
        resolve();
        return;
      }

      speechQueue.push({ text, voice, resolve });
      processQueue();
    });
  }, []);

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
