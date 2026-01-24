'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { AttendanceSummary } from '@/types/attendance-reports.types';
import { useEffect } from 'react';

interface UseAttendanceSummaryParams {
  gradeId?: number;
  sectionId?: number;
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
  bimesterId = null,
  academicWeekId = null,
}: UseAttendanceSummaryParams) {
  const queryKey = [
    'attendance-reports',
    'attendance-summary',
    gradeId,
    sectionId,
    bimesterId,
    academicWeekId,
  ];

  useEffect(() => {
    console.log('🔍 useAttendanceSummary params changed:', {
      gradeId,
      sectionId,
      bimesterId,
      academicWeekId,
      willExecute: !!(gradeId && sectionId),
    });
  }, [gradeId, sectionId, bimesterId, academicWeekId]);

  const { data, isLoading, error, isError } = useQuery<AttendanceSummary>({
    queryKey,
    queryFn: () => {
      console.log('🚀 useAttendanceSummary queryFn executing with:', {
        gradeId,
        sectionId,
        bimesterId,
        academicWeekId,
      });
      return attendanceReportsService.getAttendanceSummary(
        gradeId!,
        sectionId!,
        bimesterId,
        academicWeekId
      );
    },
    enabled: !!(gradeId && sectionId),
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
