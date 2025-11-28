/**
 * Hook para obtener grados del ciclo escolar activo
 * Usa SOLO endpoints del módulo attendance
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getGradesFromActiveCycle } from '@/services/attendance.service';

export interface GradeData {
  id: number;
  name: string;
}

interface UseGradesByCycleReturn {
  grades: GradeData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener grados del ciclo activo
 * (Los datos se obtienen del ciclo activo, no necesita parámetro específico)
 */
export const useGradesByCycle = (): UseGradesByCycleReturn => {
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener grados del ciclo activo desde attendance service
      const data = await getGradesFromActiveCycle();
      
      if (Array.isArray(data)) {
        const gradesList = data.map((grade: unknown) => {
          const g = grade as Record<string, unknown>;
          const gradeObj = g.grade as Record<string, unknown>;
          return {
            id: Number(gradeObj?.id ?? g.id),
            name: String(gradeObj?.name ?? g.name),
          };
        });
        setGrades(gradesList);
      } else {
        setGrades([]);
      }
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as Record<string, unknown>).message)
        : 'Error al obtener grados';
      setError(errorMessage);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  return {
    grades,
    loading,
    error,
    refetch: fetchGrades,
  };
};

export default useGradesByCycle;
