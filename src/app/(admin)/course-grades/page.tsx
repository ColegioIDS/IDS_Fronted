// src/app/(admin)/course-grades/page.tsx
"use client";

import Breadcrumb from '@/components/common/Breadcrumb';
import { CourseGradesPageContent } from '@/components/features/course-grades';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { COURSE_GRADE_PERMISSIONS } from '@/constants/modules-permissions/course-grade';

export default function CourseGradesPage() {
  return (
    <ProtectedPage module={COURSE_GRADE_PERMISSIONS.READ.module} action={COURSE_GRADE_PERMISSIONS.READ.action}>
      <div className="space-y-6">
        <Breadcrumb
          pageTitle="Gestión de Relaciones Curso-Grado"
          items={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Académico", href: "#" },
            { label: "Curso-Grados", href: "#" },
          ]}
        />
        <CourseGradesPageContent />
      </div>
    </ProtectedPage>
  );
}