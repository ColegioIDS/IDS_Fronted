// src/components/shared/permissions/ProtectedContent.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { NoPermissionCard } from './NoPermissionCard';
import { ReactNode } from 'react';

interface ProtectedContentProps {
  module: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
  hideOnNoPermission?: boolean; // Si true, no muestra nada (ni el fallback)
}

export function ProtectedContent({
  module,
  action,
  children,
  fallback,
  hideOnNoPermission = false,
}: ProtectedContentProps) {
  const { hasPermission, isLoading } = useAuth();

  // Mientras carga, mostrar skeleton o null
  if (isLoading) {
    return hideOnNoPermission ? null : <div className="animate-pulse h-20 bg-gray-200 rounded" />;
  }

  const hasAccess = hasPermission(module, action);

  if (!hasAccess) {
    if (hideOnNoPermission) return null;
    return fallback || <NoPermissionCard module={module} action={action} />;
  }

  return <>{children}</>;
}