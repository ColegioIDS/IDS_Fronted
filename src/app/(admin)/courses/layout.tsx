'use client';

import { CyclesProvider } from '@/context/CyclesContext';
import { GradeProvider } from '@/context/GradeContext';
import { CourseProvider } from '@/context/CourseContext';

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CyclesProvider>
      <GradeProvider>
        <CourseProvider>
          {children}
        </CourseProvider>
      </GradeProvider>
    </CyclesProvider>
  );
}