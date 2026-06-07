/**
 * @file src/components/layout/RoleGuard.tsx
 *
 * FIX C-3: Role type now matches the DB enum: 'super_admin' | 'admin' | 'client'.
 *           Previous version used 'superadmin' (no underscore) which never matched
 *           what the database stored, permanently locking super admins out of
 *           any RoleGuard-protected UI.
 */
import type { ReactNode } from 'react';
import type { UserRole } from '@/types/domain';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  currentRole: UserRole | null | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({
  allowedRoles,
  currentRole,
  children,
  fallback,
}: RoleGuardProps) {
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return (
      <>{fallback ?? <div className="p-4 text-red-500">Access Denied</div>}</>
    );
  }
  return <>{children}</>;
}
