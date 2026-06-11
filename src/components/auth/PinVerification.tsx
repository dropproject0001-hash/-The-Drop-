import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PinVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
  role: string;
}

export function PinVerification({ onSuccess, onCancel, role }: PinVerificationProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Fetch PIN from Supabase (recommended: store in a secure settings table)
      const { data, error: fetchError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', `${role}_pin`)
        .single();

      if (fetchError || !data) {
        throw new Error('PIN configuration not found');
      }

      if (pin === data.value) {
        onSuccess();
      } else {
        setError('Invalid PIN');
        setPin('');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-zinc-950 border border-[#106011] rounded-2xl p-8 w-full max-w-sm">
        <h2 className="text-xl font-mono tracking-widest text-[#106011] mb-2">SECURE ACCESS</h2>
        <p className="text-sm text-zinc-400 mb-6">Enter 6-digit PIN for <span className="text-white">{role}</span></p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-black border border-zinc-700 text-center text-3xl tracking-[12px] py-4 rounded-xl font-mono focus:border-[#106011] outline-none"
            placeholder="••••••"
          />

          {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onCancel} className="flex-1 py-3 border border-zinc-700 rounded-xl">
              CANCEL
            </button>
            <button 
              type="submit" 
              disabled={pin.length !== 6 || loading}
              className="flex-1 py-3 bg-[#106011] hover:bg-emerald-700 disabled:bg-zinc-700 rounded-xl font-bold text-black"
            >
              {loading ? 'VERIFYING...' : 'VERIFY PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
