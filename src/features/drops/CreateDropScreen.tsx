import { useState } from 'react';
import { useEdgeFunctions } from '@/hooks/useEdgeFunctions';
import { supabase } from '@/lib/supabase';

export function CreateDropScreen() {
  const [form, setForm] = useState({
    title: '',
    lat: 0,
    lng: 0,
  });

  const { validateDrop, loading, error } = useEdgeFunctions();

  const handleCreateDrop = async () => {
    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;
      if(!userId) throw new Error("Not authenticated");

      // Step 1: Validate using Edge Function
      const validation = await validateDrop<{valid: boolean, errors: string[]}>({
        ...form,
        created_by: userId,
      });

      if (!validation.valid) {
        alert(validation.errors.join('\n'));
        return;
      }

      // Step 2: Insert into database (RLS will apply)
      const { error: insertError } = await supabase.from('drops').insert({
        title: form.title,
        lat: form.lat,
        lng: form.lng,
        created_by: userId,
        assigned_to: userId, // Placeholder default assignment
        status: 'active',
      });

      if (insertError) throw insertError;

      alert('Drop created successfully!');
    } catch (err: any) {
      alert('Error: ' + err.message);
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

      <button 
        onClick={handleCreateDrop} 
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 transition-colors text-white py-3 rounded-xl font-medium"
      >
        {loading ? 'Validating...' : 'Create Drop'}
      </button>

      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
}
