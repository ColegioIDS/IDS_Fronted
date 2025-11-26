// src/app/(admin)/course-assignments/page.tsx
"use client";

import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const CourseAssignmentsContent = dynamic(
  () => import('@/components/features/course-assignments').then(mod => ({ default: mod.CourseAssignmentsContent })),
  {
    loading: () => <ProfileSkeleton type="meta" />
  }
);

export default function CourseAssignmentsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Asignación de Cursos y Maestros"
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Académico", href: "#" },
          { label: "Asignaciones", href: "#" },
        ]}
      />
      <CourseAssignmentsContent />
    </div>
  );
}