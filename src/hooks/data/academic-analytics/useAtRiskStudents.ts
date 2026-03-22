'use client';

import { useEffect, useState, useCallback } from 'react';
import { AtRiskStudentsData } from '@/types/academic-analytics.types';
import { academicAnalyticsService } from '@/services/academic-analytics.service';

interface UseAtRiskStudentsState {
  data: AtRiskStudentsData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * ⚠️ Hook para obtener lista de estudiantes en riesgo
 *
 * Obtiene datos de estudiantes en riesgo incluyendo:
 * - Nivel de riesgo académico y de asistencia
 * - Detalles de ausencias
 * - Alertas de asistencia
 * - Recomendaciones personalizadas
 * - Conteos de riesgo por nivel (crítico, alto, medio, bajo)
 *
 * @param gradeId - ID del grado (requerido)
 * @param sectionId - ID de la sección (requerido)
 * @param enabled - Habilitar/deshabilitar el hook (default: true)
 *
 * @returns {UseAtRiskStudentsState} Estado del dato con loading y error
 *
 * @example
 * const { data: atRisk, isLoading, error, refresh } = useAtRiskStudents(1, 2);
 * if (isLoading) return <div>Cargando...</div>;
 * return (
 *   <div>
 *     <p>Riesgo crítico: {atRisk?.criticalRiskCount}</p>
 *     <p>Total en riesgo: {atRisk?.totalStudentsAtRisk}</p>
 *   </div>
 * );
 */
export const useAtRiskStudents = (
  gradeId: number | null,
  sectionId: number | null,
  enabled: boolean = true
) => {
  const [state, setState] = useState<UseAtRiskStudentsState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchAtRiskStudents = useCallback(async () => {
    if (!gradeId || !sectionId || !enabled) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await academicAnalyticsService.getAtRiskStudents(
        gradeId,
        sectionId
      );
      setState({ data: result, isLoading: false, error: null });
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar estudiantes en riesgo';
      setState({ data: null, isLoading: false, error: errorMessage });
      console.error('Error fetchAtRiskStudents:', err);
    }
  }, [gradeId, sectionId, enabled]);

  useEffect(() => {
    fetchAtRiskStudents();
  }, [gradeId, sectionId, enabled, fetchAtRiskStudents]);

  const refresh = useCallback(() => {
    fetchAtRiskStudents();
  }, [fetchAtRiskStudents]);

  return {
    ...state,
    refresh,
  };
};
