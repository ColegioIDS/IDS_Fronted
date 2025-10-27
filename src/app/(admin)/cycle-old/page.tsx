// src\app\(admin)\cycle\page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import SchoolCycleTable from '@/components/cycles/SchoolCycleTable';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchInterval: 5 * 60 * 1000,
    },
  },
});

export default function CyclePageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchoolCycleProvider>       
        <SchoolCycleTable />
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}