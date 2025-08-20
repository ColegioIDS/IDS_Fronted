// src/app/(admin)/attendance/page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import { BimesterProvider } from '@/context/newBimesterContext';
import { AcademicWeekProvider } from '@/context/AcademicWeeksContext';
import { AttendanceProvider } from '@/context/AttendanceContext';
import { GradeProvider } from '@/context/GradeContext';
import { SectionProvider } from '@/context/SectionContext';
import { EnrollmentProvider } from '@/context/EnrollmentContext';
import ContentAttendance from '@/components/attendance/attendance-grid';

// Crear cliente específico para esta página
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000, // 3 minutos (datos de asistencia cambian frecuentemente)
      refetchOnWindowFocus: true, // Refrescar al volver a la ventana
      refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos
    },
  },
});

export default function AttendancePageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Ciclo escolar activo automático */}
      <SchoolCycleProvider>
        {/* Bimestre activo automático */}
        <BimesterProvider>
          {/* Semana académica actual automática */}
          <AcademicWeekProvider>
            {/* Grados para selección */}
            <GradeProvider>
              {/* Secciones para selección (filtradas por grado) */}
              <SectionProvider>
                {/* Estudiantes matriculados (filtrados por ciclo activo + sección) */}
                <EnrollmentProvider>
                  {/* Manejo de asistencias */}
                  <AttendanceProvider>
                    <ContentAttendance />
                  </AttendanceProvider>
                </EnrollmentProvider>
              </SectionProvider>
            </GradeProvider>
          </AcademicWeekProvider>
        </BimesterProvider>
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}