import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Crosshair, Users } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';
import { AfterDropModal } from './AfterDropModal';
import { useAuth } from '@/app/providers/AuthContext';
import type { Profile } from '@/types/domain';






export function CreateDropPanel({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successDrop, setSuccessDrop] = useState<any>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    lat: '',
    lng: '',
    assigned_to: ''
  });

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('display_name', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
      } else if (data) {
        setProfiles(data);
      }
    }
    fetchProfiles();
  }, []);

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
      if (!formData.assigned_to) {
        showToast('Please select a recipient', { type: 'error' });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from('drops').insert({
        title: formData.title,
        lat,
        lng,
        assigned_to: formData.assigned_to,
        status: 'active',
        created_by: user?.id
      }).select().single();

      if (error) throw error;
      setSuccessDrop(data);
      showToast('Drop initialized successfully', { type: 'success' });
    } catch (err) {
      console.error(err);
      showToast('Failed to create drop', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (successDrop) {
    return <AfterDropModal drop={successDrop} onClose={onClose} />;
  }

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
          <span className="text-[10px] uppercase font-mono text-slate-400">Assign To Operative</span>
          <div className="relative">
            <select
              required
              className="w-full bg-[#106011]/10 border border-[#106011]/30 rounded p-2 text-sm font-mono focus:border-[#106011] outline-none appearance-none cursor-pointer"
              value={formData.assigned_to}
              onChange={e => setFormData({...formData, assigned_to: e.target.value})}
            >
              <option value="" className="bg-zinc-950">-- SELECT AGENT --</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id} className="bg-zinc-950">
                  {p.display_name || p.username || p.phone || p.id.substring(0, 8)} ({p.role})
                </option>
              ))}
            </select>
            <Users size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#106011] pointer-events-none" />
          </div>
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
