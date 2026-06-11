import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Role = 'super_admin' | 'admin' | 'dropper' | 'client' | null;

interface RoleContextType {
  role: Role;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isDropper: boolean;
  isClient: boolean;
  refreshRole: () => Promise<Role>;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  loading: true,
  isSuperAdmin: false,
  isAdmin: false,
  isDropper: false,
  isClient: false,
  refreshRole: async () => null,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async () => {
    setLoading(true);
    
    // Check for demo bypass first (DEV only)
    const demoRole = import.meta.env.DEV 
      ? (localStorage.getItem('demo_role') as Role)
      : null;
    if (demoRole) {
      setRole(demoRole);
      setLoading(false);
      return demoRole;
    }

    const { data: { user } } = await supabase.auth.getUser();
    let currentRole: Role = null;
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      currentRole = (data?.role || null) as Role;
      setRole(currentRole);
    } else {
      setRole(null);
    }
    setLoading(false);
    return currentRole;
  };

  useEffect(() => {
    // 1. Initial fetch
    fetchRole();

    // 2. Listen for auth changes to update role state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    role,
    loading,
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'admin',
    isDropper: role === 'dropper',
    isClient: role === 'client',
    refreshRole: fetchRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
