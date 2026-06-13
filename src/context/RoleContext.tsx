/**
 * RoleContext — lightweight shim over AuthContext.
 */
import { createContext, useCallback, useContext } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import type { UserRole } from '@/types/domain';

type Role = UserRole | null;

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
  const {
    role,
    loading,
    isSuperAdmin,
    isAdmin,
    isDropper,
    isClient,
    refreshProfile,
  } = useAuth();

  const refreshRole = useCallback(async (): Promise<Role> => {
    const freshProfile = await refreshProfile();
    return (freshProfile?.role ?? null) as Role;
  }, [refreshProfile]);

  const value: RoleContextType = {
    role,
    loading,
    isSuperAdmin,
    isAdmin,
    isDropper,
    isClient,
    refreshRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
