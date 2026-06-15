import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/ToastContainer';
import { encryptNote, decryptNote } from '@/lib/crypto';
import { useAuthStore } from '@/stores';

interface Message {
  id: string;
  room_id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export default function EncryptedChat({ dropId, customRoomId }: { dropId?: string, customRoomId?: string }) {
  const { showToast } = useToast();
  const { profile } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Determine room ID
  const roomId = customRoomId || (dropId === 'hq' ? `boss_dropper_${profile?.id}` : `drop_${dropId}`);

  // Fetch messages
  const fetchMessages = async () => {
    if (!roomId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    // Decrypt messages
    const decrypted = data.map((msg: any) => ({
      id: msg.id,
      room_id: msg.room_id,
      content: decryptNote(msg.body),
      sender_id: msg.sender_id,
      created_at: msg.created_at,
    }));

    setMessages(decrypted);
  };

  useEffect(() => {
    fetchMessages();

    if (!roomId) return;

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

          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile || !roomId) return;

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[500px] shadow-xl">
      <div className="p-4 border-b border-zinc-800 font-semibold font-mono tracking-widest text-[#106011] uppercase flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[#106011] animate-pulse" />
           {roomId.startsWith('boss_dropper') ? 'HQ COMMAND CHANNEL' : `SECURE CHANNEL • DROP #${dropId}`}
        </div>
        <span className="text-[8px] opacity-40">AES_256_ACTIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 font-mono text-[10px] uppercase tracking-[0.3em] gap-3">
            <div className="w-12 h-[1px] bg-zinc-800" />
            AWAITING SECURE TRANSMISSION
            <div className="w-12 h-[1px] bg-zinc-800" />
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === profile?.id;
          return (
            <div
              key={msg.id}
              className={`max-w-[85%] p-3 rounded-xl text-sm font-mono break-words shadow-sm ${
                isMine
                  ? 'bg-[#106011]/20 border border-[#106011]/30 ml-auto text-emerald-100'
                  : 'bg-zinc-950 border border-zinc-800 text-slate-300'
              }`}
            >
              <div className="text-[9px] opacity-30 mb-1 flex justify-between gap-4">
                <span>{isMine ? 'YOU' : 'PARTICIPANT'}</span>
                <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {msg.content}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800 flex gap-2 bg-black/40">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type secure message..."
          className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 font-mono text-sm text-white focus:border-[#106011] focus:outline-none transition-colors"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !newMessage.trim()}
          className="px-6 bg-[#106011] hover:bg-emerald-700 disabled:bg-zinc-700 text-white font-mono uppercase tracking-widest text-xs font-bold rounded-xl transition-all shadow-lg"
        >
          {loading ? '...' : 'SEND'}
        </button>
      </div>
    </div>
  );
}
