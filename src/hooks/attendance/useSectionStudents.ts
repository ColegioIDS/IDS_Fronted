// src/hooks/attendance/useSectionStudents.ts
/**
 * Hook para obtener estudiantes de una sección para marcar asistencia
 * Centraliza la llamada al nuevo endpoint GET /api/attendance/section/:sectionId/students
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Estructura exacta del estudiante desde el endpoint real del backend
 * GET /api/attendance/enrollment/section/:sectionId/students
 */
export interface StudentForAttendance {
  id: number; // enrollment ID
  status: 'ACTIVE' | 'INACTIVE';
  student: {
    id: number;
    codeSIRE: string;
    givenNames: string;
    lastNames: string;
    birthDate: string;
  };
  section: {
    id: number;
    name: string;
    gradeId: number;
    capacity: number;
    grade: {
      id: number;
      name: string;
      level: string;
    };
  };
}

export interface EnrollmentsBySectionResponse {
  success: boolean;
  data: StudentForAttendance[];
  count: number;
  message: string;
}

export interface UseSectionStudentsReturn {
  students: StudentForAttendance[];
  isLoading: boolean;
  error: string | null;
  enrollmentCount: number;
  fetchStudents: (sectionId: number, includeInactive?: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useSectionStudents(): UseSectionStudentsReturn {
  const [students, setStudents] = useState<StudentForAttendance[]>([]);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para guardar la última llamada (para refetch)
  const [lastParams, setLastParams] = useState<{
    sectionId?: number;
    includeInactive?: boolean;
  }>({});

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const fetchStudents = useCallback(
    async (sectionId: number, includeInactive: boolean = false) => {
      if (!sectionId) {
        setError('Section ID is required');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Construir query params
        const params = new URLSearchParams();
        if (includeInactive) {
          params.append('includeInactive', 'true');
        }

        const url = `${apiBaseUrl}/api/attendance/enrollment/section/${sectionId}/students${
          params.toString() ? `?${params.toString()}` : ''
        }`;

        const response = await axios.get<EnrollmentsBySectionResponse>(url, {
          withCredentials: true,
        });

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch enrollments');
        }

        setStudents(response.data.data || []);
        setEnrollmentCount(response.data.count || 0);

        // Guardar params para refetch
        setLastParams({ sectionId, includeInactive });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error fetching students';
        setError(message);
        setStudents([]);
        setEnrollmentCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [apiBaseUrl]
  );

  const refetch = useCallback(async () => {
    if (lastParams.sectionId) {
      await fetchStudents(lastParams.sectionId, lastParams.includeInactive);
    }
  }, [lastParams, fetchStudents]);

  return {
    students,
    isLoading,
    error,
    enrollmentCount,
    fetchStudents,
    refetch,
  };
}
