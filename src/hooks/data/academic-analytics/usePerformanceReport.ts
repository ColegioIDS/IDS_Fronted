'use client';

import { useEffect, useState, useCallback } from 'react';
import { PerformanceReport } from '@/types/academic-analytics.types';
import { academicAnalyticsService } from '@/services/academic-analytics.service';

interface UsePerformanceReportState {
  data: PerformanceReport | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 🎓 Hook para obtener el reporte de desempeño de un estudiante
 *
 * Obtiene datos detallados del desempeño académico incluyendo:
 * - Desglose por bimestres con componentes
 * - Trend y status académico
 * - Predicción de calificación final
 * - Recomendaciones personalizadas
 *
 * @param enrollmentId - ID de la matrícula del estudiante
 * @param enabled - Habilitar/deshabilitar el hook (default: true)
 *
 * @returns {UsePerformanceReportState} Estado del dato con loading y error
 *
 * @example
 * const { data: report, isLoading, error, refresh } = usePerformanceReport(123);
 * if (isLoading) return <div>Cargando...</div>;
 * if (error) return <div className="text-red-500">{error}</div>;
 * return <div>{report?.student.firstName}</div>;
 */
export const usePerformanceReport = (
  enrollmentId: number | null,
  enabled: boolean = true
) => {
  const [state, setState] = useState<UsePerformanceReportState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchPerformanceReport = useCallback(async () => {
    if (!enrollmentId || !enabled) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await academicAnalyticsService.getPerformanceReport(
        enrollmentId
      );
      setState({ data: result, isLoading: false, error: null });
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar reporte de desempeño';
      setState({ data: null, isLoading: false, error: errorMessage });
      console.error('Error fetchPerformanceReport:', err);
    }
  }, [enrollmentId, enabled]);

  useEffect(() => {
    fetchPerformanceReport();
  }, [enrollmentId, enabled, fetchPerformanceReport]);

  const refresh = useCallback(() => {
    fetchPerformanceReport();
  }, [fetchPerformanceReport]);

  return {
    ...state,
    refresh,
  };
};
