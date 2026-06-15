// src/components/voice/VoiceAssistantPanel.tsx
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Zap, Settings, AlertTriangle, AlertCircle, Info, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceAssistant, VoiceError } from '@/hooks/useVoiceAssistant';
import { useOfflineVoice } from '@/hooks/useOfflineVoice';
import { useToast } from '@/components/ui/ToastContainer';
import { useAuthStore } from '@/stores';

export default function VoiceAssistantPanel({ 
  isOpen, 
  onClose, 
  isMinimized = false 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  isMinimized?: boolean;
}) {
  const { profile } = useAuthStore();
  const { 
    startListening, 
    stopListening, 
    speak, 
    isListening, 
    isSpeaking, 
    isOnline 
  } = useVoiceAssistant();

  const { playJarvisSound, preferredLang, toggleLanguage } = useOfflineVoice();
  const { showToast } = useToast();

  const [hasGreeted, setHasGreeted] = useState(false);
  const [lastError, setLastError] = useState<VoiceError | null>(null);

  // ====================== ROLE-BASED AUTO GREETING ======================
  useEffect(() => {
    if (!profile?.role || !isOpen || hasGreeted) return;

    playJarvisSound('boot');
    setTimeout(() => playJarvisSound('activate'), 750);

    const roleGreetings: Record<string, string> = {
      super_admin: "Good day, Boss. All systems operational. Keep safe and stay lowkey.",
      admin: "Welcome back, Admin. Ready for deployment.",
      dropper: "Field operative online. Ride safe and always focus on the accurate product pin point gps coordinates.",
      client: "Client access granted. Stay safe stay anonymous. Personal information is not allowed in this system."
    };

    const greeting = roleGreetings[profile.role] || `Welcome, ${profile.role}. Systems online.`;

    setTimeout(() => {
      speak(greeting, { lang: preferredLang });
      setHasGreeted(true);
    }, 1600);
  }, [profile?.role, isOpen, speak, playJarvisSound, hasGreeted, preferredLang]);

  useEffect(() => {
    if (!isOpen) {
      setHasGreeted(false);
      setLastError(null);
    }
  }, [isOpen]);

  // ====================== ROLE + ERROR TYPE VISUAL FEEDBACK ======================
  const getErrorConfig = (error: VoiceError) => {
    switch (error.type) {
      case 'permission':
        return {
          icon: AlertCircle,
          color: 'amber',
          bg: 'bg-amber-500/10 border-amber-500/40',
          text: 'text-amber-300'
        };
      case 'offline':
        return {
          icon: Info,
          color: 'emerald',
          bg: 'bg-emerald-500/10 border-emerald-500/40',
          text: 'text-emerald-300'
        };
      case 'recognition':
        return {
          icon: AlertTriangle,
          color: 'orange',
          bg: 'bg-orange-500/10 border-orange-500/40',
          text: 'text-orange-300'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'red',
          bg: 'bg-red-500/10 border-red-500/40',
          text: 'text-red-300'
        };
    }
  };

  const handleError = (error: VoiceError) => {
    setLastError(error);

    const config = getErrorConfig(error);
    let displayMessage = error.message;

    if (profile?.role === 'super_admin' || profile?.role === 'admin') {
      displayMessage = `[DIRECTOR] ${error.message}`;
    } else if (profile?.role === 'dropper' && error.type === 'offline') {
      displayMessage = "Offline mode active. Locations will sync when signal returns.";
    } else if (profile?.role === 'client') {
      displayMessage = "Secure voice channel issue. Please use manual input if needed.";
    }

    showToast(displayMessage, { 
      type: error.type === 'offline' || error.type === 'permission' ? 'warning' : 'error' 
    });

    playJarvisSound('error');
    speak(displayMessage);
  };

  const handleStartListening = () => {
    setLastError(null);
    const error = startListening();
    if (error) handleError(error);
  };

  const quickCommands = [
    { label: 'Start Tracking', action: () => speak("Live tracking activated.") },
    { label: 'Stop Tracking', action: () => speak("Live tracking paused.") },
    { label: 'Claim Drop', action: () => speak("Drop successfully claimed.") },
    { label: 'Check Status', action: () => speak("All systems operational.") },
    { label: 'Proximity Alert', action: () => speak("Proximity alert. Target nearby.") },
  ];

  const errorConfig = lastError ? getErrorConfig(lastError) : null;
  const ErrorIcon = errorConfig?.icon || AlertTriangle;

  // ====================== MINIMIZED FLOATING ORB ======================
  if (isMinimized && !isOpen) {
    return (
      <button
        onClick={onClose}
        className="fixed bottom-6 right-6 z-[200] w-16 h-16 rounded-full bg-black border-4 border-[#0ad111] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 group"
        title="Open JARVIS Voice Assistant"
      >
        <div className="relative">
          <Zap className="w-8 h-8 text-[#0ad111] group-hover:animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
        </div>
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-zinc-950 border border-[#0ad111]/60 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#0ad111]/30 px-6 py-4 bg-black/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0ad111]/10 flex items-center justify-center ring-1 ring-[#0ad111]/30">
              <Volume2 className="w-5 h-5 text-[#0ad111]" />
            </div>
            <div>
              <h2 className="font-mono text-xl tracking-[3px] text-[#0ad111]">JARVIS</h2>
              <p className="text-[10px] text-emerald-500/70">TACTICAL VOICE OPS</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-2 py-1 rounded border text-[10px] ${isOnline ? 'border-emerald-500/50 text-emerald-400' : 'border-amber-500/50 text-amber-500'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
            <button
              onClick={() => {
                const lang = toggleLanguage();
                showToast(`Voice set to ${lang === 'tl-PH' ? 'Tagalog' : 'English'}`, { type: 'success' });
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-[#0ad111]/40 rounded-full text-[10px] font-mono hover:bg-zinc-800 transition"
            >
              <Globe className="w-3 h-3" />
              {preferredLang === 'tl-PH' ? '🇵🇭 TL' : '🇬🇧 EN'}
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Animated Error Banner */}
        <AnimatePresence>
          {lastError && errorConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`mx-6 mt-4 px-4 py-4 ${errorConfig.bg} border rounded-2xl flex gap-3 overflow-hidden`}
            >
              <motion.div
                initial={{ scale: 0.6, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1 }}
              >
                <ErrorIcon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${errorConfig.text}`} />
              </motion.div>
              
              <div className="flex-1">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`text-sm ${errorConfig.text}`}
                >
                  {lastError.message}
                </motion.p>
                
                {lastError.type === 'permission' && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs mt-2 opacity-75"
                  >
                    Go to browser settings → Site permissions → Allow microphone
                  </motion.p>
                )}
                
                {lastError.type === 'offline' && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs mt-2 opacity-75"
                  >
                    Voice commands limited. Quick buttons still available.
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Controls */}
        <div className="p-6 space-y-6">
          <button
            onClick={isListening ? stopListening : handleStartListening}
            disabled={isSpeaking}
            className={`w-full h-28 rounded-3xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${
              isListening 
                ? 'bg-red-500/10 border-red-500 animate-pulse' 
                : 'bg-[#0ad111]/10 border-[#0ad111] hover:bg-[#0ad111]/20'
            }`}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 text-red-500" />
            ) : isSpeaking ? (
              <Volume2 className="w-12 h-12 text-[#0ad111] animate-pulse" />
            ) : (
              <Mic className="w-12 h-12 text-[#0ad111]" />
            )}
            <span className="font-mono text-sm tracking-widest">
              {isListening ? "LISTENING — SPEAK NOW" : isSpeaking ? "SPEAKING..." : "PUSH TO TALK"}
            </span>
          </button>

          {/* Quick Commands */}
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">QUICK COMMANDS</div>
            <div className="grid grid-cols-2 gap-3">
              {quickCommands.map((cmd, index) => (
                <button
                  key={index}
                  onClick={cmd.action}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-left hover:border-[#0ad111]/50 transition"
                >
                  <div className="text-xl mb-2">🎯</div>
                  <div className="text-sm font-medium">{cmd.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
