'use client';

import { CyclesProvider } from '@/context/CyclesContext';
import { SectionProvider } from '@/context/SectionContext';
import { CourseProvider } from '@/context/CourseContext';
import { TeacherProvider } from '@/context/TeacherContext';
import { ScheduleProvider } from '@/context/ScheduleContext';
import { ScheduleConfigProvider } from '@/context/ScheduleConfigContext'; // Nuevo

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
              <ScheduleConfigProvider> {/* Nuevo provider */}
                {children}
              </ScheduleConfigProvider>
            </ScheduleProvider>
          </TeacherProvider>
        </CourseProvider>
      </SectionProvider>
    </CyclesProvider>
  );
}