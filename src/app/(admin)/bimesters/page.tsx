//src\app\(admin)\bimesters\page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import { BimesterProvider } from '@/context/newBimesterContext';
import BimesterContent from '@/components/bimester/content';

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
        <BimesterProvider>
          <BimesterContent />
        </BimesterProvider>
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}