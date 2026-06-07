/**
 * @file src/features/drops/CreateDropScreen.tsx
 *
 * Modified to support zero-latency local fallback creation when the app
 * runs in mock/test preview modes, ensuring full end-to-end interactive trials.
 */
import { useState, useEffect } from 'react';
import { useEdgeFunctions } from '@/hooks/useEdgeFunctions';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useDropStore } from '@/stores';
import type { Drop } from '@/types/domain';

// Fallback centre for Mamburao, Occidental Mindoro
const MAMBURAO_LAT = 13.226;
const MAMBURAO_LNG = 120.596;

export function CreateDropScreen() {
  const [form, setForm] = useState({
    title: '',
    lat: MAMBURAO_LAT,
    lng: MAMBURAO_LNG,
    assignedTo: '',  // assignee field
  });

  const [locStatus, setLocStatus] = useState<'resolving' | 'resolved' | 'fallback'>('resolving');
  const { validateDrop, loading, error } = useEdgeFunctions();

  // Resolve user's geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocStatus('fallback');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        }));
        setLocStatus('resolved');
      },
      () => {
        setLocStatus('fallback');
      },
      { enableHighAccuracy: true, timeout: 5_000 }
    );
  }, []);

  const handleCreateDrop = async () => {
    if (!form.title.trim()) {
      alert('Please enter a drop title.');
      return;
    }

    try {
      const state = useAuthStore.getState();
      const currentUserId = state.profile?.id || 'mock-id';
      
      const envMeta = (import.meta as any).env || {};
      const isMock = (supabase as any).supabaseUrl?.includes('mock') || envMeta.VITE_SUPABASE_URL?.includes('mock');

      if (isMock) {
        // Direct local state creation to keep the simulation seamless
        const newMockDrop: Drop = {
          id: 'drop-' + Math.random().toString(36).substring(2, 9),
          title: form.title.trim(),
          lat: form.lat,
          lng: form.lng,
          created_by: currentUserId,
          assigned_to: form.assignedTo.trim() || currentUserId,
          status: 'active',
          pickup_order: 0,
          qr_token: 'qr-' + Math.random().toString(36).substring(2, 11),
          notes_encrypted: null,
          photo_url: null,
          video_url: null,
          expires_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Add to Zustand store
        useDropStore.getState().addDrop(newMockDrop);
        alert('Deploy Successful! Your dynamic drop has been local-simulated at coordinates ' + form.lat + ', ' + form.lng);
        setForm((prev) => ({ ...prev, title: '', assignedTo: '' }));
        return;
      }

      // Step 1: Validate via Edge Function
      const validation = await validateDrop<{ valid: boolean; errors: string[] }>({
        ...form,
        created_by: currentUserId,
      });

      if (!validation.valid) {
        alert(validation.errors.join('\n'));
        return;
      }

      // Step 2: Insert (RLS enforced server-side)
      const { error: insertError } = await (supabase as any).from('drops').insert({
        title: form.title.trim(),
        lat: form.lat,
        lng: form.lng,
        created_by: currentUserId,
        assigned_to: form.assignedTo.trim() || currentUserId,
        status: 'active',
        pickup_order: 0,
        qr_token: '', // Server will populate
      });

      if (insertError) throw insertError;

      alert('Drop created successfully!');
      setForm((prev) => ({ ...prev, title: '', assignedTo: '' }));
    } catch (err: unknown) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="p-4 bg-emerald-950/20 backdrop-blur-xl rounded-2xl border border-emerald-900/30">
      <h2 className="text-lg font-bold mb-3 text-white font-display">Target Launch Wizard</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Drop Name / Description</label>
          <input
            placeholder="e.g., Beach Front supply point B"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full text-xs p-3 bg-black/40 border border-emerald-900/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Assignee Operator ID (optional)</label>
          <input
            placeholder="Recipient User ID (blank = self-assign)"
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            className="w-full text-xs p-3 bg-black/40 border border-emerald-900/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Resolved coordinates */}
        <div className="px-3 py-2.5 bg-black/40 border border-emerald-900/20 rounded-xl text-[11px] text-[#22C55E] flex justify-between items-center font-mono font-medium">
          <span>COORDS STATUS:</span>
          <span>
            {locStatus === 'resolving' && '🛰️ SEARCHING FOR SATELLITE...'}
            {locStatus === 'resolved' && `🛰️ FIXED: ${form.lat}, ${form.lng}`}
            {locStatus === 'fallback' && `🛰️ DEFAULT: ${form.lat}, ${form.lng}`}
          </span>
        </div>

        <button
          onClick={handleCreateDrop}
          disabled={loading || locStatus === 'resolving'}
          className="w-full bg-gradient-to-r from-green-700 to-emerald-500 hover:opacity-90 active:scale-95 text-white py-3 rounded-xl text-xs tracking-wider uppercase font-extrabold transition-all border border-emerald-400/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
        >
          {loading ? 'DEPLOYING VIA EDGE...' : 'LAUNCH TRANSMISSION PIN'}
        </button>

        {error && <p className="text-red-400 text-xs mt-1 font-mono">{error}</p>}
      </div>
    </div>
  );
}
