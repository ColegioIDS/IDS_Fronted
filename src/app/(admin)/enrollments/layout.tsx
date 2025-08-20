//src\app\(admin)\enrollments\layout.tsx
'use client';

import { CyclesProvider } from '@/context/CyclesContext';
import { GradeProvider } from '@/context/GradeContext';
import { SectionProvider } from '@/context/SectionsContext';
import { StudentProvider } from '@/context/StudentContext';
import { EnrollmentProvider } from '@/context/EnrollmentContext';

export default function EnrollmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CyclesProvider>
      <GradeProvider>
        <SectionProvider>
          <StudentProvider>
            <EnrollmentProvider>
              {children}
            </EnrollmentProvider>
          </StudentProvider>
        </SectionProvider>
      </GradeProvider>
    </CyclesProvider>
  );
}