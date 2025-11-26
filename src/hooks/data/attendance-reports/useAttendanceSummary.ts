'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { AttendanceSummary } from '@/types/attendance-reports.types';

interface UseAttendanceSummaryParams {
  gradeId?: number;
  sectionId?: number;
  courseId?: number;
  bimesterId?: number | null;
  academicWeekId?: number | null;
}

/**
 * Hook para obtener el resumen de asistencia con filtros
 * Se dispara automáticamente cuando courseId está disponible
 * Se actualiza cuando bimesterId o academicWeekId cambian
 */
export function useAttendanceSummary({
  gradeId,
  sectionId,
  courseId,
  bimesterId = null,
  academicWeekId = null,
}: UseAttendanceSummaryParams) {
  const queryKey = [
    'attendance-reports',
    'attendance-summary',
    gradeId,
    sectionId,
    courseId,
    bimesterId,
    academicWeekId,
  ];

  const { data, isLoading, error, isError } = useQuery<AttendanceSummary>({
    queryKey,
    queryFn: () =>
      attendanceReportsService.getAttendanceSummary(
        gradeId!,
        sectionId!,
        courseId!,
        bimesterId,
        academicWeekId
      ),
    enabled: !!(gradeId && sectionId && courseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0, // Sin reintentos automáticos (el QueryProvider maneja esto)
  });

  return {
    data,
    isLoading,
    error,
    isError,
  };
}
