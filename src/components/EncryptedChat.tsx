import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/ToastContainer';
import { encryptNote, decryptNote } from '@/lib/crypto';
import { useAuth } from '@/app/providers/AuthContext';

interface Message {
  id: string;
  room_id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export default function EncryptedChat({ dropId }: { dropId: string }) {
  const { showToast } = useToast();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const roomId = `drop_${dropId}`;

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Decrypt messages
      const decrypted = (data || []).map((msg: any) => ({
        id: msg.id,
        room_id: msg.room_id,
        content: decryptNote(msg.body),
        sender_id: msg.sender_id,
        created_at: msg.created_at,
      }));

      setMessages(decrypted);
    } catch (err: any) {
      console.error('[EncryptedChat] fetchMessages failed:', err);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`chat-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const raw = payload.new as any;
          const newMsg: Message = {
            id: raw.id,
            room_id: raw.room_id,
            content: decryptNote(raw.body),
            sender_id: raw.sender_id,
            created_at: raw.created_at,
          };

          setMessages((prev) => {
            // Prevent duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile) return;

    setLoading(true);

    try {
      const encryptedContent = encryptNote(newMessage.trim());

      const { error } = await supabase.from('messages').insert({
        room_id: roomId,
        body: encryptedContent,
        sender_id: profile.id,
      });

      if (error) throw error;

      setNewMessage('');
    } catch (err: any) {
      showToast('Failed to send message', { type: 'error' });
      console.error('[EncryptedChat] sendMessage failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[500px] shadow-2xl">
      <div className="p-4 border-b border-zinc-800 font-semibold font-mono tracking-widest text-emerald-500 flex justify-between items-center bg-zinc-900/50 rounded-t-2xl">
        <span className="uppercase text-xs">Secure Channel • Drop #{dropId.slice(0, 8)}</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[url('/Backgroundimage.png')] bg-fixed bg-center bg-no-repeat bg-cover opacity-90"
      >
        <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-zinc-600 font-mono text-[10px] uppercase tracking-widest text-center py-20">
              [ Awaiting secure transmission... ]
            </div>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender_id === profile?.id;
            return (
              <div
                key={msg.id}
                className={`max-w-[85%] p-3 rounded-2xl text-sm font-mono break-words shadow-lg ${
                  isMine
                    ? 'bg-emerald-950/80 border border-emerald-800 ml-auto text-emerald-100 rounded-tr-none'
                    : 'bg-zinc-950/80 border border-zinc-800 text-slate-300 rounded-tl-none'
                }`}
              >
                <div className="text-[9px] text-zinc-500 mb-1 flex justify-between gap-4">
                  <span>{isMine ? 'YOU' : 'AGENT'}</span>
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {msg.content}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900 rounded-b-2xl flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="TYPE SECURE MESSAGE..."
          className="flex-1 bg-black/50 border border-zinc-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 font-mono text-xs text-white outline-none transition placeholder:text-zinc-700"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !newMessage.trim()}
          className="px-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-mono uppercase tracking-widest text-[10px] font-black rounded-xl transition-all shadow-lg active:scale-95"
        >
          {loading ? '...' : 'SEND'}
        </button>
      </div>
    </div>
  );
}
