import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { useOTP } from '@/hooks/useOTP';

export function ClientRegistration() {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const {
    otp,
    setOtp,
    loading: otpLoading,
    error: otpError,
    requestOTP,
    verifyOTP,
  } = useOTP();

  // Sync error messages from hook if they change
  useEffect(() => {
    if (otpError) {
      setMessage(otpError);
    }
  }, [otpError]);

  // Handle Send OTP
  const handleSendOTP = async () => {
    if (!phoneNumber) return;

    setMessage('');
    const result = await requestOTP(phoneNumber, 'login');
    if (result.success) {
      if (result.mock) {
        setMessage('OTP sent successfully! Enter 123456 as code.');
      } else {
        setMessage('OTP sent successfully! Checking for incoming SMS...');
      }
      setStep('otp');
    } else {
      setMessage(otpError || 'Failed to send OTP');
    }
  };

  // Handle Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp) return;

    setMessage('');
    const result = await verifyOTP(phoneNumber, otp, 'login');
    if (result.success) {
      // Create session for user
      const mockId = 'client-' + Math.random().toString(36).substr(2, 9);
      useAuthStore.getState().setSession({ user: { id: mockId }, access_token: 'mock', refresh_token: 'mock' });
      useAuthStore.getState().setProfile({
        id: mockId,
        role: 'client',
        display_name: `Client (${phoneNumber})`,
        avatar_url: null,
        is_online: true,
        last_seen: new Date().toISOString(),
        push_endpoint: null,
        push_keys: null,
        created_at: new Date().toISOString()
      });
      setMessage('Registration successful! Welcome to The Drop!');
    } else {
      setMessage(otpError || 'Invalid or expired OTP');
    }
  };



  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg text-slate-100">
      <h2 id="client-registration-header" className="text-2xl font-bold mb-6 text-center text-white">Getto Regestration</h2>

      {step === 'mobile' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Mobile Number</label>
            <input
              type="tel"
              placeholder="+639XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <button
            onClick={handleSendOTP}
            disabled={otpLoading || !phoneNumber}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition"
          >
            {otpLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Enter 6-digit OTP</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-center text-2xl tracking-widest focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="123456"
            />
          </div>

          <button
            onClick={handleVerifyOTP}
            disabled={otpLoading || otp.length !== 6}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition"
          >
            {otpLoading ? 'Verifying...' : 'Verify & Register'}
          </button>

          <button
            onClick={() => setStep('mobile')}
            className="w-full text-sm text-slate-400 hover:text-slate-300 transition"
          >
            Change mobile number
          </button>
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-center text-slate-300">
          {message}
        </div>
      )}
    </div>
  );
}
