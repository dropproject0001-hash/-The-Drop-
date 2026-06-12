import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Crosshair } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';

export function CreateDropPanel({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    lat: '',
    lng: '',
    assigned_to: ''
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
        showToast('Location acquired', { type: 'success' });
      },
      (error) => {
        console.error(error);
        showToast('Unable to retrieve location', { type: 'error' });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert strings to numbers
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);

    try {
      const { error } = await supabase.from('drops').insert({
        title: formData.title,
        lat,
        lng,
        assigned_to: formData.assigned_to || null,
        status: 'active'
      });

      if (error) throw error;
      showToast('Drop initialized successfully', { type: 'success' });
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to create drop', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/95 border border-[#106011]/50 p-6 rounded-2xl flex flex-col gap-4 text-white">
      <div className="flex justify-between items-center">
        <h3 className="text-[#106011] font-mono tracking-widest uppercase text-lg">Initialize New DropZone</h3>
        <button 
          type="button" 
          onClick={handleGetCurrentLocation}
          className="text-[#0ad111] hover:text-white p-2 rounded-lg bg-[#106011]/20 hover:bg-[#106011]/40 transition-colors"
          title="Get Current Location"
        >
          <Crosshair size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-400">Title</span>
          <input 
            type="text" 
            required 
            className="bg-[#106011]/10 border border-[#106011]/30 rounded p-2 text-sm font-mono focus:border-[#106011] outline-none"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Latitude</span>
            <input 
              type="number" 
              step="any"
              required 
              className="bg-[#106011]/10 border border-[#106011]/30 rounded p-2 text-sm font-mono focus:border-[#106011] outline-none"
              value={formData.lat}
              onChange={e => setFormData({...formData, lat: e.target.value})}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Longitude</span>
            <input 
              type="number" 
              step="any" 
              required 
              className="bg-[#106011]/10 border border-[#106011]/30 rounded p-2 text-sm font-mono focus:border-[#106011] outline-none"
              value={formData.lng}
              onChange={e => setFormData({...formData, lng: e.target.value})}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-400">Assign To (User ID)</span>
          <input 
            type="text" 
            className="bg-[#106011]/10 border border-[#106011]/30 rounded p-2 text-sm font-mono focus:border-[#106011] outline-none"
            value={formData.assigned_to}
            onChange={e => setFormData({...formData, assigned_to: e.target.value})}
          />
        </label>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-[#106011] text-white p-3 rounded font-mono tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#106011]/90"
        >
          <Save size={16} /> {loading ? 'SAVING...' : 'INITIALIZE DROP'}
        </button>
      </form>
    </div>
  );
}
