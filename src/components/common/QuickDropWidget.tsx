import React, { useState } from 'react';
import { Crosshair, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRole } from '@/context/RoleContext';
import { useToast } from '@/components/ui/ToastContainer';
import { supabase } from '@/lib/supabase';
import { createPortal } from 'react-dom';
import { CreateDropPanel } from '@/components/panels/CreateDropPanel';
import { AfterDropModal } from '@/components/panels/AfterDropModal';

export function QuickDropWidget() {
  const { role } = useRole();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{lat: string, lng: string} | null>(null);
  
  // Only Admin, SuperAdmin, or Dropper (?) can create drops. 
  // Let's hide it from clients.
  const isClient = role === 'client';
  if (isClient) return null;

  const handleQuickDrop = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', { type: 'error' });
      return;
    }
    
    showToast('Acquiring secure coordinates...', { type: 'success' });
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString()
        });
        setIsOpen(true);
      },
      (error) => {
        console.error(error);
        showToast('Unable to retrieve location', { type: 'error' });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0
      }
    );
  };

  return (
    <>
      <motion.button
        onClick={handleQuickDrop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-[100px] right-6 z-[60] w-12 h-12 rounded-full bg-black hover:bg-[#106011]/20 border-2 border-[#0ad111]/70 hover:border-[#0ad111] flex items-center justify-center shadow-[0_0_15px_rgba(10,209,17,0.45)] cursor-pointer select-none overflow-hidden transition-all duration-350"
        title="Quick Drop"
      >
        <div className="relative w-full h-full p-0.5 flex items-center justify-center text-[#0ad111]">
          <motion.div 
            className="absolute inset-0 rounded-full border border-dashed border-[#0ad111]/30"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          />
          <Plus size={20} className="drop-shadow-[0_0_8px_rgba(10,209,17,0.8)]" />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md relative"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute -top-12 right-0 text-[#0ad111] hover:text-white font-mono text-sm uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full border border-[#106011]/50"
              >
                Abort
              </button>
              
              <QuickDropForm 
                initialPos={position} 
                onClose={() => setIsOpen(false)} 
              />
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}

function QuickDropForm({ initialPos, onClose }: { initialPos: {lat: string, lng: string} | null, onClose: () => void }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [successDrop, setSuccessDrop] = useState<any>(null);
  const [title, setTitle] = useState('URGENT_' + Math.floor(Math.random() * 10000));
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialPos) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.from('drops').insert({
        title,
        lat: parseFloat(initialPos.lat),
        lng: parseFloat(initialPos.lng),
        status: 'active'
      }).select().single();

      if (error) throw error;
      showToast('Quick Drop Deployed', { type: 'success' });
      setSuccessDrop(data);
    } catch (err) {
      console.error(err);
      showToast('Deploy Failed', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (successDrop) {
    return <AfterDropModal drop={successDrop} onClose={onClose} />;
  }

  return (
    <div className="bg-black/95 border border-[#106011]/50 p-6 rounded-2xl flex flex-col gap-4 text-white shadow-2xl">
      <div className="flex justify-between items-center border-b border-[#106011]/30 pb-3">
        <h3 className="text-[#0ad111] font-mono tracking-[0.2em] uppercase text-lg drop-shadow-[0_0_5px_rgba(10,209,17,0.5)]">
          Quick Drop Deployment
        </h3>
        <Crosshair size={20} className="text-[#0ad111] animate-pulse" />
      </div>
      
      <form onSubmit={submit} className="flex flex-col gap-4 mt-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-400">Designation Title</span>
          <input 
            type="text" 
            required 
            className="bg-[#106011]/10 border border-[#106011]/30 rounded p-3 text-sm font-mono focus:border-[#0ad111] outline-none text-[#0ad111]"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/50 border border-[#106011]/20 p-2 rounded flex flex-col items-center">
            <span className="text-[9px] uppercase font-mono text-slate-500 tracking-widest">Lattitude</span>
            <span className="font-mono text-xs text-white">{initialPos?.lat}</span>
          </div>
          <div className="bg-black/50 border border-[#106011]/20 p-2 rounded flex flex-col items-center">
            <span className="text-[9px] uppercase font-mono text-slate-500 tracking-widest">Longitude</span>
            <span className="font-mono text-xs text-white">{initialPos?.lng}</span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-4 bg-[#106011] text-white p-4 rounded-xl font-mono tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#0ad111] hover:text-black transition-colors border border-[#106011] shadow-[0_0_15px_rgba(16,96,17,0.5)]"
        >
          {loading ? 'DEPLOYING...' : 'CONFIRM DEPLOY'}
        </button>
      </form>
    </div>
  );
}
