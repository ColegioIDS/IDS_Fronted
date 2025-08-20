// src/app/(admin)/academic-weeks/page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import { BimesterProvider } from '@/context/newBimesterContext';
import { AcademicWeekProvider } from '@/context/AcademicWeeksContext';
import ContentAcademicWeeks from '@/components/academic-weeks/academic-weeks';

// Crear cliente específico para esta página
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function AcademicWeeksPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchoolCycleProvider>
        <BimesterProvider>
          <AcademicWeekProvider>
            <ContentAcademicWeeks />
          </AcademicWeekProvider>
        </BimesterProvider>
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}