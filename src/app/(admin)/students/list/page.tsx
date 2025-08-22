
// src/app/(admin)/students/page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import { GradeProvider } from '@/context/GradeContext';
import { SectionProvider } from '@/context/SectionsContext';
import { StudentProvider } from '@/context/StudentContext';
import { StudentList } from '@/components/students/StudentList';

// Crear cliente específico para esta página
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos (datos de estudiantes son relativamente estables)
      refetchOnWindowFocus: true,
      refetchInterval: 10 * 60 * 1000, // Refrescar cada 10 minutos
    },
  },
});

export default function StudentsPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchoolCycleProvider>


        <GradeProvider>
          <SectionProvider>
            <StudentProvider>
              <StudentList />
            </StudentProvider>
          </SectionProvider>
        </GradeProvider>
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}