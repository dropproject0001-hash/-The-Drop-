import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Trash2, Terminal, Shield, Sparkles, Cpu, Play, Square } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';

interface TranscriptMessage {
  id: string;
  role: 'operator' | 'overlord';
  text: string;
  timestamp: string;
}

export function TacticalAIVoiceCompanion() {
  const { speak, isSpeaking } = useTTS();
  const [messages, setMessages] = useState<TranscriptMessage[]>(() => {
    const saved = localStorage.getItem('drop_tactical_copilot_history');
    return saved ? JSON.parse(saved) : [
      {
        id: 'init',
        role: 'overlord',
        text: "Overlord Tactical AI online. Satellite telemetry verified. Ready to receive commands, Operator.",
        timestamp: new Date().toLocaleTimeString()
      }
    ];
  });
  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [intermSpeech, setIntermSpeech] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem('tactical_voice_choice') || 'en-US-EmmaMultilingualNeural';
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Persistence of transcripts
  useEffect(() => {
    localStorage.setItem('drop_tactical_copilot_history', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setIntermSpeech('');
      };

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setIntermSpeech(interim);
        if (final) {
          setInputVal(final);
        }
      };

      rec.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser. Please use keyboard terminal entry.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputVal('');
      setIntermSpeech('');
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    setInputVal('');
    setIntermSpeech('');
    
    // Create operator message
    const operatorMsg: TranscriptMessage = {
      id: `op-${Date.now()}`,
      role: 'operator',
      text: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, operatorMsg]);
    setIsPending(true);

    try {
      // Map current messages for Gemini history
      const historyPayload = messages.slice(-8).map(msg => ({
        role: msg.role === 'operator' ? 'user' : 'assistant',
        text: msg.text
      }));

      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`Satellite response error: ${res.status}`);
      }

      const data = await res.json();
      const aiReply = data.response || "Secure comms packet confirmed. Silent status.";

      const overlordMsg: TranscriptMessage = {
        id: `ov-${Date.now()}`,
        role: 'overlord',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, overlordMsg]);
      setIsPending(false);

      // Force play through useTTS speaker queue
      await speak(aiReply, selectedVoice, true);

    } catch (err: any) {
      console.error("[Copilot Interaction] Error in transponding command:", err);
      const errorMsg: TranscriptMessage = {
        id: `ov-err-${Date.now()}`,
        role: 'overlord',
        text: `🚩 COMM TRANSMISSION FAILURE. Satellite packet lost. Telemetry backup recommended. (${err.message || 'Server offline'})`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsPending(false);
    }
  }, [inputVal, messages, selectedVoice, speak]);

  const triggerPresetCommand = (commandText: string) => {
    handleSendMessage(commandText);
  };

  const clearLog = () => {
    setMessages([
      {
        id: 'init',
        role: 'overlord',
        text: "Log wiped. Satellite channels secured. Standing by.",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const voices = [
    { code: 'en-US-EmmaMultilingualNeural', name: 'Emma (Default)' },
    { code: 'en-US-BrianNeural', name: 'Brian (Tactical Tactical)' },
    { code: 'en-US-MichelleNeural', name: 'Michelle (Standard Operator)' },
    { code: 'en-GB-SoniaNeural', name: 'Sonia (Global Command)' }
  ];

  return (
    <div className="bg-black/85 border border-[#106011] rounded-lg shadow-[0_0_15px_rgba(16,96,17,0.15)] backdrop-blur-md overflow-hidden font-mono flex flex-col h-full max-h-[640px]">
      
      {/* Title Bar */}
      <div className="bg-[#106011]/20 border-b border-[#106011]/40 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#0ad111] animate-pulse" />
          <div className="flex flex-col">
            <span className="text-white text-xs font-bold font-display uppercase tracking-wider">Tactical AI Overlord</span>
            <span className="text-[9px] text-[#0ad111] uppercase tracking-widest opacity-80">Telemetry Companion V1.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] px-1.5 py-0.5 rounded border ${isSpeaking ? 'bg-red-950/40 text-red-400 border-red-800 animate-pulse' : isListening ? 'bg-amber-950/40 text-amber-500 border-amber-800 animate-pulse' : 'bg-green-950/40 text-[#0ad111] border-[#106011]/60'}`}>
            {isSpeaking ? '🔊 BROADCASTING' : isListening ? '🎙️ LISTENING' : '● ONLINE'}
          </span>
          <button 
            onClick={clearLog}
            className="p-1 hover:bg-[#106011]/30 text-slate-400 hover:text-red-400 transition-colors rounded"
            title="Wipe Telemetry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Voice Config Line */}
      <div className="bg-black border-b border-[#106011]/20 px-3 py-1 flex items-center justify-between text-[10px]">
        <span className="text-slate-400">Tactical Synth Output:</span>
        <select 
          value={selectedVoice} 
          onChange={(e) => {
            setSelectedVoice(e.target.value);
            localStorage.setItem('tactical_voice_choice', e.target.value);
          }}
          className="bg-black text-[#0ad111] border border-[#106011]/30 rounded px-1 max-w-[150px] outline-none text-[10px] py-0.5"
        >
          {voices.map(v => (
            <option key={v.code} value={v.code}>{v.name}</option>
          ))}
        </select>
      </div>

      {/* Transcripts Window */}
      <div 
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-[300px] bg-gradient-to-b from-black to-black/95 custom-scrollbar"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`border ${msg.role === 'operator' ? 'border-slate-800 bg-slate-900/10' : 'border-[#106011]/35 bg-[#106011]/5'} p-2 rounded`}
          >
            <div className="flex justify-between items-center text-[9px] mb-1">
              <span className={`font-bold uppercase tracking-wider ${msg.role === 'operator' ? 'text-slate-400' : 'text-[#0ad111] flex items-center gap-1'}`}>
                {msg.role === 'operator' ? '👤 Operative' : '🛰️ Overlord Agent'}
              </span>
              <span className="text-slate-500 text-[8px]">{msg.timestamp}</span>
            </div>
            <p className={`text-xs select-text leading-relaxed font-sans ${msg.role === 'operator' ? 'text-slate-200' : 'text-[#0ad111]'}`}>
              {msg.text}
            </p>
          </div>
        ))}

        {isListening && intermSpeech && (
          <div className="border border-amber-900/30 bg-amber-950/5 p-2 rounded">
            <span className="text-[9px] text-amber-500 uppercase tracking-widest font-bold">🎙️ Realtime Audio Feed...</span>
            <p className="text-xs text-amber-400 italic leading-relaxed font-sans mt-1">
              "{intermSpeech}"
            </p>
          </div>
        )}

        {isPending && (
          <div className="flex items-center gap-2 p-1 text-[#0ad111] animate-pulse">
            <span className="text-[10px] uppercase font-bold tracking-widest">TRANSPONDING ENCRYPTED SATELLITE PACKET...</span>
          </div>
        )}
      </div>

      {/* Pulsing Tactical Visualizer UI block */}
      <div className="bg-black border-t border-[#106011]/15 px-3 py-2 flex flex-col items-center justify-center min-h-[60px] relative">
        {isSpeaking ? (
          <div className="flex items-center gap-1 h-8">
            <span className="text-[9px] text-[#0ad111] uppercase tracking-widest absolute left-3 top-2 opacity-50">SAT BROADCASTING</span>
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-[#0ad111] rounded-full animate-bar-pulse shadow-[0_0_8px_rgba(10,209,17,0.7)]"
                style={{
                  height: `${Math.floor(Math.random() * 24) + 6}px`,
                  animationDuration: `${0.4 + i * 0.05}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out'
                }}
              />
            ))}
          </div>
        ) : isListening ? (
          <div className="relative flex flex-col items-center justify-center py-2">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 animate-ping absolute opacity-60" />
            <span className="text-[10px] text-amber-500 text-center font-bold animate-pulse tracking-widest uppercase">
              CAPTURINE RAW FIELD AUDIO FEED...
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col text-[9px] text-slate-500">
              <span>Sat Connection: STABLE // RLS SHIELD ON</span>
              <span>Encrypted Packet Type: JSON // GEMINI v3.5</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#106011] opacity-75" />
              <span className="w-2 h-2 rounded-full bg-[#106011] opacity-50" />
              <span className="w-2 h-2 rounded-full bg-[#106011] opacity-20" />
            </div>
          </div>
        )}
      </div>

      {/* Preset Operator Direct Commands Grid */}
      <div className="bg-black border-t border-[#106011]/15 p-2 space-y-1">
        <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Preset Silent Command Prompts:</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button 
            onClick={() => triggerPresetCommand("Explain how the drop-off status flow functions for field agents")}
            disabled={isPending || isListening}
            className="text-[9.5px] border border-[#106011]/20 hover:border-[#106011] hover:bg-[#106011]/10 p-1 text-slate-400 hover:text-[#0ad111] transition-all rounded text-left truncate cursor-pointer disabled:opacity-40"
            title="Explain active drop states"
          >
            🛡️ Drop Lifecycle Flow
          </button>
          <button 
            onClick={() => triggerPresetCommand("Brief me on tactical safety and location tracking battery guidelines")}
            disabled={isPending || isListening}
            className="text-[9.5px] border border-[#106011]/20 hover:border-[#106011] hover:bg-[#106011]/10 p-1 text-slate-400 hover:text-[#0ad111] transition-all rounded text-left truncate cursor-pointer disabled:opacity-40"
            title="Location Battery Guidelines"
          >
            🔋 Battery & GPS Presets
          </button>
          <button 
            onClick={() => triggerPresetCommand("Give me an operational checklist for drop pickup verification")}
            disabled={isPending || isListening}
            className="text-[9.5px] border border-[#106011]/20 hover:border-[#106011] hover:bg-[#106011]/10 p-1 text-slate-400 hover:text-[#0ad111] transition-all rounded text-left truncate cursor-pointer disabled:opacity-40"
            title="Drop pickup verification"
          >
            🔑 QR Pickup Checklist
          </button>
          <button 
            onClick={() => triggerPresetCommand("What is low data mode and when should I activate it?")}
            disabled={isPending || isListening}
            className="text-[9.5px] border border-[#106011]/20 hover:border-[#106011] hover:bg-[#106011]/10 p-1 text-slate-400 hover:text-[#0ad111] transition-all rounded text-left truncate cursor-pointer disabled:opacity-40"
            title="Low data mode guidelines"
          >
            📡 Explain Low Data
          </button>
        </div>
      </div>

      {/* Interactive Input Dashboard Bar */}
      <div className="bg-black/95 border-t border-[#106011]/30 p-2 flex items-center gap-2">
        
        {/* Toggle Speech mic button */}
        <button
          onClick={toggleVoiceRecording}
          disabled={isPending}
          className={`p-2.5 rounded-full border cursor-pointer transition-all ${isListening ? 'bg-amber-950/60 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse' : 'bg-[#106011]/10 border-[#106011]/40 text-[#0ad111] hover:bg-[#106011]/30 hover:border-[#106011]'}`}
          title={isListening ? "Disengage voice interceptor" : "Engage secure voice command receiver"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text keyboard inputs input */}
        <div className="flex-1 flex items-center bg-black border border-[#106011]/45 rounded-md px-2 overflow-hidden focus-within:border-[#0ad111] focus-within:shadow-[0_0_8px_rgba(10,209,17,0.15)] transition-all">
          <Terminal className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={isPending || isListening}
            placeholder={isListening ? "Voice capture enabled..." : "ステルス (Stealth Console Command)..."}
            className="bg-transparent text-white text-xs py-1.5 focus:outline-none w-full disabled:opacity-50"
          />
        </div>

        {/* Submit command button */}
        <button
          onClick={() => handleSendMessage()}
          disabled={isPending || !inputVal.trim() || isListening}
          className="p-1.5 bg-[#106011]/15 border border-[#106011]/55 hover:bg-[#106011]/30 hover:border-[#0ad111] cursor-pointer text-[#0ad111] hover:text-white transition-all rounded disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
}
