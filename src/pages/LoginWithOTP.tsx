import { useState } from 'react';
import { useOTP } from '@/hooks/useOTP';
import { Shield, Key, Phone, Terminal, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoginWithOTP() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const { otp, setOtp, loading, error, requestOTP, verifyOTP } = useOTP();

  const handleSendOTP = async () => {
    if (!phone) return;
    const result = await requestOTP(phone, 'login');
    if (result.success) {
      setStep('otp');
    }
  };

  const handleVerify = async () => {
    const result = await verifyOTP(phone, otp, 'login');
    if (result.success) {
      alert('Login successful! Welcome to The Drop.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-y-auto">
      {/* Background elements */}
      <div 
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none mix-blend-luminosity bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/CoverpPhoto.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/90 to-black pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 z-10">
        
        {/* Back Link to Selector */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#106011] hover:text-white uppercase tracking-widest transition-colors mb-2"
        >
          <ChevronLeft className="w-4 h-4" />
          BASE SECTOR SELECTOR
        </Link>

        {/* Outer Glowing Custom Grid Card */}
        <div className="relative bg-zinc-950/90 border-2 border-[#106011] rounded-2xl p-8 shadow-[0_0_50px_rgba(16,96,17,0.4)] overflow-hidden">
          {/* Tactical HUD Corner Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#106011] rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#106011] rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#106011] rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#106011] rounded-br-xl"></div>

          {/* Title Header */}
          <div className="text-center mb-8 space-y-2">
            <div className="flex justify-center">
              <Shield className="w-10 h-10 text-[#106011] drop-shadow-[0_0_12px_rgba(16,96,17,0.7)] animate-pulse" />
            </div>
            <h1 className="text-2xl font-display font-black tracking-[0.25em] text-white uppercase">THE DROP</h1>
            <p className="text-[10px] font-mono text-[#106011] uppercase tracking-widest font-semibold">COVERT SMS + OTP ACCESS</p>
          </div>

          {step === 'phone' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase block">PHONE NUMBER</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Phone className="w-4 h-4 text-[#106011]" />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+639XXXXXXXXX"
                    className="w-full bg-black border-2 border-zinc-800 focus:border-[#106011] rounded-xl pl-10 pr-4 py-3 text-sm font-mono tracking-wider focus:outline-none transition-colors text-white"
                  />
                </div>
                <p className="text-[8px] font-mono text-[#106011]/80 tracking-wider">ENTER OPERATIONAL MOBILE SPECIFYING PH COUNTRY CODE</p>
              </div>

              <button
                onClick={handleSendOTP}
                disabled={loading || !phone}
                className="w-full h-12 border-2 border-[#106011] rounded-xl flex items-center justify-center gap-2 font-mono text-xs font-black uppercase tracking-widest bg-[#106011]/10 text-green-400 hover:bg-[#106011]/30 shadow-md shadow-[#106011]/20 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <Terminal className="w-4 h-4" />
                {loading ? 'STATUS TRANSIST...' : 'REQUEST PASSCODE'}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase block">6-DIGIT SECURITY KEY</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full bg-black border-2 border-[#106011] rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] focus:outline-none text-white focus:ring-1 focus:ring-[#106011] placeholder:text-zinc-800"
                />
                <p className="text-[9px] font-mono text-slate-500 tracking-wider text-center uppercase">CODE FORWARDED TO LINKED PHONE: {phone}</p>
              </div>

              <button
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
                className="w-full h-12 border-2 border-[#106011] rounded-xl flex items-center justify-center gap-2 font-mono text-xs font-black uppercase tracking-widest bg-[#106011] text-white hover:bg-green-600 shadow-md shadow-[#106011]/30 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <Key className="w-4 h-4" />
                {loading ? 'DECRYPTING SECURE PASS...' : 'AUTHORIZE LOGIN SESSION'}
              </button>

              <button
                onClick={() => setStep('phone')}
                className="w-full text-[10px] font-mono text-slate-500 hover:text-white uppercase tracking-widest text-center transition-colors hover:underline block"
              >
                USE DIFFERENT PHONE TARGET
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-[11px] font-mono text-red-400 text-center uppercase tracking-wider">
              🚨 {error}
            </div>
          )}
        </div>

        {/* Footer info/creds */}
        <div className="text-center text-[9px] font-mono text-slate-600 tracking-[0.2em] uppercase select-none">
          SYSTEM LEVEL ACCESS SECURED BY EXPIRED OTP CRITERIA
        </div>
      </div>
    </div>
  );
}
