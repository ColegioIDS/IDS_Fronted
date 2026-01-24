'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { AcademicWeek, SchoolCycle, Bimester } from '@/types/attendance-reports.types';

interface UseAcademicWeeksResponse {
  schoolCycle: SchoolCycle;
  bimester: Bimester;
  weeks: AcademicWeek[];
}

export const useAcademicWeeks = () => {
  return useQuery<UseAcademicWeeksResponse>({
    queryKey: ['academic-weeks'],
    queryFn: () => attendanceReportsService.getAcademicWeeks(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};
