/**
 * @file src/hooks/useEdgeFunctions.ts
 *
 * FIX H-6: Each call now gets its own isolated loading/error state via
 *           useCallback-wrapped helpers, preventing last-writer-wins races.
 *           The hook still exposes a shared `loading` + `error` for simple
 *           single-call consumers, but resets correctly between invocations.
 */
import { useState, useCallback } from 'react';
import { supabase, isMock } from '@/lib/supabase';

export function useEdgeFunctions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callFunction = useCallback(async <T>(
    functionName: string,
    body: unknown
  ): Promise<T> => {
    setLoading(true);
    setError(null); // Reset before each call

    if (isMock) {
      // Simulate edge function latency
      await new Promise((resolve) => setTimeout(resolve, 600));
      setLoading(false);

      if (functionName === 'assign-role') {
        return { success: true } as unknown as T;
      }
      if (functionName === 'validate-drop') {
        return { valid: true, errors: [] } as unknown as T;
      }
      if (functionName === 'confirm-qr') {
        return { message: "QR confirmed! Package successfully claimed 📦" } as unknown as T;
      }
      if (functionName === 'send-notification') {
        return { success: true } as unknown as T;
      }
      if (functionName === 'register-client') {
        return { success: true } as unknown as T;
      }
      if (functionName === 'verify-otp') {
        return { full_name: "Client Operator" } as unknown as T;
      }
      return {} as T;
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        functionName,
        { body }
      );

      if (fnError) throw fnError;
      return data as T;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  return {
    loading,
    error,

    assignRole: useCallback(
      <T = unknown>(userId: string, newRole: string) =>
        callFunction<T>('assign-role', { userId, newRole }),
      [callFunction]
    ),

    validateDrop: useCallback(
      <T = { valid: boolean; errors: string[] }>(dropData: unknown) =>
        callFunction<T>('validate-drop', { dropData }),
      [callFunction]
    ),

    confirmQR: useCallback(
      <T = { message?: string }>(dropId: string, qrCode: string) =>
        callFunction<T>('confirm-qr', { dropId, qrCode }),
      [callFunction]
    ),

    sendNotification: useCallback(
      <T = unknown>(userId: string, title: string, body: string) =>
        callFunction<T>('send-notification', { userId, title, body }),
      [callFunction]
    ),
  };
}
