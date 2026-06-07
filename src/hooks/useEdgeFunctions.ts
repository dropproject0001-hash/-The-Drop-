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
    assignRole: (userId: string, newRole: string) => 
      callFunction('assign-role', { userId, newRole }),
    
    validateDrop: (dropData: any) => 
      callFunction('validate-drop', { dropData }),
    
    confirmQR: (dropId: string, qrCode: string) => 
      callFunction('confirm-qr', { dropId, qrCode }),
    
    sendNotification: (userId: string, title: string, body: string) => 
      callFunction('send-notification', { userId, title, body }),
  };
}
