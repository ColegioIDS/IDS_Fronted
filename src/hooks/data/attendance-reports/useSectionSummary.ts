import { useQuery } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { Grade } from '@/types/attendance-reports.types';

export function useGradesByCycle(cycleId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ['attendance-reports', 'grades-by-cycle', cycleId],
    queryFn: () => {
      if (!cycleId) throw new Error('Cycle ID is required');
      return attendanceReportsService.getGradesByCycle(cycleId);
    },
    enabled: enabled && !!cycleId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
