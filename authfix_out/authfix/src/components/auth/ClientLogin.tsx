/**
 * ClientLogin — OTP phone authentication for client users.
 *
 * FIX Bug-2 (race condition): Previously called navigate('/client') immediately
 * after verifyOTP resolved, before RoleContext had a chance to refresh.
 * ProtectedRoute saw role=null briefly and redirected to /auth.
 *
 * Fix: verifyOtp in AuthContext now fetches the profile inline (so the session
 * AND profile are both set before the promise resolves), then we explicitly
 * call refreshRole() to ensure RoleContext is in sync before navigating.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, RefreshCw, ShieldCheck, Key } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useRole } from '@/context/RoleContext';
import { useToast } from '@/components/ui/ToastContainer';

export default function ClientLogin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { signInWithOtp, verifyOtp } = useAuth();
  const { refreshRole } = useRole();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    const { error } = await signInWithOtp(phone.trim());
    setLoading(false);

    if (error) {
      showToast(error.message || 'Failed to send code', { type: 'error' });
    } else {
      setStep('otp');
      showToast('Verification code sent', { type: 'success' });
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setLoading(true);

    const { error, user } = await verifyOtp(phone.trim(), otp);

    if (error) {
      setLoading(false);
      showToast(error.message || 'Invalid code', { type: 'error' });
      return;
    }

    if (!user) {
      setLoading(false);
      showToast('Verification succeeded but no user returned — contact support.', { type: 'error' });
      return;
    }

    // FIX Bug-2: refreshRole() fetches fresh profile and returns the role.
    // AuthContext.verifyOtp already called fetchProfile internally, so this
    // is fast (profile is in DB). We await it so ProtectedRoute never sees
    // an intermediate role=null state.
    const freshRole = await refreshRole();
    setLoading(false);

    if (freshRole === 'client') {
      navigate('/client', { replace: true });
    } else if (freshRole === 'super_admin') {
      navigate('/super-admin', { replace: true });
    } else if (freshRole === 'admin') {
      navigate('/admin', { replace: true });
    } else if (freshRole === 'dropper') {
      navigate('/dropper', { replace: true });
    } else {
      // Authenticated but no profile/role yet — shouldn't happen if
      // the handle_new_user DB trigger is deployed, but guard anyway.
      showToast(
        'Account verified but no role assigned. Contact your administrator.',
        { type: 'error', duration: 8000 }
      );
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
              onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
              placeholder="+639171234567"
              className="w-full bg-black border-2 border-[#106011]/50 focus:border-[#0ad111] rounded-xl px-4 py-4 font-mono text-sm text-white focus:outline-none transition"
            />
          </div>
          <button
            onClick={handleSendOTP}
            disabled={loading || !phone.trim()}
            className="w-full py-4 bg-[#106011] hover:bg-[#168117] disabled:bg-[#106011]/20 text-white rounded-xl font-mono uppercase tracking-widest font-black text-xs transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Key className="w-4 h-4" />
            )}
            SEND VERIFICATION CODE
          </button>
        </>
      ) : (
        <>
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-2">
              Code sent to {phone}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && handleVerifyOTP()}
              maxLength={6}
              placeholder="••••••"
              className="w-full bg-black border-2 border-[#106011]/60 focus:border-[#0ad111] rounded-xl px-4 py-4 text-center text-white font-mono text-3xl tracking-[12px] placeholder:text-zinc-700 focus:outline-none transition"
            />
          </div>
          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full py-4 bg-[#106011] hover:bg-[#168117] disabled:bg-[#106011]/20 text-white rounded-xl font-mono uppercase tracking-widest font-black text-xs transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {loading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
          </button>
          <button
            onClick={() => { setStep('phone'); setOtp(''); }}
            className="w-full text-[10px] text-zinc-500 font-mono uppercase tracking-wider hover:text-[#0ad111] transition py-1.5"
          >
            ← Change Phone Number
          </button>
        </>
      )}
    </div>
  );
}
