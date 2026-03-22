'use client';

import { useEffect, useState, useCallback } from 'react';
import { GradeDistributionStatistics } from '@/types/academic-analytics.types';
import { academicAnalyticsService } from '@/services/academic-analytics.service';

interface UseGradeStatisticsState {
  data: GradeDistributionStatistics | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 📈 Hook para obtener estadísticas de distribución de calificaciones
 *
 * Obtiene datos estadísticos incluyendo:
 * - Medidas de tendencia central (media, mediana, moda)
 * - Medidas de dispersión (std dev, varianza, rango, IQR)
 * - Cuartiles (Q1, Q3)
 * - Distribución por categorías (excelente, bueno, satisfactorio, necesita mejora)
 * - Puntuaciones mín/máx
 *
 * @param gradeId - ID del grado (requerido)
 * @param sectionId - ID de la sección (opcional)
 * @param courseId - ID del curso (opcional)
 * @param bimesterId - ID del bimestre (opcional)
 * @param enabled - Habilitar/deshabilitar el hook (default: true)
 *
 * @returns {UseGradeStatisticsState} Estado del dato con loading y error
 *
 * @example
 * const { data: stats, isLoading, error, refresh } = useGradeStatistics(1, 2);
 * if (isLoading) return <div>Cargando...</div>;
 * return (
 *   <div>
 *     <p>Media: {stats?.statistics.mean}</p>
 *     <p>Desv. Est.: {stats?.statistics.standardDeviation}</p>
 *   </div>
 * );
 */
export const useGradeStatistics = (
  gradeId: number | null,
  sectionId?: number | null,
  courseId?: number | null,
  bimesterId?: number | null,
  enabled: boolean = true
) => {
  const [state, setState] = useState<UseGradeStatisticsState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchGradeStatistics = useCallback(async () => {
    if (!gradeId || !enabled) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await academicAnalyticsService.getGradeDistributionStatistics(
        gradeId,
        sectionId,
        courseId,
        bimesterId
      );
      setState({ data: result, isLoading: false, error: null });
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar estadísticas';
      setState({ data: null, isLoading: false, error: errorMessage });
      console.error('Error fetchGradeStatistics:', err);
    }
  }, [gradeId, sectionId, courseId, bimesterId, enabled]);

  useEffect(() => {
    fetchGradeStatistics();
  }, [gradeId, sectionId, courseId, bimesterId, enabled, fetchGradeStatistics]);

  const refresh = useCallback(() => {
    fetchGradeStatistics();
  }, [fetchGradeStatistics]);

  return {
    ...state,
    refresh,
  };
};
