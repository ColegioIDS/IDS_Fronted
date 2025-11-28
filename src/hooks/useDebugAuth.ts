/**
 * Hook para debuggear problemas de autenticación y cookies
 * Úsalo en una página para ver los logs
 */

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useDebugAuth = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // 1. Verificar cookies en el navegador
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [name, value] = cookie.split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    console.group('🔐 DEBUG AUTH');
    
    // 2. Mostrar info de CORS
    console.groupEnd();
  }, [user, isAuthenticated, isLoading]);

  return { user, isAuthenticated, isLoading };
};
