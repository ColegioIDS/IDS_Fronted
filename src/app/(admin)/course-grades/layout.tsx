// src/app/(admin)/course-grades/layout.tsx
'use client';

import { GradeProvider } from '@/context/GradeContext';
import { CourseProvider } from '@/context/CourseContext'; // Nuevo contexto para cursos
import { CourseGradeProvider } from '@/context/CourseGradeContext';

export default function CourseGradesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GradeProvider>
      <CourseProvider>
        <CourseGradeProvider>
          {children}
        </CourseGradeProvider>
      </CourseProvider>
    </GradeProvider>
  );
}