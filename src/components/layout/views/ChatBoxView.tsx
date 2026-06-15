import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { useToast } from '@/components/ui/ToastContainer';
import { 
  MessageSquare, Send, Paperclip, ShieldCheck, Check, 
  CornerDownLeft, Radio, AlertTriangle, Users, Lock, ShieldAlert 
} from 'lucide-react';

interface ChatProfile {
  id: string;
  role: 'super_admin' | 'admin' | 'dropper' | 'client';
  alias: string | null;
  username: string | null;
  phone?: string;
  email?: string;
}

interface DBMessage {
  id: string;
  room_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  profiles?: {
    alias: string | null;
    role: string;
  } | null;
}

export function ChatBoxView() {
  const { profile } = useAuthStore();
  const { showToast } = useToast();
  
  const [channelsList, setChannelsList] = useState<ChatProfile[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChatProfile | null>(null);
  
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const [profilesCache, setProfilesCache] = useState<{ [key: string]: { alias: string; role: string } }>({});
  
  const [activeSegment, setActiveSegment] = useState<'droppers' | 'clients'>('droppers');
  const [mobileShowContacts, setMobileShowContacts] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Derive unique Room ID
  const getRoomId = (otherUser: ChatProfile | null) => {
    if (!profile) return '';
    
    const isUserAdmin = profile.role === 'super_admin' || profile.role === 'admin';
    
    // Droppers or Clients only chat direct with HQ
    if (!isUserAdmin) {
      if (profile.role === 'dropper') {
        return `admin_dropper_chat_${profile.id}`;
      } else {
        return `admin_client_chat_${profile.id}`;
      }
    }
    
    // Admins chat with the selected otherUser
    if (!otherUser) return '';
    
    if (otherUser.role === 'dropper') {
      return `admin_dropper_chat_${otherUser.id}`;
    } else {
      return `admin_client_chat_${otherUser.id}`;
    }
  };

  const activeRoomId = getRoomId(selectedChannel);

  // 1. Fetch channel mates (Only for Admins)
  useEffect(() => {
    if (!profile) return;
    
    const isUserAdmin = profile.role === 'super_admin' || profile.role === 'admin';
    if (!isUserAdmin) {
      // For Droppers/Clients, mock selected HQ admin channel object so they chat with HQ
      const hqChannel: ChatProfile = {
        id: 'HQ_OPERATOR',
        role: 'super_admin',
        alias: 'COVERT COMMAND HQ',
        username: 'hq_master'
      };
      setSelectedChannel(hqChannel);
      return;
    }
    
    const fetchChannels = async () => {
      setLoadingChannels(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, role, alias, username, phone, email')
          .neq('id', profile.id)
          .order('role', { ascending: true });
          
        if (error) throw error;
        
        const validProfiles = (data || []) as ChatProfile[];
        setChannelsList(validProfiles);
        
        // Auto-select first channel matching the current default segment (droppers)
        const droppers = validProfiles.filter(ch => ch.role === 'dropper' || ch.role === 'admin' || ch.role === 'super_admin');
        if (droppers.length > 0) {
          setSelectedChannel(droppers[0]);
        } else if (validProfiles.length > 0) {
          setSelectedChannel(validProfiles[0]);
        }
      } catch (err: any) {
        console.error('[ChatBox] Channels fetch failed:', err);
      } finally {
        setLoadingChannels(false);
      }
    };
    
    fetchChannels();
  }, [profile?.id, profile?.role]);

  // 2. Fetch or sync profiles cache on demand
  const resolveProfileInfo = async (userId: string) => {
    if (profilesCache[userId]) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('alias, role')
        .eq('id', userId)
        .single();
        
      if (data) {
        setProfilesCache(prev => ({
          ...prev,
          [userId]: {
            alias: data.alias || 'UNKNOWN OPERATIVE',
            role: data.role
          }
        }));
      }
    } catch (e) {
      // Ignore
    }
  };

  // 3. Fetch historical messages when activeRoomId changes
  useEffect(() => {
    if (!activeRoomId) return;
    
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('id, room_id, sender_id, body, created_at')
          .eq('room_id', activeRoomId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        const msgs = (data || []) as DBMessage[];
        setMessages(msgs);
        
        // Resolve senders
        msgs.forEach(m => resolveProfileInfo(m.sender_id));
      } catch (err) {
        console.error('[ChatBox] Message loading failed:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [activeRoomId]);

  // 4. Realtime subscribe to incoming messages on current activeRoomId
  useEffect(() => {
    if (!activeRoomId) return;
    
    const channel = supabase
      .channel(`room_${activeRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${activeRoomId}`
        },
        async (payload) => {
          const newMsg = payload.new as DBMessage;
          // Avoid duplicate appends
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          resolveProfileInfo(newMsg.sender_id);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoomId]);

  // Scroll to bottom on messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!inputMessage.trim() || !profile || !activeRoomId || sending) return;
    
    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: activeRoomId,
          sender_id: profile.id,
          body: inputMessage.trim()
        });
        
      if (error) throw error;
      setInputMessage('');
    } catch (err: any) {
      console.error('[ChatBox] Failed to transmit message:', err);
      showToast('Radio transmission jammed', { type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleQuickResponse = (text: string) => {
    setInputMessage(text);
  };

  const isUserAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';

  return (
    <div className="p-4 md:p-6 text-[#106011] space-y-6 select-none relative custom-scrollbar overflow-hidden h-[calc(100vh-80px)] flex flex-col">
      
      {/* Visual Header */}
      <div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#106011]/40 p-4 pb-6 shrink-0 z-10 relative overflow-hidden rounded-2xl"
        style={{ backgroundImage: `url('/coverphoto002.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/85 z-0 pointer-events-none" />
        
        <div className="relative z-10">
          <span className="text-[9px] font-mono tracking-[0.25em] bg-[#106011]/25 text-[#0ad111] px-2.5 py-1 rounded border border-[#106011]/30 uppercase font-black">
            LOCKED OPERATIONAL COMM LINK
          </span>
          <h2 className="text-2xl font-display font-black tracking-[0.15em] uppercase text-white drop-shadow-[0_0_12px_rgba(16,96,17,0.85)] mt-2">
            RADIO CHAT BOX
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-4 font-mono text-[9px] uppercase font-bold text-slate-300 relative z-10">
          <div className="p-2.5 bg-black border-2 border-[#106011] rounded shadow-[0_0_12px_rgba(16,96,17,0.3)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0ad111] animate-pulse" />
            <span>ENCRYPTED DIRECT CHANNEL</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0 relative z-10">
        
        {/* Left Side: Contact Channels - Responsive Mobile & Desktop */}
        <div className={`lg:col-span-1 flex flex-col bg-black/95 p-5 rounded-2xl border-2 border-[#106011] shadow-[0_0_18px_rgba(16,96,17,0.25)] relative overflow-hidden h-full ${
          isUserAdmin 
            ? (mobileShowContacts ? 'flex w-full' : 'hidden lg:flex')
            : 'hidden lg:flex'
        }`}>
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#106011] rounded-tl-lg pointer-events-none drop-shadow-[0_0_4px_#106011]"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#106011] rounded-tr-lg pointer-events-none drop-shadow-[0_0_4px_#106011]"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#106011] rounded-bl-lg pointer-events-none drop-shadow-[0_0_4px_#106011]"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#106011] rounded-br-lg pointer-events-none drop-shadow-[0_0_4px_#106011]"></div>
          <div className="absolute inset-1 border border-dashed border-[#106011]/25 rounded-md pointer-events-none"></div>

          {/* Secure Partition Segment Control */}
          {isUserAdmin && (
            <div className="grid grid-cols-2 gap-2 mb-4 shrink-0 font-mono text-[9px] uppercase font-bold relative z-10">
              <button
                onClick={() => {
                  setActiveSegment('droppers');
                  // Find first dropper/admin locally
                  const droppers = channelsList.filter(ch => ch.role === 'dropper' || ch.role === 'admin' || ch.role === 'super_admin');
                  if (droppers.length > 0) {
                    setSelectedChannel(droppers[0]);
                  } else {
                    setSelectedChannel(null);
                  }
                }}
                className={`py-2 px-1 text-center rounded border transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                  activeSegment === 'droppers'
                    ? 'border-[#0ad111] bg-[#106011]/15 text-white shadow-[0_0_8px_rgba(16,96,17,0.3)]'
                    : 'border-[#106011]/20 bg-black/40 text-slate-500 hover:text-slate-300 hover:border-[#106011]/40'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`w-1 h-1 rounded-full ${activeSegment === 'droppers' ? 'bg-[#0ad111] animate-ping' : 'bg-slate-700'}`} />
                  <span>HQ & DROPPERS</span>
                </div>
                <span className="text-[7px] text-emerald-500/70">SECURE BAND</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveSegment('clients');
                  // Find first client locally
                  const clients = channelsList.filter(ch => ch.role === 'client');
                  if (clients.length > 0) {
                    setSelectedChannel(clients[0]);
                  } else {
                    setSelectedChannel(null);
                  }
                }}
                className={`py-2 px-1 text-center rounded border transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                  activeSegment === 'clients'
                    ? 'border-amber-500 bg-amber-950/20 text-white shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                    : 'border-[#106011]/20 bg-black/40 text-slate-500 hover:text-slate-300 hover:border-[#106011]/40'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`w-1 h-1 rounded-full ${activeSegment === 'clients' ? 'bg-amber-500 animate-ping' : 'bg-slate-700'}`} />
                  <span>CLIENT BUYERS</span>
                </div>
                <span className="text-[7px] text-amber-500/70">TRADE DEALS</span>
              </button>
            </div>
          )}

          <div className="border-b border-[#106011]/30 pb-2.5 mb-3.5 font-mono text-[10px] text-zinc-300 uppercase font-black flex items-center gap-1.5 justify-between select-text relative z-10">
            <span className="flex items-center gap-1">
              <Users size={12} className={activeSegment === 'clients' ? 'text-amber-500' : 'text-[#0ad111]'} /> 
              {activeSegment === 'clients' ? 'ACTIVE CLIENTS' : 'TACTICAL AGENTS'}
            </span>
            <span className={`text-[8px] px-1.5 rounded ${
              activeSegment === 'clients' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-[#106011]/15 text-[#0ad111] border border-[#106011]/30'
            }`}>
              {channelsList.filter(ch => activeSegment === 'droppers' 
                ? (ch.role === 'dropper' || ch.role === 'admin' || ch.role === 'super_admin') 
                : ch.role === 'client'
              ).length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar pr-1 select-text relative z-10">
            {!isUserAdmin ? (
              // Non-admin view (Dropper/buyer list is hidden to secure privacy of operations)
              <div className="p-4 rounded-xl border border-dashed border-[#106011]/30 text-center space-y-2 select-text">
                <Lock className="w-5 h-5 text-red-500 mx-auto animate-bounce" />
                <p className="text-[8.5px] font-mono leading-relaxed uppercase text-zinc-400">
                  CONFIDENTIAL PROTOCOL:<br/>
                  {profile?.role === 'dropper' ? 'DROPPER' : 'CLIENT'} COMPARTMENTALIZED CHANNEL ACTIVE.<br/>
                  NO RECON EXPOSURE permitted.
                </p>
              </div>
            ) : loadingChannels ? (
              <div className="text-[10px] font-mono text-center py-10 uppercase animate-pulse">Scanning frequencies...</div>
            ) : channelsList.filter(ch => activeSegment === 'droppers' 
                ? (ch.role === 'dropper' || ch.role === 'admin' || ch.role === 'super_admin') 
                : ch.role === 'client'
              ).length === 0 ? (
              <div className="text-[9px] font-mono text-center py-10 text-zinc-500 uppercase">
                No active {activeSegment === 'clients' ? 'clients' : 'agents'} online
              </div>
            ) : (
              channelsList
                .filter(ch => activeSegment === 'droppers' 
                  ? (ch.role === 'dropper' || ch.role === 'admin' || ch.role === 'super_admin') 
                  : ch.role === 'client'
                )
                .map((ch) => {
                  const isSelected = selectedChannel?.id === ch.id;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        setSelectedChannel(ch);
                        setMobileShowContacts(false); // Auto close sidebar on mobile choice
                      }}
                      className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer flex flex-col gap-1 relative ${
                        isSelected 
                          ? activeSegment === 'clients' 
                            ? 'bg-amber-950/15 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                            : 'bg-[#106011]/15 border-[#0ad111] shadow-[0_0_10px_rgba(16,96,17,0.25)]' 
                          : 'bg-black/40 border-[#106011]/20 hover:border-[#106011]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white text-xs font-bold uppercase tracking-wider truncate max-w-[120px]">
                          {ch.alias || ch.username || 'OPERATIVE'}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? (activeSegment === 'clients' ? 'bg-amber-500 animate-pulse' : 'bg-green-500') : 'bg-[#106011]'}`} />
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-mono uppercase">
                        <span className={isSelected 
                          ? activeSegment === 'clients' ? 'text-amber-450 font-bold' : 'text-[#0ad111] font-bold' 
                          : 'text-slate-500'
                        }>
                          {ch.role === 'dropper' ? '🟢 dropper' : ch.role === 'client' ? '👤 client / buyer' : '⭐ HQ Admin'}
                        </span>
                        <span className="text-[7.5px] text-zinc-600">ID: {ch.id.slice(0, 6)}</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Dialogue */}
        <div className={`lg:col-span-3 flex flex-col bg-black/95 p-5 rounded-2xl border-2 border-[#106011] shadow-[0_0_24px_rgba(16,96,17,0.35)] relative overflow-hidden h-full ${
          isUserAdmin && mobileShowContacts ? 'hidden lg:flex' : 'flex'
        }`}>
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

          {/* Connected target details */}
          <div className="flex justify-between items-center border border-[#106011]/45 p-2.5 bg-black/90 rounded mb-3 text-[10px] font-mono relative z-10 select-text gap-2.5 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {isUserAdmin && (
                <button
                  onClick={() => setMobileShowContacts(true)}
                  className="lg:hidden px-2 py-1 rounded border border-[#106011] bg-[#106011]/15 text-[#0ad111] font-bold text-[8px] uppercase tracking-wider shrink-0 duration-300 hover:bg-[#106011]/30 flex items-center gap-1"
                >
                  <Users size={12} />
                  <span>CONTACTS</span>
                </button>
              )}
              <Radio className="w-4 h-4 text-[#0ad111] animate-pulse shrink-0" />
              <div className="truncate">
                <span className="text-zinc-500 uppercase">UPLINK CHANNEL:</span>{' '}
                <span className="text-white font-extrabold uppercase truncate">
                  {selectedChannel?.alias || selectedChannel?.username || 'ADMIN TEAM'}
                </span>
              </div>
            </div>
            
            <div className="text-[#0ad111] font-black text-[9px] uppercase tracking-wider shrink-0 bg-[#106011]/15 px-2 py-0.5 rounded border border-[#106011]/30">
              {selectedChannel?.role || 'BOSS HQ'}
            </div>
          </div>

          {/* Chat feed box */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4 mb-3 border border-[#106011]/35 bg-[#106011]/5 rounded min-h-[220px] select-text">
            {loadingMessages && messages.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-[10px] font-mono uppercase animate-pulse">
                Decrypting secure signal history...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center select-text">
                <ShieldAlert className="w-8 h-8 text-yellow-500/50 mb-2" />
                <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                  DIRECT LINE SECURED.<br/>TRANSMIT MESSAGE PACKETS TO DEFINE DIALOGUE.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender_id === profile?.id;
                const senderMeta = profilesCache[m.sender_id] || { alias: 'OPERATIVE', role: 'HQ' };
                
                // Color map depending on sender role
                const isSenderAdmin = senderMeta.role === 'super_admin' || senderMeta.role === 'admin';
                const isSenderDropper = senderMeta.role === 'dropper';
                
                const badgeBorder = isSenderAdmin 
                  ? 'border-[#0ad111]' 
                  : isSenderDropper 
                  ? 'border-blue-500' 
                  : 'border-yellow-600';
                  
                return (
                  <div key={m.id} className={`flex items-start gap-2.5 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'}`}>
                    
                    {/* Circle monogram indicator */}
                    <div className={`w-8 h-8 rounded-full border-2 shrink-0 ${badgeBorder} bg-black flex items-center justify-center text-[10px] font-black text-white`}>
                      {senderMeta.alias?.slice(0, 2).toUpperCase() || 'HQ'}
                    </div>

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Message stats */}
                      <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-zinc-500 mb-0.5 px-0.5 font-bold uppercase tracking-wider">
                        <span className="text-[#0ad111]">{senderMeta.alias}</span>
                        <span>•</span>
                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      {/* Message bubble */}
                      <div className={`p-3 rounded-2xl border text-slate-200 font-sans text-xs tracking-wide leading-relaxed relative ${
                        isMe 
                          ? 'bg-black text-[#106011] border-[#106011] rounded-br-none' 
                          : 'bg-black/90 border-[#106011]/35 rounded-bl-none'
                      }`}>
                        <div className="absolute top-0.5 left-0.5 w-1 h-1 border-t border-l border-[#106011]/30 pointer-events-none rounded-sm"></div>
                        <p className="whitespace-pre-wrap break-words pr-2">{m.body}</p>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick reply assists */}
          <div className="flex flex-wrap gap-2 mb-3.5 font-mono text-[8.5px] uppercase tracking-widest text-slate-300">
            {profile?.role === 'dropper' ? (
              <>
                <button onClick={() => handleQuickResponse("Drop completed successfully. QR code ready.")} className="px-2.5 py-1 rounded bg-black border border-[#106011]/45 hover:border-[#106011]">
                  ✔ DROP COMPLETED
                </button>
                <button onClick={() => handleQuickResponse("Staging precision GPS координаты, stand-by.")} className="px-2.5 py-1 rounded bg-black border border-[#106011]/45 hover:border-[#106011]">
                  📡 STAGING COORDINATES
                </button>
              </>
            ) : profile?.role === 'client' ? (
              <>
                <button onClick={() => handleQuickResponse("Seeking drop confirmation. Awaiting QR scan code release.")} className="px-2.5 py-1 rounded bg-black border border-amber-500/40 hover:border-amber-500 text-amber-400">
                  QR CLEARANCE
                </button>
                <button onClick={() => handleQuickResponse("USDT transaction completed. Releasing dispatch token request.")} className="px-2.5 py-1 rounded bg-black border border-amber-500/40 hover:border-amber-500 text-amber-400">
                  DEPOSIT PAID
                </button>
                <button onClick={() => handleQuickResponse("Unit is present at the defined drop coordinates.")} className="px-2.5 py-1 rounded bg-black border border-amber-500/40 hover:border-amber-500 text-amber-400">
                  ON STATION
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleQuickResponse("Transmit drop identifier and coordinates immediately.")} className="px-2.5 py-1 rounded bg-black border border-[#106011]/45 hover:border-[#106011]">
                  Request Coordinates
                </button>
                <button onClick={() => handleQuickResponse("USDT transaction verification secured. Dispatching verify token.")} className="px-2.5 py-1 rounded bg-black border border-[#106011]/45 hover:border-[#106011]">
                  Funds Verified
                </button>
              </>
            )}
          </div>

          {/* Message send bar */}
          <div className="flex gap-2.5 relative z-10 shrink-0 select-text">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="ENCODE ENCRYPTED RADIO COMM PACKET..."
              className="flex-1 h-11 border-2 border-[#106011] bg-black text-[#106011] placeholder-[#106011]/35 rounded-xl px-4 font-mono text-xs uppercase focus:outline-none select-text"
            />
            
            <button
              onClick={handleSend}
              disabled={sending}
              className="h-11 px-5 rounded-xl border-2 border-[#106011] bg-black hover:bg-[#106011]/20 text-[#106011] disabled:opacity-40 flex items-center gap-1.5 transition-all font-mono text-xs font-black uppercase tracking-widest cursor-pointer shadow-[0_0_12px_rgba(16,96,17,0.25)]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? '...' : 'SEND'}</span>
              <CornerDownLeft className="w-3 h-3 text-[#106011]/40 hidden sm:inline ml-1" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
