// src/app/(admin)/course-grades/page.tsx
"use client";

import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const CourseGradeManager = dynamic(
  () => import('@/components/course-grades/CourseGradeManager'),
  {
    loading: () => <ProfileSkeleton type="meta" />
  }
);

export default function CourseGradesPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle=""
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Académico", href: "#" },
          { label: "Curso-Grados", href: "#" },
        ]}
      />
      <CourseGradeManager />
    </div>
  );
}