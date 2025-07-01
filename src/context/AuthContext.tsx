// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { verifySession, logout as apiLogout } from '@/services/authService';
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
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: (force?: boolean) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({

  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

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
      
      // Redirigir si está en login/signup y ya está autenticado
      if (['/signin', '/signup'].includes(pathname) && userData) {
        router.replace('/dashboard');
      }
    } catch (error) {
    
      setUser(null);
      setLastCheck(0);
      
      // Redirigir a login si está en ruta protegida
      if (['/dashboard', '/profile', '/admin'].some(route => pathname.startsWith(route))) {
        router.replace('/signin');
      }
    } finally {
     
      setIsLoading(false);
    }
  }, [pathname, router, lastCheck]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback((userData: User) => {
    setUser(userData);
    setLastCheck(Date.now());
    router.replace('/dashboard');
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
      setUser(null);
      setLastCheck(0);
      router.replace('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

   

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);