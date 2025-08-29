// src/app/(admin)/erica-topics/page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import { CourseProvider } from '@/context/CourseContext';
import { TeacherProvider } from '@/context/TeacherContext';
import { SectionProvider } from '@/context/SectionsContext';
import { AcademicWeekProvider } from '@/context/AcademicWeeksContext';
import { BimesterProvider } from '@/context/BimesterContext';
import { EricaTopicsProvider } from '@/context/EricaTopicsContext';
import EricaTopicsContent from '@/components/erica-topics/erica-topics-content';
import { GradeCycleProvider } from '@/context/GradeCycleContext';
import { CourseAssignmentProvider } from '@/context/CourseAssignmentContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      retry: 0,
      refetchOnMount: false,
    },
  },
});

export default function EricaTopicsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchoolCycleProvider>
        <GradeCycleProvider>
        <BimesterProvider>
          <CourseProvider>
            <SectionProvider>
              <TeacherProvider>
                <CourseAssignmentProvider>
                <AcademicWeekProvider>
                  <EricaTopicsProvider>
                    <EricaTopicsContent />
                  </EricaTopicsProvider>
                </AcademicWeekProvider>
                </CourseAssignmentProvider>
              </TeacherProvider>
            </SectionProvider>
          </CourseProvider>
        </BimesterProvider>
        </GradeCycleProvider>
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}