// src/components/shared/permissions/ProtectedPage.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { NoPermissionCard } from './NoPermissionCard';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedPageProps {
  module: string;
  action: string;
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedPage({
  module,
  action,
  children,
  redirectTo,
}: ProtectedPageProps) {
  const { hasPermission, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !hasPermission(module, action) && redirectTo) {
      router.push(redirectTo);
    }
  }, [isLoading, hasPermission, module, action, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasPermission(module, action)) {
    return <NoPermissionCard module={module} action={action} variant="page" />;
  }

  return <>{children}</>;
}