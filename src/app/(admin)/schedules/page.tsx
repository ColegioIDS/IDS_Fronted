// src/app/(admin)/schedules/page.tsx
'use client';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';

// Context Providers
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import { BimesterProvider } from '@/context/newBimesterContext';
import { GradeScheduleConfigProvider } from '@/context/ScheduleConfigContext';
import { SectionProvider } from '@/context/SectionsContext';
import { CourseProvider } from '@/context/CourseContext';
import { TeacherProvider } from '@/context/TeacherContext';
import { ScheduleProvider } from '@/context/ScheduleContext';

// Componente principal con carga dinámica
const SchedulesContent = dynamic(() => import('@/components/schedules/ContentSchedules'), {
  loading: () => <ProfileSkeleton type="meta" />
});

// Crear cliente específico para esta página
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutos (horarios son relativamente estables)
      refetchOnWindowFocus: false, // Los horarios no cambian frecuentemente
      refetchInterval: false, // No necesita refresh automático
      retry: 2, // Reintentar 2 veces en caso de error
    },
    mutations: {
      retry: 1, // Reintentar mutaciones una vez
    },
  },
});

export default function SchedulePageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Ciclo escolar activo automático */}
      <SchoolCycleProvider>
        {/* Bimestre activo automático (para contexto temporal) */}
        <BimesterProvider>
          {/* Grados y configuraciones de horario */}
          <GradeScheduleConfigProvider>
            {/* Secciones para selección (filtradas por grado) */}
            <SectionProvider>
              {/* Cursos disponibles para asignación */}
              <CourseProvider>
                {/* Profesores disponibles para asignación */}
                <TeacherProvider>
                  {/* Manejo principal de horarios */}
                  <ScheduleProvider>
                    <div className="space-y-6">
                      <Breadcrumb
                        pageTitle="Horarios"
                        items={[
                          { label: "Inicio", href: "/dashboard" },
                          { label: "Gestión Académica", href: "#" },
                          { label: "Horarios", href: "#" },
                        ]}
                      />
                      <SchedulesContent />
                    </div>
                  </ScheduleProvider>
                </TeacherProvider>
              </CourseProvider>
            </SectionProvider>
          </GradeScheduleConfigProvider>
        </BimesterProvider>
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}