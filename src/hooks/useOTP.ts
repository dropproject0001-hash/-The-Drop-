// src/hooks/useOTP.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AndroidSmsRetriever } from '@capgo/capacitor-android-sms-retriever';

export function useOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestOTP = async (phone: string, purpose: string = 'auth') => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone, purpose },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      await startListeningForOTP();
      return { success: true };
    } catch (err: any) {
      console.error('[useOTP] requestOTP failed:', err);
      setError(err.message || 'Failed to send OTP');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (phone_number: string, otp_code: string, purpose: string = 'auth') => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone_number, otp_code, purpose },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return { success: true };
    } catch (err: any) {
      console.error('[useOTP] verifyOTP failed:', err);
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
          listener.remove();
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
