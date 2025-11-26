'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { Bimester } from '@/types/attendance-reports.types';

/**
 * Hook para obtener bimestres de un ciclo
 */
export function useBimestersByCycle(cycleId: number | undefined, enabled = true) {
  return useQuery<Bimester[]>({
    queryKey: ['bimesters', cycleId],
    queryFn: async () => {
      if (!cycleId) {
        throw new Error('Cycle ID is required');
      }
      return attendanceReportsService.getBimestersByCycle(cycleId);
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: enabled && !!cycleId,
  });
}
