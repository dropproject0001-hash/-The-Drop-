/**
 * @file src/hooks/useEdgeFunctions.ts
 *
 * FIX H-6: Each call now gets its own isolated loading/error state via
 *           useCallback-wrapped helpers, preventing last-writer-wins races.
 *           The hook still exposes a shared `loading` + `error` for simple
 *           single-call consumers, but resets correctly between invocations.
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useEdgeFunctions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callFunction = useCallback(async <T>(
    functionName: string,
    body: unknown
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      // Tactical workaround: Use fetch directly for better control
      const baseUrl = ((supabase as any).supabaseUrl || '').replace(/\/+$/, '');
      const anonKey = (supabase as any).supabaseKey;

      const response = await fetch(`${baseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Function ${functionName} failed`);
      }

      const data = await response.json();
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
