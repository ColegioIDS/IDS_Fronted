import { useQuery } from '@tanstack/react-query';
import { getAttendanceHistoryBimester } from '@/services/attendance-plant.service';
import type { AttendanceHistoryResponse } from '@/types/attendance-plant.types';

interface UseAttendanceHistoryParams {
  gradeId?: number;
  sectionId?: number;
  bimesterId?: number;
  cycleId?: number;
  enabled?: boolean;
}

export function useAttendanceHistory({
  gradeId,
  sectionId,
  bimesterId,
  cycleId,
  enabled = true,
}: UseAttendanceHistoryParams) {
  const { data, isLoading, error, refetch } = useQuery<AttendanceHistoryResponse>({
    queryKey: ['attendanceHistory', gradeId, sectionId, bimesterId, cycleId],
    queryFn: async () => {
      if (!gradeId || !sectionId || !bimesterId || !cycleId) {
        throw new Error('Faltan parámetros requeridos');
      }
      return getAttendanceHistoryBimester({
        gradeId,
        sectionId,
        bimesterId,
        cycleId,
      });
    },
    enabled: enabled && !!gradeId && !!sectionId && !!bimesterId && !!cycleId,
    retry: false,
  });

  return {
    data,
    isLoading,
    error: error?.message || null,
    refetch,
  };
}
