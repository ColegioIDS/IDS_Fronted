// src/hooks/usePermissions.ts
import { useAuth } from './useAuth';
import { useMemo } from 'react';

export function usePermissions() {
  const { permissions, hasPermission, hasAnyPermission, getPermissionScope } = useAuth();

  // ✅ Verificar múltiples permisos
  const can = useMemo(
    () => ({
      create: (module: string) => hasPermission(module, 'create'),
      read: (module: string) => hasPermission(module, 'read'),
      update: (module: string) => hasPermission(module, 'update'),
      delete: (module: string) => hasPermission(module, 'delete'),
      
      // Verificar custom action
      do: (module: string, action: string) => hasPermission(module, action),
    }),
    [hasPermission]
  );

  // ✅ Get all permissions for a module
  const getModulePermissions = (module: string) => {
    return permissions.filter((p) => p.module === module);
  };

  // ✅ Check if user has full access to module
  const hasFullAccess = (module: string) => {
    const actions = ['create', 'read', 'update', 'delete'];
    return actions.every((action) => hasPermission(module, action));
  };

  return {
    permissions,
    can,
    hasPermission,
    hasAnyPermission,
    getPermissionScope,
    getModulePermissions,
    hasFullAccess,
  };
}