import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Paperclip, ShieldCheck, Check, CornerDownLeft, Eye } from 'lucide-react';

export function ChatBoxView() {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Phantom', text: 'Cargo drop initialized at Sector 3 paypay.', time: '12:01', isMe: false, isSeen: true },
    { id: '2', sender: 'Me', text: 'Roger that. Coordinates mapped to God\'s Eye system.', time: '12:02', isMe: true, isSeen: true },
    { id: '3', sender: 'Phantom', text: 'Awaiting client confirm for delivery verification code.', time: '12:03', isMe: false, isSeen: true },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    
    const userMsg = {
      id: Date.now().toString(),
      sender: 'Me',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      isSeen: false
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    // Simulated Operator response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Update our sent message to seen
      setMessages(prev => prev.map(m => m.isMe ? { ...m, isSeen: true } : m));

      const botResponses = [
        "Duplex signal strong. Preparing tactical guide video upload.",
        "QR code generated and mapped to sector terminal marker.",
        "Awaiting buyer payment screenshots on ledger stream.",
        "Target coordinates secured and locked into terminal hub."
      ];
      
      const repMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'Phantom',
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        isSeen: true
      };

      setMessages(prev => [...prev, repMsg]);
    }, 2000);
  };

  const handleQuickResponse = (txt: string) => {
    setInputMessage(txt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="p-6 text-[#106011] space-y-8 select-none relative custom-scrollbar overflow-hidden h-[calc(100vh-80px)] flex flex-col">
      
      {/* Header telemetry info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#106011]/40 pb-6 shrink-0 z-10">
        <div>
          <span className="text-[9px] font-mono tracking-[0.25em] bg-[#106011]/15 px-2.5 py-1 rounded border border-[#106011]/30 uppercase font-black">
            LOCKED RADIO COMM CHANNEL
          </span>
          <h2 className="text-2xl font-display font-black tracking-[0.15em] uppercase text-white drop-shadow-[0_0_12px_rgba(16,96,17,0.85)] mt-2">
            CHAT BOX // LOGISTICS FEED
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase font-bold text-slate-300">
          <div className="p-2 bg-black/80 border-2 border-[#106011] rounded shadow-[0_0_12px_rgba(16,96,17,0.3)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#106011]" />
            <span>CHANNEL ENCRYPTION: SHA-256 AES</span>
          </div>
        </div>
      </div>

      {/* Duel Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0 relative z-10">
        {/* Left Side: Active Streams channels */}
        <div className="lg:col-span-1 hidden lg:flex flex-col bg-black/95 p-5 rounded-2xl border-2 border-[#106011] shadow-[0_0_18px_rgba(16,96,17,0.25)] relative overflow-hidden h-full">
          {/* Tactical HUD corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#106011] rounded-tl-lg pointer-events-none drop-shadow-[0_0_4px_#106011]"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#106011] rounded-tr-lg pointer-events-none drop-shadow-[0_0_4px_#106011]"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#106011] rounded-bl-lg pointer-events-none drop-shadow-[0_0_4px_#106011]"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#106011] rounded-br-lg pointer-events-none drop-shadow-[0_0_4px_#106011]"></div>
          
          <div className="absolute inset-1 border border-dashed border-[#106011]/25 rounded-md pointer-events-none"></div>

          <p className="text-[10px] font-mono font-bold text-slate-200 border-b border-[#106011]/30 pb-2 mb-4 tracking-wider uppercase">Active Comms Links</p>
          
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-3 rounded-lg bg-[#106011]/15 border-2 border-[#106011] shadow-[0_0_10px_rgba(16,96,17,0.2)] flex flex-col gap-1 relative cursor-pointer select-none">
              <div className="flex justify-between items-center">
                <span className="text-white text-xs font-bold font-display uppercase tracking-wider">Phantom (Dropper)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
              </div>
              <span className="text-[8.5px] font-mono text-[#106011] font-bold">SIGNAL: 106.011 MHz</span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-[#106011]/20 hover:border-[#106011] transition-all flex flex-col gap-1 relative cursor-pointer select-none">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold font-display uppercase tracking-wider text-xs">A-Agent Orbit (Dropper)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#106011]"></span>
              </div>
              <span className="text-[8.5px] font-mono text-slate-500">SIGNAL: 106.045 MHz</span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-[#106011]/20 hover:border-[#106011] transition-all flex flex-col gap-1 relative cursor-pointer select-none">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold font-display uppercase tracking-wider text-xs">Buyer S-42 (Client)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              </div>
              <span className="text-[8.5px] font-mono text-slate-500">PAYMENT STATUS: VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Right Side: Actve Chat workspace */}
        <div className="lg:col-span-3 flex flex-col bg-black/95 p-5 rounded-2xl border-2 border-[#106011] shadow-[0_0_24px_rgba(16,96,17,0.35)] relative overflow-hidden h-full">
          {/* Tactical HUD corners */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
          
          <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

          {/* Active dialogue logs */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4 mb-4 border border-[#106011]/35 bg-[#106011]/5 rounded min-h-[220px]">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col max-w-[85%] ${m.isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-[#106011]/70 mb-1 px-1 font-bold tracking-widest">
                  <span>{m.sender}</span>
                  <span>•</span>
                  <span>{m.time}</span>
                </div>
                
                <div className={`p-3 rounded-2xl border text-slate-200 font-mono text-[11px] uppercase tracking-wide leading-relaxed shadow-[0_3px_8px_rgba(0,0,0,0.4)] relative ${m.isMe ? 'bg-black text-[#106011] border-[#106011] rounded-tr-none' : 'bg-black/90 border-[#106011]/40 rounded-tl-none'}`}>
                  {/* Glowing corners for messages */}
                  <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[#106011]/45 pointer-events-none rounded-tl-sm"></div>
                  <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-[#106011]/45 pointer-events-none rounded-br-sm"></div>

                  <p>{m.text}</p>
                </div>
                
                {m.isMe && (
                  <div className="flex items-center gap-1 mt-1 px-1 font-mono text-[8px] uppercase tracking-widest text-[#106011]/60 font-black">
                    {m.isSeen ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-green-500 inline" />
                        <span>SEEN BY OPERATOR</span>
                      </>
                    ) : (
                      <span>TRANSMITTED STAGE</span>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex flex-col mr-auto max-w-[80%] items-start">
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-[#106011]/70 mb-1 px-1 font-bold">
                  <span>Phantom</span>
                  <span>•</span>
                  <span className="animate-pulse">TYPING FEED ACTIVE...</span>
                </div>
                <div className="p-3 bg-black/90 border border-dashed border-[#106011]/55 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#106011] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#106011] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#106011] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick responses list */}
          <div className="flex flex-wrap gap-2.5 mb-4 font-mono text-[9px] uppercase tracking-widest text-slate-300">
            <button
              onClick={() => handleQuickResponse("Send payment screenshots")}
              className="px-2.5 py-1.5 rounded bg-black/80 hover:bg-[#106011]/20 border border-[#106011]/50 hover:border-[#106011] shadow-sm select-none cursor-pointer"
            >
              Request Screenshot
            </button>
            <button
              onClick={() => handleQuickResponse("Awaiting coordinates confirm")}
              className="px-2.5 py-1.5 rounded bg-black/80 hover:bg-[#106011]/20 border border-[#106011]/50 hover:border-[#106011] shadow-sm select-none cursor-pointer"
            >
              Await Coordinates
            </button>
            <button
              onClick={() => handleQuickResponse("Drop completed successfully.")}
              className="px-2.5 py-1.5 rounded bg-black/80 hover:bg-[#106011]/20 border border-[#106011]/50 hover:border-[#106011] shadow-sm select-none cursor-pointer"
            >
              Verify Complete
            </button>
          </div>

          {/* Message input area */}
          <div className="flex gap-3 relative z-10 shrink-0 select-text">
            <button className="h-11 w-11 shrink-0 rounded-xl border border-[#106011]/45 flex items-center justify-center bg-black hover:bg-[#106011]/15 transition-all text-[#106011] hover:text-green-400 font-bold select-none cursor-pointer shadow-md">
              <Paperclip className="w-4.5 h-4.5" />
            </button>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="ENCODE ENCRYPTED RADIO COMM..."
              className="flex-1 h-11 border-2 border-[#106011] bg-black text-[#106011] placeholder-[#106011]/40 rounded-xl px-4 font-mono text-xs uppercase focus:outline-none focus:ring-0 focus:border-[#106011]/80 select-text"
            />
            
            <button
              onClick={handleSend}
              className="h-11 px-5 rounded-xl border-2 border-[#106011] bg-black hover:bg-[#106011]/25 text-[#106011] flex items-center gap-1.5 shadow-md shadow-[#106011]/30 hover:shadow-[0_0_15px_rgba(16,96,17,0.4)] hover:scale-[1.02] transition-all font-mono text-xs font-black uppercase tracking-wider select-none cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND</span>
              <CornerDownLeft className="w-3 h-3 text-[#106011]/50 hidden sm:inline ml-1" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
