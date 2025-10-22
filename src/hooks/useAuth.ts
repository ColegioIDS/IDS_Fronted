// src/hooks/useAuth.ts
import { useAuth as useAuthContext } from '@/context/AuthContext';

export const useAuth = () => {
  const context = useAuthContext();

  const hasPermission = (module: string, action: string): boolean => {
    if (!context.permissions || context.permissions.length === 0) return false;
    
    return context.permissions.some(
      (p) => p.module === module && p.action === action
    );
  };

  const hasAnyPermission = (checks: Array<{ module: string; action: string }>): boolean => {
    return checks.some(({ module, action }) => hasPermission(module, action));
  };

  const getPermissionScope = (module: string, action: string): string | null => {
    const permission = context.permissions?.find(
      (p) => p.module === module && p.action === action
    );
    return permission?.scope || null;
  };

  return {
    ...context,
    hasPermission,
    hasAnyPermission,
    getPermissionScope,
  };
};