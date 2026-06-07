import { ReactNode } from 'react';

type Role = 'tanod' | 'admin' | 'superadmin';

interface RoleGuardProps {
  allowedRoles: Role[];
  currentRole: Role;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, currentRole, children, fallback }: RoleGuardProps) {
  if (!allowedRoles.includes(currentRole)) {
    return <>{fallback || <div className="p-4 text-red-500">Access Denied</div>}</>;
  }
  return <>{children}</>;
}
