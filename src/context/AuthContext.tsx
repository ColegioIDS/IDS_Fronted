'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { verifySession, logout as apiLogout, getMyPermissions } from '@/services/authService';
import { UserPermission } from '@/types/permissions'; // ✨ Importar type
import { usePathname, useRouter } from 'next/navigation';

interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthContextProps {
  user: User | null;
  permissions: UserPermission[]; // ✨ Usar type
  role: { id: number; name: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: (force?: boolean) => Promise<void>;
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
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]); // ✨ Type
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);