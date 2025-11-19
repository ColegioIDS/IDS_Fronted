// src/hooks/attendance/useTeacherAttendanceRegistration.ts
/**
 * Hook para registrar asistencia por cursos
 * Usa Endpoint 2: POST /api/attendance/teacher/by-courses
 */

import { useState, useCallback } from 'react';
import { attendanceTeacherCoursesService } from '@/services/attendance-teacher-courses.service';
import {
  BulkTeacherAttendanceByCourseRequest,
  BulkTeacherAttendanceByCourseResponse,
} from '@/types/attendance.types';

interface UseTeacherAttendanceRegistrationReturn {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  result: BulkTeacherAttendanceByCourseResponse | null;
  registerAttendance: (payload: BulkTeacherAttendanceByCourseRequest) => Promise<void>;
  reset: () => void;
}

export function useTeacherAttendanceRegistration(): UseTeacherAttendanceRegistrationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkTeacherAttendanceByCourseResponse | null>(null);

  const registerAttendance = useCallback(
    async (payload: BulkTeacherAttendanceByCourseRequest) => {
      try {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        const response = await attendanceTeacherCoursesService.registerAttendanceByCourses(
          payload
        );

        setResult(response);
        setIsSuccess(true);
        console.log('Attendance registered successfully:', response);
      } catch (err: any) {
        const errorMessage = err.message || 'Error al registrar asistencia';
        setError(errorMessage);
        setIsSuccess(false);
        console.error('Registration error:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    isLoading,
    isSuccess,
    error,
    result,
    registerAttendance,
    reset,
  };
}
