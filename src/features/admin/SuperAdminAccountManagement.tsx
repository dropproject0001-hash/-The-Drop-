import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function SuperAdminAccountManagement() {
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'client'>('admin');
  const [message, setMessage] = useState('');
  const [suspendId, setSuspendId] = useState('');

  const createAccount = async () => {
    const { error } = await (supabase as any).from('profiles').insert({
      phone_number: phone,
      role,
      is_verified: true,
    });

    setMessage(error ? `Error: ${error.message}` : `${role} account created successfully`);
    if (!error) setPhone('');
  };

  const suspendAccount = async (userId: string) => {
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ suspended: true })
      .eq('id', userId);

    setMessage(error ? error.message : 'Account suspended successfully');
    if (!error) setSuspendId('');
  };

  return (
    <div className="p-6 max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-white">Super Admin Panel</h2>

      {/* Create Account */}
      <div className="mb-8">
        <h3 className="font-semibold mb-3 text-slate-200">Create Account</h3>
        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mb-3 p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="w-full mb-3 p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-slate-100"
        >
          <option value="admin">Admin</option>
          <option value="client">Client</option>
        </select>
        <button onClick={createAccount} className="w-full bg-primary text-white hover:bg-primary/90 transition py-3 rounded-xl font-medium">
          Create Account
        </button>
      </div>

      {/* Suspend Account */}
      <div>
        <h3 className="font-semibold mb-3 text-slate-200">Suspend Account</h3>
        <p className="text-sm text-slate-400 mb-2">Enter User ID to suspend:</p>
        <input 
          placeholder="User ID" 
          value={suspendId}
          onChange={(e) => setSuspendId(e.target.value)}
          className="w-full mb-3 p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none" 
        />
        <button 
          onClick={() => suspendAccount(suspendId)} 
          disabled={!suspendId}
          className="w-full bg-red-600/90 hover:bg-red-500 text-white py-3 rounded-xl transition font-medium disabled:opacity-50"
        >
          Suspend Account
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-center text-primary">{message}</p>}
    </div>
  );
}
