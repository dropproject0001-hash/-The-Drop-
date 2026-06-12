import { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/ToastContainer';

interface CreateBulletinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateBulletinModal({ isOpen, onClose, onSuccess }: CreateBulletinModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'CRITICAL' | 'OPERATIONAL' | 'SUPER_ADMIN' | 'SECURITY'>('OPERATIONAL');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('bulletins')
        .insert([{
          title,
          content,
          status
        }]);

      if (error) throw error;

      showToast('Bulletin created successfully!', { type: 'success' });
      onClose();
      setTitle('');
      setContent('');
      setStatus('OPERATIONAL');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to create bulletin', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="relative bg-zinc-950 border-2 border-emerald-600 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_50px_rgba(5,150,105,0.3)]">
        <h3 className="text-sm font-bold uppercase text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          BULLETIN_UPDATE
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">TITLE</label>
            <input 
              required
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-black border border-zinc-700 focus:border-emerald-500 outline-none rounded-lg p-2 text-white font-mono text-[10px]"
              placeholder="UPDATE TITLE"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">CONTENT</label>
            <textarea 
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-black border border-zinc-700 focus:border-emerald-500 outline-none rounded-lg p-2 text-white font-mono text-[10px]"
              placeholder="BULLETIN_CONTENT..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">STATUS</label>
            <select 
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full bg-black border border-zinc-700 focus:border-emerald-500 outline-none rounded-lg p-2 text-white font-mono text-[10px]"
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="OPERATIONAL">OPERATIONAL</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="SECURITY">SECURITY</option>
            </select>
          </div>

          <div className="flex gap-2 mt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-zinc-700 font-mono text-[10px] uppercase tracking-widest hover:bg-zinc-900 transition"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-mono text-[10px] uppercase tracking-widest font-black transition text-black disabled:opacity-50"
            >
              {loading ? 'INIT...' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
