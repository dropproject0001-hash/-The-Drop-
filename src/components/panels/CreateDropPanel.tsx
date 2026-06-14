import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Crosshair, Camera, Video, User } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';
import { AfterDropModal } from './AfterDropModal';
import { useAuth } from '@/app/providers/AuthContext';

export function CreateDropPanel({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successDrop, setSuccessDrop] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    lat: '',
    lng: '',
    assigned_to: '',
    photo_url: '',
    video_url: ''
  });

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', { type: 'error' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString()
        }));
        showToast('GPS COORDINATES ACQUIRED', { type: 'success' });
      },
      (error) => {
        console.error(error);
        showToast('SIGNAL INTERRUPTED: CHECK GPS', { type: 'error' });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);

    try {
      const { data, error } = await supabase.from('drops').insert({
        title: formData.title,
        lat,
        lng,
        assigned_to: formData.assigned_to || null,
        created_by: profile.id,
        photo_url: formData.photo_url || null,
        video_url: formData.video_url || null,
        status: 'active'
      }).select().single();

      if (error) throw error;
      setSuccessDrop(data);
      showToast('DROP MANIFEST LOGGED', { type: 'success' });
    } catch (err) {
      console.error(err);
      showToast('FAILED TO LOG DROP', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (successDrop) {
    return <AfterDropModal drop={successDrop} onClose={onClose} />;
  }

  return (
    <div className="bg-black/95 border border-blue-500/50 p-6 rounded-3xl flex flex-col gap-4 text-white shadow-[0_0_40px_rgba(37,99,235,0.2)]">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
           <h3 className="text-blue-500 font-mono tracking-[0.2em] uppercase text-sm font-black">INITIALIZE DROPZONE</h3>
        </div>
        <button 
          type="button" 
          onClick={handleGetCurrentLocation}
          className="text-blue-400 hover:text-white p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/30 transition-all"
          title="Acquire Telemetry"
        >
          <Crosshair size={18} className="animate-spin-slow" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-widest font-black flex items-center gap-2"><Package className="w-3 h-3"/> Cargo Designation</span>
          <input 
            type="text" 
            required 
            placeholder="e.g. ALPHA_PAYLOAD_01"
            className="bg-blue-950/20 border-2 border-blue-900/30 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-blue-500 outline-none transition-colors placeholder:text-blue-900"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-widest font-black">Latitude</span>
            <input 
              type="number" 
              step="any"
              required 
              className="bg-blue-950/20 border-2 border-blue-900/30 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-blue-500 outline-none transition-colors"
              value={formData.lat}
              onChange={e => setFormData({...formData, lat: e.target.value})}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-widest font-black">Longitude</span>
            <input 
              type="number" 
              step="any" 
              required 
              className="bg-blue-950/20 border-2 border-blue-900/30 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-blue-500 outline-none transition-colors"
              value={formData.lng}
              onChange={e => setFormData({...formData, lng: e.target.value})}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-widest font-black flex items-center gap-2"><Camera className="w-3 h-3"/> Photo URL</span>
            <input
              type="text"
              placeholder="ipfs://..."
              className="bg-blue-950/20 border-2 border-blue-900/30 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-blue-500 outline-none transition-colors placeholder:text-blue-900"
              value={formData.photo_url}
              onChange={e => setFormData({...formData, photo_url: e.target.value})}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-widest font-black flex items-center gap-2"><Video className="w-3 h-3"/> Video URL</span>
            <input
              type="text"
              placeholder="ipfs://..."
              className="bg-blue-950/20 border-2 border-blue-900/30 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-blue-500 outline-none transition-colors placeholder:text-blue-900"
              value={formData.video_url}
              onChange={e => setFormData({...formData, video_url: e.target.value})}
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-widest font-black flex items-center gap-2"><User className="w-3 h-3"/> Assign to Client ID</span>
          <input 
            type="text" 
            placeholder="UUID of recipient"
            className="bg-blue-950/20 border-2 border-blue-900/30 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-blue-500 outline-none transition-colors placeholder:text-blue-900"
            value={formData.assigned_to}
            onChange={e => setFormData({...formData, assigned_to: e.target.value})}
          />
        </label>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 bg-blue-600 text-white py-4 rounded-xl font-mono tracking-[0.3em] uppercase text-xs font-black flex items-center justify-center gap-3 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50"
        >
          <Save size={18} /> {loading ? 'TRANSMITTING...' : 'INITIALIZE DROP'}
        </button>
      </form>
    </div>
  );
}
