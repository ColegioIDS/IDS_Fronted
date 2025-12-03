// src/app/(admin)/course-grades/page.tsx
"use client";

import Breadcrumb from '@/components/common/Breadcrumb';
import { CourseGradesPageContent } from '@/components/features/course-grades';

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
      <CourseGradesPageContent />
    </div>
  );
}