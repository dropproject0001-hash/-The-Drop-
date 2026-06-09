import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useOTP } from '../hooks/useOTP';

export default function ClientRegistration() {
  const [alias, setAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const { otp, setOtp, loading, error, requestOTP, verifyOTP } = useOTP();

  const handleRegister = async () => {
    if (!alias || !phone) return;

    try {
      // Call Edge Function to register client
      const { data, error } = await supabase.functions.invoke('register-client', {
        body: { alias, phone },
      });

      if (error) throw error;

      // Send OTP
      await requestOTP(phone, 'client_registration');
      setStep('otp');
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  const handleVerifyOTP = async () => {
    const result = await verifyOTP(phone, otp, 'client_registration');
    if (result.success) {
      alert('Registration successful! You can now login.');
      // Redirect to login or dashboard
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Getto Regestration 🔞</h1>

        {step === 'details' && (
          <div className="space-y-5">
            <div>
              <label className="text-sm text-zinc-400">Alias / Codename</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3"
                placeholder="Ghost"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3"
                placeholder="+639171234567"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading || !alias || !phone}
              className="w-full py-3 bg-emerald-600 rounded-xl font-medium disabled:bg-zinc-700"
            >
              Register & Send OTP
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-5">
            <div>
              <label className="text-sm text-zinc-400">Enter OTP sent to {phone}</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-center text-2xl tracking-[8px]"
              />
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-emerald-600 rounded-xl font-medium disabled:bg-zinc-700"
            >
              Verify & Complete Registration
            </button>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}
