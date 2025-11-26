'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { Course } from '@/types/attendance-reports.types';

/**
 * Hook para obtener cursos de una sección
 */
export function useCoursesBySection(sectionId: number | undefined, enabled = true) {
  return useQuery<Course[]>({
    queryKey: ['courses', sectionId],
    queryFn: async () => {
      if (!sectionId) {
        throw new Error('Section ID is required');
      }
      return attendanceReportsService.getCoursesBySection(sectionId);
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: enabled && !!sectionId,
  });
}
