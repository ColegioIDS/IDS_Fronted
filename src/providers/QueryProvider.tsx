'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Crear una instancia singleton de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos por defecto
      gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
      retry: (failureCount, error: any) => {
        // No reintentar en errores 4xx (cliente)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Reintentar máximo 1 vez en otros errores
        return failureCount < 1;
      },
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
