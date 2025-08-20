// src/app/(admin)/courses/page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';
import { CourseProvider } from '@/context/CourseContext';

// Importación dinámica del contenido principal
const CoursesContent = dynamic(() => import('@/components/courses/CoursesContent'), {
  loading: () => <ProfileSkeleton type="meta" />
});

// Crear cliente específico para esta página
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos (datos de cursos cambian menos frecuentemente)
      refetchOnWindowFocus: false, // Los cursos no necesitan refrescarse tan frecuentemente
      refetchInterval: false, // Sin refrescado automático
      retry: 2, // Reintentar 2 veces en caso de error
    },
  },
});

export default function CoursesPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Grados necesarios para las relaciones curso-grado */}
    
        {/* Manejo de cursos y course-grades */}
        <CourseProvider>
          <div className="space-y-6">
            <Breadcrumb
              pageTitle="Gestión de Cursos"
              items={[
                { label: "Inicio", href: "/dashboard" },
                { label: "Administración", href: "#" },
                { label: "Cursos", href: "#" },
              ]}
            />
            <CoursesContent />
          </div>
        </CourseProvider>
      
    </QueryClientProvider>
  );
}