// src/app/(admin)/attendance/page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import { BimesterProvider } from '@/context/newBimesterContext';
import { AcademicWeekProvider } from '@/context/AcademicWeeksContext';
import { AttendanceProvider } from '@/context/AttendanceContext';
import { GradeProvider } from '@/context/GradeContext';
import { SectionProvider } from '@/context/SectionsContext';
import { EnrollmentProvider } from '@/context/EnrollmentContext';
import ContentAttendance from '@/components/attendance/attendance-grid';
import { StudentProvider } from '@/context/StudentContext';
import {HolidayProvider} from '@/context/HolidaysContext';

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
      <SchoolCycleProvider>        {/* 1️⃣ Ciclo escolar base */}
        <BimesterProvider>         {/* 2️⃣ Bimestre dentro del ciclo */}
          <HolidayProvider>        {/* 3️⃣ Días festivos del bimestre */}
            <AcademicWeekProvider> {/* 4️⃣ Semanas del bimestre */}
              <GradeProvider>      {/* 5️⃣ Grados disponibles */}
                <SectionProvider>  {/* 6️⃣ Secciones del grado */}
                  <EnrollmentProvider> {/* 7️⃣ Matrículas de la sección */}
                    <StudentProvider>  {/* 8️⃣ Datos completos de estudiantes */}
                      <AttendanceProvider> {/* 9️⃣ Asistencias finales */}
                        <ContentAttendance />
                      </AttendanceProvider>
                    </StudentProvider>
                  </EnrollmentProvider>
                </SectionProvider>
              </GradeProvider>
            </AcademicWeekProvider>
          </HolidayProvider>
        </BimesterProvider>
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}