import { useCallback, useEffect, useState } from 'react';

export const COMMON_PHRASES = {
  trackingStarted: "Live tracking activated. Transmitting position every 8 seconds.",
  trackingStopped: "Live tracking paused.",
  dropClaimed: "Drop successfully claimed and logged.",
  statusActive: "Drop is active and assigned to you.",
  statusExpired: "This drop has expired.",
  navigation: "Proceeding to target. Distance approximately X kilometers.",
  proximity: "Proximity alert. Target is within 200 meters.",
  offlineMode: "Operating in offline mode. Locations will sync when connection returns.",
} as const;

export function useOfflineVoice() {
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [preferredLang, setPreferredLang] = useState<'en-US' | 'tl-PH'>('en-US');

  useEffect(() => {
    const loadVoices = () => setVoicesLoaded(true);
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speakOffline = useCallback((
    text: string | keyof typeof COMMON_PHRASES, 
    options: {
      rate?: number;
      pitch?: number;
      lang?: 'en-US' | 'tl-PH';
    } = {}
  ) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech Synthesis not supported on this device");
      return false;
    }

    const lang = options.lang || preferredLang;
    const utteranceText = typeof text === 'string' ? text : (COMMON_PHRASES[text] || text);
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.rate = options.rate ?? 0.92;
    utterance.pitch = options.pitch ?? 1.05;
    utterance.volume = 1;
    utterance.lang = lang;

    // Try to find best matching voice
    const voices = speechSynthesis.getVoices();
    const bestVoice = voices.find(v => v.lang.toLowerCase().includes(lang.toLowerCase())) ||
                     voices.find(v => v.lang.includes(lang === 'tl-PH' ? 'tl' : 'en')) ||
                     voices[0];

    if (bestVoice) utterance.voice = bestVoice;

    speechSynthesis.speak(utterance);
    return true;
  }, [preferredLang]);

  const speak = useCallback((text: string, options: { rate?: number; pitch?: number; lang?: 'en-US' | 'tl-PH' } = {}) => {
    return speakOffline(text, options);
  }, [speakOffline]);

  const toggleLanguage = useCallback(() => {
    const newLang = preferredLang === 'en-US' ? 'tl-PH' : 'en-US';
    setPreferredLang(newLang);
    return newLang;
  }, [preferredLang]);

  // Realistic JARVIS Sound Effects (Pure Web Audio - Zero Cost)
  const playJarvisSound = useCallback((type: 'boot' | 'activate' | 'listen' | 'speak' | 'success' | 'error') => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioContext = new AudioCtx();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      osc.type = type === 'boot' ? 'sawtooth' : 'sine';
      filter.type = 'lowpass';
      filter.frequency.value = type === 'boot' ? 900 : 1200;

      switch (type) {
        case 'boot':
          osc.frequency.setValueAtTime(140, audioContext.currentTime);
          osc.frequency.linearRampToValueAtTime(520, audioContext.currentTime + 1.6);
          gain.gain.value = 0.35;
          break;
        case 'activate':
          osc.frequency.value = 920;
          gain.gain.value = 0.28;
          break;
        case 'listen':
          osc.frequency.value = 680;
          gain.gain.value = 0.18;
          break;
        case 'speak':
          osc.frequency.value = 980;
          gain.gain.value = 0.22;
          break;
        case 'success':
          osc.frequency.value = 1250;
          gain.gain.value = 0.4;
          break;
        case 'error':
          osc.frequency.value = 240;
          gain.gain.value = 0.45;
          filter.frequency.value = 500;
          break;
      }

      const duration = type === 'boot' ? 1.6 : 0.22;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      gain.gain.linearRampToValueAtTime(0.001, audioContext.currentTime + duration);
      osc.stop(audioContext.currentTime + duration);

      setTimeout(() => {
        audioContext.close().catch(() => {});
      }, (duration * 1000) + 100);

    } catch (e) {
      console.warn("Web Audio sound blocked or failed:", e);
    }
  }, []);

  const speakCached = useCallback((key: keyof typeof COMMON_PHRASES) => {
    return speakOffline(key);
  }, [speakOffline]);

  return { speakOffline, speak, speakCached, playJarvisSound, voicesLoaded, COMMON_PHRASES, preferredLang, toggleLanguage };
}
