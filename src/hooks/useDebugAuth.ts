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
    console.log('📍 URL:', window.location.href);
    console.log('🍪 Cookies:', cookies);
    console.log('👤 User:', user);
    console.log('✅ Is Authenticated:', isAuthenticated);
    console.log('⏳ Is Loading:', isLoading);
    console.log('📦 LocalStorage authToken:', localStorage.getItem('authToken'));
    
    // 2. Mostrar info de CORS
    console.log('🌐 Origin:', window.location.origin);
    console.log('📡 API URL:', process.env.NEXT_PUBLIC_API_URL);
    console.groupEnd();
  }, [user, isAuthenticated, isLoading]);

  return { user, isAuthenticated, isLoading };
};
