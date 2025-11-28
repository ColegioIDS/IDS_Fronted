import { useQuery } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { StudentsAttendanceResponse } from '@/types/attendance-reports.types';

interface UseStudentsAttendanceParams {
  gradeId?: number;
  sectionId?: number;
  courseId?: number;
  bimesterId?: number | null;
  academicWeekId?: number | null;
}

export function useStudentsAttendance({
  gradeId,
  sectionId,
  courseId,
  bimesterId,
  academicWeekId,
}: UseStudentsAttendanceParams) {
  return useQuery<StudentsAttendanceResponse>({
    queryKey: [
      'students-attendance',
      gradeId,
      sectionId,
      courseId,
      bimesterId,
      academicWeekId,
    ],
    queryFn: () =>
      attendanceReportsService.getStudentsAttendance(
        gradeId!,
        sectionId!,
        courseId!,
        bimesterId,
        academicWeekId
      ),
    enabled: !!(gradeId && sectionId && courseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
