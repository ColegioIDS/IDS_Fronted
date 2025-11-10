// src/hooks/attendance/useAttendanceCourses.ts

import { useState, useEffect } from 'react';
import { AttendanceCourse } from '@/types/attendance.types';

interface UseAttendanceCoursesReturn {
  courses: AttendanceCourse[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar los cursos disponibles de una sección
 * @param sectionId - ID de la sección
 * @returns Cursos, estado de carga, error y función para recargar
 */
export function useAttendanceCourses(sectionId?: number): UseAttendanceCoursesReturn {
  const [courses, setCourses] = useState<AttendanceCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourses = async () => {
    if (!sectionId) {
      setCourses([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/attendance/configuration/courses-for-section/${sectionId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`);
      }

      const data = await response.json();
      setCourses(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [sectionId]);

  const refetch = async () => {
    await fetchCourses();
  };

  return { courses, loading, error, refetch };
}
