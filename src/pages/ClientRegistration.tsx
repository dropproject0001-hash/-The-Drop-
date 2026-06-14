import { useState } from 'react';
import { useOTP } from '@/hooks/useOTP';
import { useToast } from '@/components/ui/ToastContainer';
import { useNavigate } from 'react-router-dom';
import { supabase, isMock } from '@/lib/supabase';
import { useAuthStore } from '@/stores';

export default function ClientRegistration() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { otp, setOtp, loading, error, requestOTP, verifyOTP } = useOTP();

  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const handleSendOTP = async () => {
    if (!phone) return;

    if (!isMock) {
        try {
            await supabase.functions.invoke('register-client', {
                body: { phone_number: phone }
            });
        } catch (err) {
            console.warn('Registration edge function call failed:', err);
        }
    }

    const result = await requestOTP(phone);
    if (result.success) {
      setStep('otp');
      showToast('OTP sent successfully', { type: 'success' });
    } else {
      showToast(error || 'Failed to send OTP', { type: 'error' });
    }
  };

  const handleVerifyOTP = async () => {
    const result = await verifyOTP(phone, otp);
    if (result.success) {
      if (!isMock) {
          await supabase.auth.refreshSession();
      } else {
          useAuthStore.getState().setProfile({
              id: 'mock-client',
              role: 'client',
              display_name: 'Mock Client',
              phone: phone
          } as any);
      }
      showToast('Registration successful!', { type: 'success' });
      navigate('/');
    } else {
      showToast(error || 'Invalid OTP', { type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-white">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Client Registration</h1>

        {step === 'phone' && (
          <div className="space-y-5">
            <div>
              <label className="text-sm text-zinc-400">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+639171234567"
                className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3"
              />
            </div>
            <button
              onClick={handleSendOTP}
              disabled={loading || !phone}
              className="w-full py-3 bg-emerald-600 rounded-xl font-medium disabled:bg-zinc-700 font-mono tracking-widest text-black"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-5">
            <div>
              <label className="text-sm text-zinc-400">Enter 6-digit OTP</label>
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
              className="w-full py-3 bg-emerald-600 rounded-xl font-medium disabled:bg-zinc-700 font-mono tracking-widest text-black"
            >
              {loading ? 'Verifying...' : 'Verify & Register'}
            </button>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}
