// src/app/(admin)/sections/page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import { SectionProvider } from '@/context/SectionsContext';
import { GradeProvider } from '@/context/GradeContext';
import SectionsContent from '@/components/sections/SectionsContent';
import { TeacherProvider } from '@/context/TeacherContext';

// Crear cliente específico para esta página
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos (datos de secciones cambian menos frecuentemente que attendance)
      refetchOnWindowFocus: true, // Refrescar al volver a la ventana
      refetchInterval: 10 * 60 * 1000, // Refrescar cada 10 minutos
    },
  },
});

export default function SectionsPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchoolCycleProvider>
        <GradeProvider>
          <TeacherProvider>
          <SectionProvider>
            <SectionsContent />
          </SectionProvider>
          </TeacherProvider>
        </GradeProvider>
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}