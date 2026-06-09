import CryptoJS from 'crypto-js';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SECRET_KEY = "THE-DROP-SECRET-KEY-CHANGE-THIS"; // Move to env in production

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export default function EncryptedChat({ dropId }: { dropId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const encrypt = (text: string) => CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  const decrypt = (ciphertext: string) => {
    try {
      return CryptoJS.AES.decrypt(ciphertext, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    } catch {
      return "[Encrypted Message]";
    }
  };

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('drop_id', dropId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`drop-chat-${dropId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `drop_id=eq.${dropId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dropId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const encryptedContent = encrypt(newMessage);

    await supabase.from('messages').insert({
      drop_id: dropId,
      content: encryptedContent,
      sender_id: 'current-user-id', // Replace with real auth
    });

    setNewMessage('');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[500px]">
      <div className="p-4 border-b border-zinc-800 font-semibold font-mono tracking-widest text-[#106011] uppercase">Secure Channel • Drop #{dropId}</div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const decrypted = decrypt(msg.content);
          return (
            <div key={msg.id} className="bg-zinc-950 border border-zinc-800/60 text-slate-300 p-3 rounded-xl max-w-[80%] font-mono text-sm ml-auto mr-0 break-words">
              {decrypted || "[Encrypted Message]"}
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-600 font-mono text-xs uppercase tracking-widest">
            Awaiting transmission...
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type encrypted message..."
          className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 font-mono text-sm text-slate-300 focus:border-[#106011] focus:outline-none placeholder:text-zinc-700"
        />
        <button 
          onClick={sendMessage}
          className="px-6 h-10 flex items-center justify-center bg-[#106011] text-white font-mono uppercase tracking-widest text-xs font-bold rounded-xl hover:bg-green-700 transition"
        >
          Transmit
        </button>
      </div>
    </div>
  );
}
