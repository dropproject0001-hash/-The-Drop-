import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Role = 'super_admin' | 'dropper' | 'client' | null;

interface RoleContextType {
  role: Role;
  loading: boolean;
  isSuperAdmin: boolean;
  isDropper: boolean;
  isClient: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  loading: true,
  isSuperAdmin: false,
  isDropper: false,
  isClient: false,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setRole(data?.role || null);
      }
      setLoading(false);
    };

    fetchRole();
  }, []);

  const value = {
    role,
    loading,
    isSuperAdmin: role === 'super_admin',
    isDropper: role === 'dropper',
    isClient: role === 'client',
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
