// src/app/(admin)/enrollments/page.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CyclesProvider } from '@/context/CyclesContext';
import { GradeProvider } from '@/context/GradeContext';
import { SectionProvider } from '@/context/SectionsContext';
import { StudentProvider } from '@/context/StudentContext';
import { EnrollmentProvider } from '@/context/EnrollmentContext';
import EnrollmentsContent from '@/components/enrollments/EnrollmentsContent'; // Tu componente principal



// Cliente específico para esta página
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: true,
      refetchInterval: 10 * 60 * 1000, // 10 minutos
    },
  },
});

export default function EnrollmentPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CyclesProvider>
        <GradeProvider>
          <SectionProvider>
            <StudentProvider>
              <EnrollmentProvider>
                <EnrollmentsContent />
              </EnrollmentProvider>
            </StudentProvider>
          </SectionProvider>
        </GradeProvider>
      </CyclesProvider>
    </QueryClientProvider>
  );
}