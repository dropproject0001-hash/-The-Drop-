import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function ClientRegistration() {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Step 1: Send OTP
  const sendOTP = async () => {
    if (!phoneNumber) return;

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('register-client', {
        body: { phone_number: phoneNumber },
      });

      if (error) throw error;

      setMessage('OTP sent successfully!');
      setStep('otp');
    } catch (error: any) {
      setMessage(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyOTP = async () => {
    if (!otp) return;

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone_number: phoneNumber, otp_code: otp },
      });

      if (error) throw error;

      setMessage(`Registration successful! Welcome, ${data.full_name}`);
      // Redirect to dashboard or home
    } catch (error: any) {
      setMessage(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
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
            onClick={sendOTP}
            disabled={loading || !phoneNumber}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
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
            onClick={verifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition"
          >
            {loading ? 'Verifying...' : 'Verify & Register'}
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
