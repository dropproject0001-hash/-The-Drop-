// src/hooks/useVoiceAssistant.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { useOfflineVoice } from './useOfflineVoice';
import { useToast } from '@/components/ui/ToastContainer';

export type VoiceErrorType = 'recognition' | 'speech' | 'permission' | 'offline' | 'unknown';

export interface VoiceError {
  type: VoiceErrorType;
  message: string;
  roleSpecificMessage?: string;
}

export function useVoiceAssistant() {
  const { speak, playJarvisSound } = useOfflineVoice();
  const { showToast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const createError = (type: VoiceErrorType, defaultMessage: string): VoiceError => {
    return {
      type,
      message: defaultMessage,
    };
  };

  const startListening = useCallback(() => {
  const SpeechRecognitionAPI = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      const error = createError('recognition', "Voice recognition not supported on this device");
      showToast(error.message, { type: 'error' });
      return error;
    }

    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      playJarvisSound('listen');
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      showToast(`Heard: "${transcript}"`, { type: 'info' });

      // Local offline command handling
      if (transcript.includes("start tracking") || transcript.includes("track")) {
        speak("Live tracking activated.");
      } else if (transcript.includes("stop tracking") || transcript.includes("pause")) {
        speak("Live tracking paused.");
      } else if (transcript.includes("claim") || transcript.includes("looted")) {
        speak("Drop successfully claimed and logged.");
      } else if (transcript.includes("status") || transcript.includes("report")) {
        speak("All systems operational.");
      } else if (transcript.includes("hello") || transcript.includes("jarvis")) {
        speak("Hello. JARVIS at your service.");
      } else {
        speak("Command received.");
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      let errorType: VoiceErrorType = 'unknown';
      let message = "Voice recognition error";

      if (event.error === 'no-speech') {
        errorType = 'recognition';
        message = "No speech detected. Please try again.";
      } else if (event.error === 'audio-capture') {
        errorType = 'permission';
        message = "Microphone access denied. Please allow microphone permission.";
      } else if (event.error === 'network') {
        errorType = 'offline';
        message = "Network error. Voice recognition may be limited offline.";
      }

      const error = createError(errorType, message);
      showToast(error.message, { type: 'error' });
      setIsListening(false);
      
      // Return error so panel can handle role-specific logic
      return error;
    };

    recognitionRef.current.onend = () => setIsListening(false);

    try {
      recognitionRef.current.start();
      return null; // No error
    } catch (err) {
      const error = createError('unknown', "Failed to start voice recognition");
      showToast(error.message, { type: 'error' });
      return error;
    }
  }, [speak, playJarvisSound, showToast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const speakCommand = useCallback((text: string, options?: { rate?: number; pitch?: number; lang?: 'en-US' | 'tl-PH' }) => {
    playJarvisSound('speak');
    setIsSpeaking(true);
    speak(text, options);
    
    // Auto reset speaking state based on character length duration
    const speakingDurationMs = (text.length * 65) + 600;
    const timer = setTimeout(() => {
      setIsSpeaking(false);
    }, Math.min(Math.max(speakingDurationMs, 1200), 8000));

    return () => clearTimeout(timer);
  }, [speak, playJarvisSound]);

  return {
    startListening,
    stopListening,
    speak: speakCommand,
    isListening,
    isSpeaking,
    isOnline,
  };
}
