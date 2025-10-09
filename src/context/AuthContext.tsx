// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { verifySession, logout as apiLogout, getMyPermissions } from '@/services/authService';
import { UserPermission } from '@/types/permissions';
import { usePathname, useRouter } from 'next/navigation';

interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  role?: { id: number; name: string }; // ✅ Agregar role aquí
}

interface AuthContextProps {
  user: User | null;
  permissions: UserPermission[];
  role: { id: number; name: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: (force?: boolean) => Promise<void>;
  hasPermission: (module: string, action: string) => boolean; // ✅ Nuevo método
  hasAnyPermission: (checks: Array<{ module: string; action: string }>) => boolean; // ✅ Nuevo método
  getPermissionScope: (module: string, action: string) => string | null; // ✅ Nuevo método
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  permissions: [],
  role: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  hasPermission: () => false,
  hasAnyPermission: () => false,
  getPermissionScope: () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [role, setRole] = useState<{ id: number; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const loadPermissions = useCallback(async () => {
    try {
      const data = await getMyPermissions();
      setPermissions(data.permissions);
      setRole(data.role);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
      setRole(null);
    }
  }, []);

  const checkAuth = useCallback(async (force = false) => {
    setIsLoading(true);
    
    if (!force && Date.now() - lastCheck < 5 * 60 * 1000) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await verifySession();
      setUser(userData);
      setLastCheck(Date.now());
      
      await loadPermissions();
      
      if (['/signin', '/signup'].includes(pathname) && userData) {
        router.replace('/dashboard');
      }
    } catch (error) {
      setUser(null);
      setPermissions([]);
      setRole(null);
      setLastCheck(0);
      
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
        router.replace('/signin');
      }
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router, lastCheck, loadPermissions]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (userData: User) => {
    setUser(userData);
    setLastCheck(Date.now());
    await loadPermissions();
    router.replace('/dashboard');
  }, [router, loadPermissions]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
      setUser(null);
      setPermissions([]);
      setRole(null);
      setLastCheck(0);
      router.replace('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router]);

  // ✅ NUEVOS MÉTODOS DE PERMISOS
  const hasPermission = useCallback((module: string, action: string): boolean => {
    if (!permissions || permissions.length === 0) return false;
    
    return permissions.some(
      (p) => p.module === module && p.action === action
    );
  }, [permissions]);

  const hasAnyPermission = useCallback((checks: Array<{ module: string; action: string }>): boolean => {
    return checks.some(({ module, action }) => hasPermission(module, action));
  }, [hasPermission]);

  const getPermissionScope = useCallback((module: string, action: string): string | null => {
    const permission = permissions?.find(
      (p) => p.module === module && p.action === action
    );
    return permission?.scope || null;
  }, [permissions]);

  // ✅ Actualizar el user con el role cuando se cargue
  useEffect(() => {
    if (user && role && !user.role) {
      setUser((prev) => prev ? { ...prev, role } : null);
    }
  }, [role, user]);

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
      role,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      checkAuth,
      hasPermission,
      hasAnyPermission,
      getPermissionScope,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);