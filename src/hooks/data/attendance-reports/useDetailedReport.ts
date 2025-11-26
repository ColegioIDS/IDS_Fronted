import { useQuery } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { Section } from '@/types/attendance-reports.types';

export function useSectionsByGrade(gradeId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ['attendance-reports', 'sections-by-grade', gradeId],
    queryFn: () => {
      if (!gradeId) throw new Error('Grade ID is required');
      return attendanceReportsService.getSectionsByGrade(gradeId);
    },
    enabled: enabled && !!gradeId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
