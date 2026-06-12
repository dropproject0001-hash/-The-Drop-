/**
 * RoleContext — lightweight shim over AuthContext.
 *
 * FIX N-4: Previously ran its own onAuthStateChange + profiles query in
 * parallel with AuthContext, causing:
 *   - Two DB round-trips per auth event
 *   - Race between AuthContext.profile and RoleContext.role
 *   - Brief windows of inconsistent state that broke ProtectedRoute
 *
 * Now it simply reads from AuthContext (single source of truth) and
 * re-exposes the same data under the existing useRole() API so that
 * all existing call sites continue to work without changes.
 *
 * FIX Bug-4: refreshRole() returns the actual new role from the DB,
 * not the stale value from React state closure.
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

  // FIX Bug-4: fetches fresh profile, returns the new role as a value
  // so callers like handleSuccessfulLogin get the correct role immediately
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
