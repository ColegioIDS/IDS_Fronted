// src/app/(admin)/course-teachers/page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import { GradeProvider } from '@/context/GradeContext';
import { SectionProvider } from '@/context/SectionsContext';
import { CourseProvider } from '@/context/CourseContext';          // ✅ AGREGAR DE VUELTA
import { TeacherProvider } from '@/context/newTeachersContext';
import { CourseAssignmentProvider } from '@/context/CourseAssignmentContext';
import ContentCourseAssignments from '@/components/course-assignments/course-assignments-content';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchInterval: 15 * 60 * 1000,
    },
  },
});

export default function CourseTeachersPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchoolCycleProvider>
        <GradeProvider>
          <SectionProvider>
            <CourseProvider>                      {/* ✅ AGREGAR */}
              <TeacherProvider>
                <CourseAssignmentProvider>
                  <ContentCourseAssignments />
                </CourseAssignmentProvider>
              </TeacherProvider>
            </CourseProvider>                     {/* ✅ AGREGAR */}
          </SectionProvider>
        </GradeProvider>
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}