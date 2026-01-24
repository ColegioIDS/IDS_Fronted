'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { PeriodType, AttendanceHistoryResponse, AttendanceBimonthlyHistoryResponse } from '@/types/attendance-reports.types';

interface UseAttendanceHistoryParams {
  gradeId?: number;
  sectionId?: number;
  periodType: PeriodType;
  date?: string; // YYYY-MM-DD for day view
  weekId?: string | number; // week ID for week view
  bimesterId?: number;
  searchCounter?: number; // Increment to trigger a new search
}

export const useAttendanceHistory = ({
  gradeId,
  sectionId,
  periodType,
  date,
  weekId,
  bimesterId,
  searchCounter = 0,
}: UseAttendanceHistoryParams) => {
  return useQuery({
    queryKey: [
      'attendance-history',
      gradeId,
      sectionId,
      periodType,
      date,
      weekId,
      bimesterId,
      searchCounter,
    ],
    queryFn: async () => {
      if (!gradeId || !sectionId) {
        throw new Error('gradeId and sectionId are required');
      }

      return attendanceReportsService.getAttendanceHistory(
        gradeId,
        sectionId,
        periodType,
        date,
        weekId ? weekId.toString() : undefined,
        bimesterId
      ) as Promise<AttendanceHistoryResponse | AttendanceBimonthlyHistoryResponse>;
    },
    enabled: !!(gradeId && sectionId && searchCounter > 0),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0,
  });
};
