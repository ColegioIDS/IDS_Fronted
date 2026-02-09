'use client';

import { useQuery } from '@tanstack/react-query';
import { getAttendanceJustification } from '@/services/attendance-plant.service';

/**
 * Hook para obtener la justificación de un registro de asistencia
 */
export function useAttendanceJustification(dailyAttendanceId?: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['attendance-justification', dailyAttendanceId],
    queryFn: async () => {
      if (!dailyAttendanceId) return null;
      return await getAttendanceJustification(dailyAttendanceId);
    },
    enabled: !!dailyAttendanceId,
    staleTime: 0, // No cachear, siempre traer fresco
  });

  return {
    data: data || null,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}
