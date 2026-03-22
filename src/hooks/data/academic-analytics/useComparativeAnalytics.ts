'use client';

import { useEffect, useState, useCallback } from 'react';
import { ComparativeAnalytics } from '@/types/academic-analytics.types';
import { academicAnalyticsService } from '@/services/academic-analytics.service';

interface UseComparativeAnalyticsState {
  data: ComparativeAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 📊 Hook para obtener análisis comparativo de una sección
 *
 * Obtiene datos de comparación incluyendo:
 * - Promedio y mediana de la clase
 * - Desviación estándar
 * - Top 5 estudiantes
 * - Estudiantes en riesgo
 * - Posición del estudiante actual (si se proporciona)
 * - Distribución de calificaciones
 *
 * @param gradeId - ID del grado (requerido)
 * @param sectionId - ID de la sección (requerido)
 * @param enrollmentId - ID de matrícula del estudiante para comparación (opcional)
 * @param enabled - Habilitar/deshabilitar el hook (default: true)
 *
 * @returns {UseComparativeAnalyticsState} Estado del dato con loading y error
 *
 * @example
 * const { data: comparative, isLoading, error, refresh } = useComparativeAnalytics(1, 2, 123);
 * if (isLoading) return <div>Cargando...</div>;
 * return (
 *   <div>
 *     <p>Promedio: {comparative?.classAverage}</p>
 *     <p>Total estudiantes: {comparative?.studentCount}</p>
 *   </div>
 * );
 */
export const useComparativeAnalytics = (
  gradeId: number | null,
  sectionId: number | null,
  enrollmentId?: number,
  enabled: boolean = true
) => {
  const [state, setState] = useState<UseComparativeAnalyticsState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchComparativeAnalytics = useCallback(async () => {
    if (!gradeId || !sectionId || !enabled) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await academicAnalyticsService.getComparativeAnalytics(
        gradeId,
        sectionId,
        enrollmentId
      );
      setState({ data: result, isLoading: false, error: null });
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar análisis comparativo';
      setState({ data: null, isLoading: false, error: errorMessage });
      console.error('Error fetchComparativeAnalytics:', err);
    }
  }, [gradeId, sectionId, enrollmentId, enabled]);

  useEffect(() => {
    fetchComparativeAnalytics();
  }, [gradeId, sectionId, enrollmentId, enabled, fetchComparativeAnalytics]);

  const refresh = useCallback(() => {
    fetchComparativeAnalytics();
  }, [fetchComparativeAnalytics]);

  return {
    ...state,
    refresh,
  };
};
