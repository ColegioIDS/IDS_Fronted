'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { AcademicWeek } from '@/types/attendance-reports.types';

/**
 * Hook para obtener semanas académicas de un bimestre
 */
export function useAcademicWeeksByBimester(bimesterId: number | undefined, enabled = true) {
  return useQuery<AcademicWeek[]>({
    queryKey: ['academicWeeks', bimesterId],
    queryFn: async () => {
      if (!bimesterId) {
        throw new Error('Bimester ID is required');
      }
      return attendanceReportsService.getAcademicWeeksByBimester(bimesterId);
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: enabled && !!bimesterId,
  });
}
