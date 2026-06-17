// src/components/EncryptedChat.tsx
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

export default function EncryptedChat({ dropId }: { dropId: string }) {
  const { showToast } = useToast();
  const { profile } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const roomId = `drop_${dropId}`; // Consistent room identifier

  // Fetch messages
  const fetchMessages = async () => {
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
      content: decryptNote(msg.body), // Aligned with DB 'body' column
      sender_id: msg.sender_id,
      created_at: msg.created_at,
    }));

    setMessages(decrypted);
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

          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile) return;

    setLoading(true);

    try {
      const encryptedContent = encryptNote(newMessage.trim());

      const { error } = await supabase.from('messages').insert({
        room_id: roomId,
        body: encryptedContent, // Using 'body' from schema
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[500px]">
      <div className="p-4 border-b border-zinc-800 font-semibold font-mono tracking-widest text-[#106011] uppercase">
        Secure Channel • Drop #{dropId}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-600 font-mono text-xs uppercase tracking-widest">
            Awaiting secure transmission...
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === profile?.id;
          return (
            <div
              key={msg.id}
              className={`max-w-[80%] p-3 rounded-xl text-sm font-mono break-words ${
                isMine
                  ? 'bg-emerald-950 border border-emerald-800 ml-auto text-emerald-100'
                  : 'bg-zinc-950 border border-zinc-800 text-slate-300'
              }`}
            >
              {msg.content}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800 flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type secure message..."
          className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 font-mono text-sm text-white focus:border-[#106011] focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !newMessage.trim()}
          className="px-6 bg-[#106011] hover:bg-emerald-700 disabled:bg-zinc-700 text-white font-mono uppercase tracking-widest text-xs font-bold rounded-xl transition"
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
