// src/hooks/useOTP.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AndroidSmsRetriever } from '@capgo/capacitor-android-sms-retriever';

export function useOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestOTP = async (phone: string, purpose: string = 'login') => {
    setLoading(true);
    setError(null);

    try {
      // Use custom Edge Function instead of built-in Supabase Auth OTP
      // to avoid "Unsupported phone provider" errors and use our Twilio config.
      const { data, error: invokeError } = await supabase.functions.invoke('send-otp', {
        body: {
          phone: phone,
          purpose: purpose
        }
      });

      if (invokeError) {
        let errorMsg = invokeError.message;
        if (invokeError.context && typeof invokeError.context.json === 'function') {
          try {
             const errData = await invokeError.context.json();
             if (errData && errData.error) errorMsg = errData.error;
          } catch(e) {}
        }
        throw new Error(errorMsg);
      }
      if (data?.error) throw new Error(data.error);

      await startListeningForOTP();
      return { success: true };
    } catch (err: any) {
      console.error('[useOTP] requestOTP error:', err);
      setError(err.message || 'Failed to send OTP');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (phone: string, code: string, purpose: string = 'login') => {
    setLoading(true);
    setError(null);

    try {
      // Use custom Edge Function for verification
      const { data, error: invokeError } = await supabase.functions.invoke('verify-otp', {
        body: {
          phone_number: phone,
          otp_code: code,
          purpose: purpose
        }
      });

      if (invokeError) {
        let errorMsg = invokeError.message;
        if (invokeError.context && typeof invokeError.context.json === 'function') {
          try {
             const errData = await invokeError.context.json();
             if (errData && errData.error) {
               errorMsg = errData.error;
               if (errData.attempts_remaining !== undefined) {
                 errorMsg += ` (${errData.attempts_remaining} attempts left)`;
               }
             }
          } catch(e) {}
        }
        throw new Error(errorMsg);
      }
      if (data?.error) throw new Error(data.error);

      // Note: verify-otp currently just returns success.
      // In a real flow, it might return a session or we might need to sign in.
      // Since our auth model for clients is currently "profile-based" or mock-based,
      // we return success here.

      return { success: true, data };
    } catch (err: any) {
      console.error('[useOTP] verifyOTP error:', err);
      setError(err.message || 'Invalid OTP code');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const startListeningForOTP = async () => {
    try {
      if (!AndroidSmsRetriever || typeof AndroidSmsRetriever.startWatch !== 'function') return;

      const listener = await AndroidSmsRetriever.addListener('smsReceived', (event: any) => {
        const message = event.message || '';
        const match = message.match(/\b\d{6}\b/);
        if (match) setOtp(match[0]);
      });

      await AndroidSmsRetriever.startWatch();

      setTimeout(() => {
        try {
          AndroidSmsRetriever.stopWatch();
          listener?.remove();
        } catch (_) {}
      }, 5 * 60 * 1000);
    } catch (err) {
      console.warn('[OTP] SMS Retriever error:', err);
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
