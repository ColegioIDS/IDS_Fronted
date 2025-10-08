'use client';

import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface ProtectedNavItemProps {
  children: ReactNode;
  requiredPermission?: {
    module: string;
    action: string;
  };
  requiredAnyPermissions?: Array<{
    module: string;
    action: string;
  }>;
  fallback?: ReactNode;
}

export const ProtectedNavItem = ({
  children,
  requiredPermission,
  requiredAnyPermissions,
  fallback = null,
}: ProtectedNavItemProps) => {
  const { hasPermission, hasAnyPermission, isLoading } = useAuth();

  // Mientras carga, no mostrar nada (evita flicker)
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Si requiere un permiso específico
  if (requiredPermission) {
    const { module, action } = requiredPermission;
    if (!hasPermission(module, action)) {
      return <>{fallback}</>;
    }
  }

  // Si requiere al menos uno de varios permisos
  if (requiredAnyPermissions && requiredAnyPermissions.length > 0) {
    if (!hasAnyPermission(requiredAnyPermissions)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};