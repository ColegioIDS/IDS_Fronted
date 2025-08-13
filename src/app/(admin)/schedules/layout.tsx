'use client';

import { CyclesProvider } from '@/context/CyclesContext';
import { SectionProvider } from '@/context/SectionContext'; // Nuevo
import { CourseProvider } from '@/context/CourseContext'; // Nuevo
import { TeacherProvider } from '@/context/TeacherContext'; // Nuevo
import { ScheduleProvider } from '@/context/ScheduleContext';

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CyclesProvider>
      <SectionProvider>
        <CourseProvider>
          <TeacherProvider>
            <ScheduleProvider>
              {children}
            </ScheduleProvider>
          </TeacherProvider>
        </CourseProvider>
      </SectionProvider>
    </CyclesProvider>
  );
}