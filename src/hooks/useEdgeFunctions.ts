import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useEdgeFunctions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callFunction = async <T,>(functionName: string, body: any): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body });

      if (error) throw error;
      return data as T;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    assignRole: <T = any>(userId: string, newRole: string) => 
      callFunction<T>('assign-role', { userId, newRole }),
    
    validateDrop: <T = Record<string, any>>(dropData: any) => 
      callFunction<T>('validate-drop', { dropData }),
    
    confirmQR: <T = any>(dropId: string, qrCode: string) => 
      callFunction<T>('confirm-qr', { dropId, qrCode }),
    
    sendNotification: <T = any>(userId: string, title: string, body: string) => 
      callFunction<T>('send-notification', { userId, title, body }),
  };
}
