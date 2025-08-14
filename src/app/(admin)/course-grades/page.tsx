// src/app/(admin)/course-grades/page.tsx
'use client';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton'; // Usando shadcn/ui
import Breadcrumb from '@/components/common/Breadcrumb';

// Carga dinámica para mejor performance
const CourseGradesContent = dynamic(
  () => import('@/components/course-grades/Course-Grades-Content'),
  { 
    loading: () => <Skeleton className="h-64 w-full" /> 
  }
);



export default function CourseGradesPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Asignación de Cursos"
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Administración", href: "#" },
          { label: "Cursos por Grado", href: "#" },
        ]}
      />

        <CourseGradesContent />

    </div>
  );
}