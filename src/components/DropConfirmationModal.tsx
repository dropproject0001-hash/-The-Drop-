import { useState } from 'react';
import { useOTP } from '@/hooks/useOTP';
import { X, Shield, Lock, AlertTriangle, Terminal, Key } from 'lucide-react';

interface DropConfirmationModalProps {
  dropId: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DropConfirmationModal({ dropId, onConfirm, onClose }: DropConfirmationModalProps) {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const { otp, setOtp, loading, error, requestOTP, verifyOTP } = useOTP();

  const handleSendOTP = async () => {
    if (!phone) return;
    const result = await requestOTP(phone);
    if (result.success) {
      setStep('otp');
    }
  };

  const handleVerifyAndConfirm = async () => {
    const result = await verifyOTP(phone, otp);
    if (result.success) {
      onConfirm(); // Proceed with drop confirmation
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="relative bg-zinc-950 border-2 border-[#106011] rounded-2xl w-full max-w-md p-6 space-y-6 shadow-[0_0_50px_rgba(16,96,17,0.3)] overflow-hidden">
        {/* Glow corner brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#106011] rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#106011] rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#106011] rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#106011] rounded-br-xl"></div>

        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#106011]/30 pb-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-[#106011] animate-pulse drop-shadow-[0_0_6px_rgba(16,96,17,0.5)]" />
            <div>
              <h2 className="text-sm font-display font-black tracking-[0.15em] text-white uppercase">DROP CONFIRMATION</h2>
              <p className="text-[10px] font-mono text-[#106011] tracking-widest uppercase">OPERATIONAL CLEARANCE REQUIRED</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drop Details */}
        <div className="bg-black/80 border border-[#106011]/30 rounded-xl p-3.5 space-y-2 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">DROP REFERENCE:</span>
            <span className="text-white font-bold tracking-widest">{dropId}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-yellow-500 bg-yellow-950/15 border border-yellow-900/30 px-2 py-1.5 rounded">
            <span className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
              SENSITIVE FIELD TRANSACTION
            </span>
          </div>
        </div>

        {step === 'phone' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase block">PHONE NUMBER</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+639XXXXXXXXX"
                  className="w-full bg-black border-2 border-zinc-800 focus:border-[#106011] rounded-xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none transition-colors text-white"
                />
              </div>
              <p className="text-[9px] font-mono text-[#106011] tracking-wider">ENTER CORRESPONDING REGISTERED OPERATOR PHONE</p>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={!phone || loading}
              className="w-full h-12 border-2 border-[#106011] rounded-xl flex items-center justify-center gap-2 font-mono text-xs font-black uppercase tracking-widest bg-[#106011]/10 text-green-400 hover:bg-[#106011]/30 shadow-md shadow-[#106011]/20 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Terminal className="w-4 h-4" />
              {loading ? 'TRANSMITTING COMMAND...' : 'SEND OTP VERIFICATION'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase block">6-DIGIT OTP CODE</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                placeholder="000000"
                className="w-full bg-black border-2 border-[#106011] rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] focus:outline-none text-white focus:ring-1 focus:ring-[#106011] placeholder:text-zinc-800"
              />
              <p className="text-[9px] font-mono text-slate-500 tracking-wider text-center">OTP CODE SENT TO TELEMETRY LINK: {phone}</p>
            </div>

            <button
              onClick={handleVerifyAndConfirm}
              disabled={otp.length !== 6 || loading}
              className="w-full h-12 border-2 border-[#106011] rounded-xl flex items-center justify-center gap-2 font-mono text-xs font-black uppercase tracking-widest bg-[#106011] text-white hover:bg-green-600 shadow-md shadow-[#106011]/30 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Key className="w-4 h-4" />
              {loading ? 'KEY EXECUTION...' : 'VERIFY & SECURE LAUNCH'}
            </button>

            <button
              onClick={() => setStep('phone')}
              className="w-full text-[10px] font-mono text-[#106011] hover:text-white uppercase tracking-widest text-center transition-colors hover:underline mt-2 block"
            >
              CHANGE VERIFICATION TARGET
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-[11px] font-mono text-red-400 text-center uppercase tracking-wider">
            🚨 {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-600 tracking-widest uppercase select-none pb-1">
          <Lock className="w-3 h-3" />
          END-TO-END COVERT PROTOCOL
        </div>
      </div>
    </div>
  );
}
