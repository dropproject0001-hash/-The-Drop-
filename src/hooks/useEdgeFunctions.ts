/**
 * @file src/hooks/useEdgeFunctions.ts
 *
 * Refactored to use supabase.functions.invoke() which automatically
 * handles authentication by attaching the user's JWT.
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useEdgeFunctions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callFunction = useCallback(async <T>(
    functionName: string,
    body: Record<string, unknown>
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke(functionName, {
        body,
      });

      if (funcError) {
        throw funcError;
      }

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
      <T = { valid: boolean; errors: string[] }>(dropData: Record<string, unknown>) =>
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
