// src\app\(admin)\erica-evaluations\page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';      // 1. Ciclo activo
import { BimesterProvider } from '@/context/newBimesterContext';            // 2. Bimestre activo
import { AcademicWeekProvider } from '@/context/AcademicWeeksContext';   // 3. Semanas del bimestre
import { GradeCycleProvider } from '@/context/GradeCycleContext';        // 4. Grados activos
import { SectionProvider } from '@/context/SectionsContext';             // 5. Secciones
import { CourseAssignmentProvider } from '@/context/CourseAssignmentContext'; // 6. Profesores
import { TeacherProvider } from '@/context/TeacherContext';                    // 7. Info profesores
import { CourseProvider } from '@/context/CourseContext';                // 8. Cursos
import { EricaTopicsProvider } from '@/context/EricaTopicsContext';      // 9. Temas semanales
import { EricaEvaluationProvider } from '@/context/EricaEvaluationContext'; // 10. Evaluaciones
import EricaEvaluationsContent from '@/components/erica-evaluations/erica-evaluations-content';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      retry: 0,
      refetchOnMount: false,
    },
  },
});
export default function EricaEvaluationsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchoolCycleProvider>
        <BimesterProvider>
          <AcademicWeekProvider>
            <GradeCycleProvider>
              <SectionProvider>
                <CourseAssignmentProvider>
                  <TeacherProvider>
                    <CourseProvider>
                      <EricaTopicsProvider>
                        <EricaEvaluationProvider>
                          <EricaEvaluationsContent />
                        </EricaEvaluationProvider>
                      </EricaTopicsProvider>
                    </CourseProvider>
                  </TeacherProvider>
                </CourseAssignmentProvider>
              </SectionProvider>
            </GradeCycleProvider>
          </AcademicWeekProvider>
        </BimesterProvider>
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}