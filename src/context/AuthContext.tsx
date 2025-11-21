// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { verifySession, logout as apiLogout, getMyPermissions } from '@/services/authService';
import { UserPermission } from '@/types/permissions';
import { usePathname, useRouter } from 'next/navigation';

// ✅ ACTUALIZADO: Role con permissions
interface Role {
  id: number;
  name: string;
  permissions?: Array<{
    permissionId: number;
    scope: 'all' | 'own' | 'grade';
    permission?: {
      id: number;
      module: string;
      action: string;
    };
  }>;
}

interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  role?: Role; // ✅ ACTUALIZADO: Ahora es Role completo con permissions
}

interface AuthContextProps {
  user: User | null;
  permissions: UserPermission[];
  role: Role | null; // ✅ ACTUALIZADO
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: (force?: boolean) => Promise<void>;
  hasPermission: (module: string, action: string) => boolean;
  hasAnyPermission: (checks: Array<{ module: string; action: string }>) => boolean;
  getPermissionScope: (module: string, action: string) => string | null;
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
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const loadPermissions = useCallback(async () => {
    try {
      const data = await getMyPermissions();
      setPermissions(data.permissions);
      
      // ✅ ACTUALIZADO: Ahora setRole recibe Role con permissions
      if (data.role) {
  const roleWithPermissions: Role = {
    id: data.role.id,
    name: data.role.name,
    permissions: data.permissions.map((p: UserPermission, index: number) => ({
      permissionId: index,
      scope: (p.scope as 'all' | 'own' | 'grade'),
      permission: {
        id: index,
        module: p.module,
        action: p.action,
      },
    })),
  };
  setRole(roleWithPermissions);
}
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
      setRole(null);
    }
  }, []);

  const checkAuth = useCallback(
  async (force = false) => {
    // Si ya verificamos recientemente, no volver a hacerlo
    if (!force && user && Date.now() - lastCheck < 5 * 60 * 1000) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Verificando autenticación...');
      const userData = await verifySession();
      console.log("✅ Usuario verificado:", userData);
      setUser(userData);
      setLastCheck(Date.now());
      await loadPermissions();
    } catch (error) {
      console.error("❌ Verificación fallida:", error);
      setUser(null);
      setPermissions([]);
      setRole(null);
      setLastCheck(0);
      
      // ✅ Limpiar cookie inválida si existe
      if (typeof window !== 'undefined') {
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } finally {
      setIsLoading(false);
    }
  },
  [user, lastCheck, loadPermissions]
);  useEffect(() => {
    // ✅ IMPORTANTE: Ejecutar verificación al montar
    checkAuth(true); // force = true para verificar siempre al inicio
  }, []); // Ejecutar solo una vez

  const login = useCallback(
    async (userData: User) => {
      setUser(userData);
      setLastCheck(Date.now());
      await loadPermissions();
      router.replace('/dashboard');
    },
    [router, loadPermissions]
  );

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

  // ✅ MÉTODOS DE PERMISOS
  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      if (!permissions || permissions.length === 0) return false;

      return permissions.some((p) => p.module === module && p.action === action);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (checks: Array<{ module: string; action: string }>): boolean => {
      return checks.some(({ module, action }) => hasPermission(module, action));
    },
    [hasPermission]
  );

  const getPermissionScope = useCallback(
    (module: string, action: string): string | null => {
      const permission = permissions?.find(
        (p) => p.module === module && p.action === action
      );
      return permission?.scope || null;
    },
    [permissions]
  );

  // ✅ Actualizar el user con el role cuando se cargue
  useEffect(() => {
    if (user && role && !user.role) {
      setUser((prev) => (prev ? { ...prev, role } : null));
    }
  }, [role, user]);

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);