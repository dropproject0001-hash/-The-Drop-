import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AndroidSmsRetriever } from '@capgo/capacitor-android-sms-retriever';

export function useOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestOTP = async (phone: string, purpose: string = 'general') => {
    setLoading(true);
    setError(null);

    // If Supabase is not configured (or we are in mock mode for development),
    // we bypass with a delay and return success.
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Start mock SMS retriever simulation
      setOtp('123456');
      return { success: true, mock: true };
    }

    try {
      // We invoke the send-otp edge function
      const { data, error: fnError } = await supabase.functions.invoke('send-otp', {
        body: { phone, purpose },
      });

      if (fnError) throw fnError;

      // Start listening for SMS on Android (fails gracefully on standard browsers)
      await startListeningForOTP();

      return { success: true, mock: false };
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const startListeningForOTP = async () => {
    try {
      if (!AndroidSmsRetriever) {
        console.warn('[OTP] AndroidSmsRetriever is not defined. We are likely on web.');
        return;
      }

      // Check if startWatch exists before calling to prevent runtime crashes on web
      if (typeof AndroidSmsRetriever.startWatch !== 'function') {
        console.warn('[OTP] AndroidSmsRetriever.startWatch is not available on this platform.');
        return;
      }

      const listener = await AndroidSmsRetriever.addListener('smsReceived', (event: any) => {
        const message: string = event.message || '';
        const match = message.match(/\b\d{6}\b/);
        if (match) {
          setOtp(match[0]);
        }
      });

      await AndroidSmsRetriever.startWatch();

      // Auto stop after 5 minutes
      setTimeout(() => {
        try {
          AndroidSmsRetriever.stopWatch();
          listener.remove();
        } catch (e) {
          // ignore
        }
      }, 5 * 60 * 1000);
    } catch (err) {
      console.warn('[OTP] SMS Retriever not available or error:', err);
    }
  };

  const verifyOTP = async (phone: string, code: string, purpose: string) => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (code === '123456') {
        return { success: true };
      } else {
        setError('Invalid OTP code. Try entering 123456.');
        return { success: false };
      }
    }

    try {
      const { data, error } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .eq('purpose', purpose)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error('Invalid or expired OTP');
      }

      // Mark as used
      const { error: updateError } = await supabase
        .from('otp_codes')
        .update({ used: true })
        .eq('id', data.id);

      if (updateError) throw updateError;

      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    otp,
    setOtp,
    loading,
    error,
    requestOTP,
    verifyOTP,
  };
}
