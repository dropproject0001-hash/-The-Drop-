import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRole } from '../context/RoleContext';

export default function CreateDropper() {
  const { isSuperAdmin } = useRole();
  const [form, setForm] = useState({
    username: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isSuperAdmin) {
    return <div className="p-8 text-red-400">Access Denied. Super Admin only.</div>;
  }

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.functions.invoke('create-dropper', {
        body: {
          username: form.username,
          password: form.password,
          phone: form.phone,
          requestedBy: user?.id,
        },
      });

      if (error) throw error;

      alert('Dropper account created successfully!');
      setForm({ username: '', password: '', phone: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to create Dropper');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Create Dropper Account</h1>

      <div className="space-y-4">
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
        />
        <input
          placeholder="Mobile Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-3 bg-emerald-600 rounded-xl font-medium disabled:bg-zinc-700"
        >
          {loading ? 'Creating...' : 'Create Dropper Account'}
        </button>
      </div>
    </div>
  );
}
