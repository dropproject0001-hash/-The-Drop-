// src/components/auth/ClientLogin.tsx
import React, { useState } from 'react';
import { useOTP } from '@/hooks/useOTP';
import { useToast } from '@/components/ui/ToastContainer';
import { useNavigate } from 'react-router-dom';
import { Phone, RefreshCw, ShieldCheck } from 'lucide-react';

export default function ClientLogin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { otp, setOtp, loading, error, requestOTP, verifyOTP } = useOTP();

  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const handleSendOTP = async () => {
    if (!phone) return;
    const result = await requestOTP(phone);
    if (result.success) {
      setStep('otp');
      showToast('Verification code sent', { type: 'success' });
    } else {
      showToast(error || 'Failed to send code', { type: 'error' });
    }
  };

  const handleVerifyOTP = async () => {
    const result = await verifyOTP(phone, otp);
    if (result.success) {
      showToast('Login successful!', { type: 'success' });
      navigate('/client');
    } else {
      showToast(error || 'Invalid code', { type: 'error' });
    }
  };

  return (
    <div className="space-y-5">
      {step === 'phone' ? (
        <>
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Phone className="w-3.5 h-3.5 text-[#0ad111]" /> Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+639171234567"
              className="w-full bg-black border-2 border-[#106011]/50 focus:border-[#0ad111] rounded-xl px-4 py-4 font-mono text-sm text-white focus:outline-none"
            />
          </div>
          <button
            onClick={handleSendOTP}
            disabled={loading || !phone}
            className="w-full py-4 bg-[#106011] hover:bg-[#168117] disabled:bg-[#106011]/20 text-white rounded-xl font-mono uppercase tracking-widest font-black text-xs transition flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            SEND VERIFICATION CODE
          </button>
        </>
      ) : (
        <>
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-2">
              Enter code sent to {phone}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="w-full bg-black border-2 border-[#106011]/60 focus:border-[#0ad111] rounded-xl px-4 py-4 text-center text-white font-mono text-3xl tracking-[12px] focus:outline-none"
            />
          </div>
          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full py-4 bg-[#106011] hover:bg-[#168117] disabled:bg-[#106011]/20 text-white rounded-xl font-mono uppercase tracking-widest font-black text-xs transition flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            VERIFY & LOGIN
          </button>
          <button onClick={() => { setStep('phone'); setOtp(''); }} className="w-full text-[10px] text-zinc-500 font-mono uppercase tracking-wider hover:text-[#0ad111] transition py-1.5">
            ← Change Phone Number
          </button>
        </>
      )}
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
    </div>
  );
}
