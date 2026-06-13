import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useOTP } from '@/hooks/useOTP';
import { useToast } from '@/components/ui/ToastContainer';

export function ClientRegistration() {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [alias, setAlias] = useState('');
  const [message, setMessage] = useState('');
  const { showToast } = useToast();

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
    if (!phoneNumber || !alias) {
      setMessage('Please enter both codename and mobile number.');
      return;
    }

    setMessage('');
    
    // First, register the client via Edge Function
    try {
      const { error } = await supabase.functions.invoke('register-client', {
        body: {
          alias,
          phone_number: phoneNumber
        }
      });
      
      if (error && !error.message?.includes('already registered')) {
        console.warn('Registration might have failed, attempting OTP anyway:', error);
      }
    } catch (err: any) {
      console.warn('Edge function invoke failed:', err);
    }

    // Now request OTP
    const result = await requestOTP(phoneNumber);
    if (result.success) {
      showToast('OTP sent successfully!', { type: 'success' });
      setStep('otp');
    } else {
      setMessage(otpError || 'Failed to send OTP');
    }
  };

  // Handle Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp) return;

    setMessage('');
    const result = await verifyOTP(phoneNumber, otp);
    if (result.success) {
      showToast('Registration successful! Redirecting...', { type: 'success' });
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } else {
      setMessage(otpError || 'Invalid or expired OTP');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg text-slate-100">
      <h2 id="client-registration-header" className="text-2xl font-bold mb-6 text-center text-white">Client Registration</h2>

      {step === 'mobile' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Alias (Codename)</label>
            <input
              type="text"
              placeholder="e.g. Ghost"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
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
            disabled={otpLoading || !phoneNumber || !alias}
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
