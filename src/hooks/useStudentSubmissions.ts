'use client';

import { useEffect, useState, useCallback } from 'react';
import { assignmentsService } from '@/services/assignments.service';
import { StudentSubmissionsResponse } from '@/types/assignments.types';

interface UseStudentSubmissionsProps {
  courseId?: number;
  bimesterId?: number;
  enabled?: boolean;
}

interface UseStudentSubmissionsReturn {
  data: StudentSubmissionsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener calificaciones de estudiantes por tarea
 * Usa el endpoint: GET /api/assignments/course/:courseId/bimester/:bimesterId/students-submissions
 */
export function useStudentSubmissions({
  courseId,
  bimesterId,
  enabled = true,
}: UseStudentSubmissionsProps): UseStudentSubmissionsReturn {
  const [data, setData] = useState<StudentSubmissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // No hacer nada si no está habilitado o faltan parámetros
    if (!enabled || !courseId || !bimesterId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await assignmentsService.getStudentSubmissions(courseId, bimesterId);
      setData(response);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al obtener calificaciones de estudiantes';
      setError(errorMsg);
      console.error('Error en useStudentSubmissions:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, bimesterId, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
