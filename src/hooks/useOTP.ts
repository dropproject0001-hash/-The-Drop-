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
      // Tactical workaround: Use fetch directly for better control
      const baseUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
      const anonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

      let appHash = '';
      if (AndroidSmsRetriever && typeof AndroidSmsRetriever.getHashString === 'function') {
        try {
          const { hash } = await AndroidSmsRetriever.getHashString();
          appHash = hash;
        } catch (e) {
          console.warn('[OTP] Could not get app hash string', e);
        }
      }

      const response = await fetch(`${baseUrl}/functions/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ phone, purpose, appHash }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }

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

    // If Supabase is not configured, fallback to mock verification
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
      // Tactical workaround: Use fetch directly for better control
      const baseUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
      const anonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

      const response = await fetch(`${baseUrl}/functions/v1/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ phone_number: phone, otp_code: code, purpose }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }
      
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
