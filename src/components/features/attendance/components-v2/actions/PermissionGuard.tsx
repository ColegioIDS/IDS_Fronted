'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PermissionGuardProps {
  allowed: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  reason?: string;
}

/**
 * PermissionGuard Component
 * Wrapper component for conditional rendering based on permissions
 * Shows user-friendly message when access is denied
 */
export default function PermissionGuard({
  allowed,
  children,
  fallback,
  reason = 'No tienes permisos para acceder a esta acción',
}: PermissionGuardProps) {
  if (!allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
        <ShieldAlert className="h-4 w-4 text-yellow-800 dark:text-yellow-200" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          {reason}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
