// src/hooks/data/academic-analytics/useStudentsSummary.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { academicAnalyticsService } from '@/services/academic-analytics.service';
import { GradeWithSections } from '@/types/academic-analytics.types';

interface UseStudentsSummaryParams {
  cycleId: number | null;
  bimesterIds?: number[];
  gradeIds?: number[];
  sectionIds?: number[];
}

interface UseStudentsSummaryReturn {
  data: GradeWithSections[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 📊 Hook para obtener resumen académico de estudiantes por grid
 *
 * Obtiene la estructura anidada de estudiantes agrupados por grado y sección
 * (promedios, tendencia, estado) según los filtros especificados.
 *
 * Solo cycleId es requerido. Los demás filtros son opcionales.
 * Si no se especifican gradeIds, sectionIds o bimesterIds,
 * se retornan todos los estudiantes del ciclo.
 *
 * @param cycleId - ID del ciclo escolar (requerido, null para no cargar)
 * @param bimesterIds - IDs de bimestres (opcional, múltiple)
 * @param gradeIds - IDs de grados (opcional, múltiple)
 * @param sectionIds - IDs de secciones (opcional, múltiple)
 *
 * @example
 * const { data, isLoading, error } = useStudentsSummary({
 *   cycleId: 1,
 *   gradeIds: [1, 2],
 *   sectionIds: [1],
 * });
 * // data estructura: [{grade, sections: [{section, students: [...]}]}]
 */
export function useStudentsSummary(
  params: UseStudentsSummaryParams
): UseStudentsSummaryReturn {
  const [data, setData] = useState<GradeWithSections[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentsSummary = useCallback(async () => {
    // Only fetch if cycleId is provided
    if (params.cycleId === null) {
      setData([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await academicAnalyticsService.getStudentsSummaryByGridFilter(
        params.cycleId,
        params.bimesterIds,
        params.gradeIds,
        params.sectionIds
      );
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Error al cargar resúmenes académicos');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [params.cycleId, params.bimesterIds, params.gradeIds, params.sectionIds]);

  useEffect(() => {
    fetchStudentsSummary();
  }, [fetchStudentsSummary]);

  const refresh = useCallback(() => {
    fetchStudentsSummary();
  }, [fetchStudentsSummary]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}

export default useStudentsSummary;
