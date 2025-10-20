// src/components/attendance/AttendanceManagerWrapper.tsx

'use client';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';
import AttendanceManager from './AttendanceManager';

// Crear QueryClient una sola vez
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30,   // 30 minutos (antes era cacheTime)
    },
  },
});

export const AttendanceManagerWrapper = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AttendanceManager />
    </QueryClientProvider>
  );
};

export default AttendanceManagerWrapper;