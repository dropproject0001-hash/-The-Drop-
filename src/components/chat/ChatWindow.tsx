
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export function ChatWindow({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const { profile } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
        
      if (data) setMessages(data);
    };
    fetchMessages();

    // Subscribe to realtime
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `room_id=eq.${roomId}` 
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!body || !profile) return;
    
    await supabase.from('messages').insert({
      room_id: roomId,
      sender_id: profile.id,
      body
    });
    setBody('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg ${m.sender_id === profile?.id ? 'bg-primary text-white' : 'bg-slate-800 text-slate-100'}`}>
              {m.body}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700 flex gap-2">
        <input 
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 p-2 bg-slate-800 text-white rounded-lg"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="p-2 bg-primary text-white rounded-lg">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
