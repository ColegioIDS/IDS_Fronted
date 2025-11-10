// src/hooks/attendance/useAttendanceCourses.ts

'use client';

import { useState, useEffect } from 'react';
import { api } from '@/config/api';
import { AttendanceCourse } from '@/types/attendance.types';

interface UseAttendanceCoursesReturn {
  courses: AttendanceCourse[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar los cursos disponibles de una sección
 * ✅ ARREGLADO: Usa la instancia 'api' configurada con el puerto correcto (5000)
 * No más fetch() directo que usa puerto 3000
 * 
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

      // ✅ ARREGLADO: Usar la instancia 'api' que tiene baseURL configurada
      // Esto respeta: process.env.NEXT_PUBLIC_API_URL o http://localhost:5000
      const response = await api.get<{ success: boolean; data: AttendanceCourse[]; message?: string }>(
        `/api/attendance/configuration/courses-for-section/${sectionId}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || `Failed to fetch courses: ${response.status}`
        );
      }

      const courseData = response.data.data || [];
      setCourses(Array.isArray(courseData) ? courseData : []);
      
      console.log(
        `[useAttendanceCourses] ✅ Cursos cargados para sección ${sectionId}:`,
        courseData.length,
        'cursos'
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.error('[useAttendanceCourses] ❌ Error fetching courses:', error);
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
