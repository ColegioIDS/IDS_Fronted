// src/components/layout/AdminLayoutWrapper.tsx

'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NoPermissionsAssigned } from '@/components/shared/permissions/NoPermissionsAssigned';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper que verifica si el usuario tiene permisos
 * Si no tiene permisos, muestra la página de "Sin Permisos"
 * Si tiene permisos, muestra el contenido normal
 */
export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const { permissions, isLoading } = useAuth();

  // Mostrar nada mientras carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-gray-300 border-t-brand-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  // Si no tiene permisos, mostrar página especial
  if (!permissions || permissions.length === 0) {
    return (
      <NoPermissionsAssigned
        userName={permissions && permissions.length > 0 ? "Usuario" : "Usuario"}
      />
    );
  }

  // Si tiene permisos, mostrar contenido normal
  return <>{children}</>;
}
