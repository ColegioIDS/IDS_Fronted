// src\app\(admin)\erica-history\page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import { BimesterProvider } from '@/context/newBimesterContext';
import { GradeCycleProvider } from '@/context/GradeCycleContext';
import { SectionProvider } from '@/context/SectionsContext';
import { CourseAssignmentProvider } from '@/context/CourseAssignmentContext';
import { TeacherProvider } from '@/context/TeacherContext';
import { CourseProvider } from '@/context/CourseContext';
import { QnaProvider } from '@/context/QnaContext';  // NUEVO
import QnaSystemContent from '@/components/erica-history/erica-content';  // NUEVO
import { AcademicWeekProvider } from '@/context/AcademicWeeksContext';
import { EricaTopicsProvider } from '@/context/EricaTopicsContext';

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

export default function QnaSystemPage() {
  return (
    <QueryClientProvider client={queryClient}>

      <SchoolCycleProvider>
        <BimesterProvider>
          <AcademicWeekProvider>
            <GradeCycleProvider>
              <SectionProvider>
                <CourseAssignmentProvider>
                  <TeacherProvider>
                    <CourseProvider>
                      <EricaTopicsProvider>
                        <QnaProvider>
                          <QnaSystemContent />
                        </QnaProvider>
                      </EricaTopicsProvider>
                    </CourseProvider>
                  </TeacherProvider>
                </CourseAssignmentProvider>
              </SectionProvider>
            </GradeCycleProvider>
          </AcademicWeekProvider>
        </BimesterProvider>
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}