// src/hooks/attendance/useTeacherCourses.ts
/**
 * Hook para obtener cursos del maestro para una fecha
 * Usa Endpoint 1: GET /api/attendance/teacher/courses/:date
 */

import { useState, useCallback } from 'react';
import { attendanceTeacherCoursesService } from '@/services/attendance-teacher-courses.service';
import { TeacherCourse } from '@/types/attendance.types';

interface UseTeacherCoursesReturn {
  courses: TeacherCourse[];
  isLoading: boolean;
  error: string | null;
  fetchCourses: (date: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTeacherCourses(): UseTeacherCoursesReturn {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDate, setLastDate] = useState<string>('');

  const fetchCourses = useCallback(async (date: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setLastDate(date);

      const response = await attendanceTeacherCoursesService.getTeacherCoursesByDate(date);
      setCourses(response.courses || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar los cursos';
      setError(errorMessage);
      setCourses([]);
      console.error('useTeacherCourses error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (lastDate) {
      await fetchCourses(lastDate);
    }
  }, [lastDate, fetchCourses]);

  return {
    courses,
    isLoading,
    error,
    fetchCourses,
    refetch,
  };
}
