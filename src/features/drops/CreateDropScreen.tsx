/**
 * @file src/features/drops/CreateDropScreen.tsx
 *
 * FIX H-5: lat/lng now default to the user's geolocation (or fall back to
 *           Mamburao centre) rather than 0,0 (Gulf of Guinea).
 * FIX M-8: Added a basic assignee field so drops are not silently self-assigned.
 *           Replace the text input with a proper user-picker once the profiles
 *           query is wired up.
 */
import { useState, useEffect } from 'react';
import { useEdgeFunctions } from '@/hooks/useEdgeFunctions';
import { supabase, isMock } from '@/lib/supabase';

// Fallback centre for Mamburao, Occidental Mindoro
const MAMBURAO_LAT = 13.226;
const MAMBURAO_LNG = 120.596;

export function CreateDropScreen() {
  const [form, setForm] = useState({
    title: '',
    lat: MAMBURAO_LAT,
    lng: MAMBURAO_LNG,
    assignedTo: '',  // FIX M-8: assignee field
  });

  const [locStatus, setLocStatus] = useState<'resolving' | 'resolved' | 'fallback'>('resolving');
  const { validateDrop, loading, error } = useEdgeFunctions();

  // FIX H-5: Resolve user's geolocation on mount
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
        // Fall back to Mamburao centre
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

    if (isMock) {
      alert('Drop created successfully (Mock mode)! It has been rendered locally.');
      setForm((prev) => ({ ...prev, title: '', assignedTo: '' }));
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Step 1: Validate via Edge Function
      const validation = await validateDrop<{ valid: boolean; errors: string[] }>({
        ...form,
        created_by: user.id,
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
        created_by: user.id,
        // FIX M-8: use provided assignee or fall back to self (explicitly)
        assigned_to: form.assignedTo.trim() || user.id,
        status: 'active',
        pickup_order: 0,
        qr_token: '', // Server/DB will populate via DEFAULT
      });

      if (insertError) throw insertError;

      alert('Drop created successfully!');
      setForm((prev) => ({ ...prev, title: '', assignedTo: '' }));
    } catch (err: unknown) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="p-4 bg-card rounded-2xl shadow-sm border border-slate-800">
      <h2 className="text-xl font-bold mb-4 text-white">Create New Drop</h2>

      <input
        placeholder="Drop Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl mb-3 text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />

      {/* FIX M-8: Assignee input */}
      <input
        placeholder="Assignee User ID (leave blank to assign to self)"
        value={form.assignedTo}
        onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl mb-3 text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
      />

      {/* FIX H-5: Show resolved coordinates */}
      <div className="mb-3 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-400">
        {locStatus === 'resolving' && '📍 Resolving your location…'}
        {locStatus === 'resolved' && `📍 Your location: ${form.lat}, ${form.lng}`}
        {locStatus === 'fallback' && `📍 Using Mamburao centre: ${form.lat}, ${form.lng}`}
      </div>

      <button
        onClick={handleCreateDrop}
        disabled={loading || locStatus === 'resolving'}
        className="w-full bg-primary hover:bg-primary/90 transition-colors text-white py-3 rounded-xl font-medium disabled:opacity-60"
      >
        {loading ? 'Validating…' : 'Create Drop'}
      </button>

      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
}
