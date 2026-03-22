'use client';

import { useEffect, useState, useCallback } from 'react';
import { TopStudentsData } from '@/types/academic-analytics.types';
import { academicAnalyticsService } from '@/services/academic-analytics.service';

interface UseTopStudentsState {
  data: TopStudentsData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 🏆 Hook para obtener los N mejores estudiantes
 *
 * Obtiene los mejores estudiantes ordenados por promedio descendente,
 * agrupados por grado y sección.
 *
 * Parámetros soportados:
 * - cycleId: ID del ciclo escolar (requerido)
 * - top: Cantidad de mejores estudiantes a mostrar (requerido)
 * - bimesterIds: IDs de bimestres para filtrar (opcional)
 * - gradeIds: IDs de grados para filtrar (opcional)
 * - sectionIds: IDs de secciones para filtrar (opcional)
 *
 * @param cycleId - ID del ciclo escolar
 * @param top - Cantidad de mejores estudiantes a retornar
 * @param bimesterIds - IDs de bimestres (opcional)
 * @param gradeIds - IDs de grados (opcional)
 * @param sectionIds - IDs de secciones (opcional)
 * @param enabled - Habilitar/deshabilitar el hook (default: true)
 *
 * @returns {UseTopStudentsState} Estado del dato con loading y error
 *
 * @example
 * // Top 10 de todo el ciclo
 * const { data, isLoading, error, refresh } = useTopStudents(1, 10);
 *
 * // Top 5 de grado 1, sección 1
 * const { data, isLoading, error, refresh } = useTopStudents(1, 5, undefined, [1], [1]);
 *
 * // Top 3 basado en bimestres 1 y 2
 * const { data, isLoading, error, refresh } = useTopStudents(1, 3, [1, 2]);
 */
export const useTopStudents = (
  cycleId: number | null,
  top: number | null,
  bimesterIds?: number[],
  gradeIds?: number[],
  sectionIds?: number[],
  enabled: boolean = true
) => {
  const [state, setState] = useState<UseTopStudentsState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchTopStudents = useCallback(async () => {
    if (!cycleId || !top || !enabled) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await academicAnalyticsService.getTopStudents(
        cycleId,
        top,
        bimesterIds,
        gradeIds,
        sectionIds
      );
      setState({ data: result, isLoading: false, error: null });
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar mejores estudiantes';
      setState({ data: null, isLoading: false, error: errorMessage });
      console.error('Error fetchTopStudents:', err);
    }
  }, [cycleId, top, bimesterIds, gradeIds, sectionIds, enabled]);

  useEffect(() => {
    fetchTopStudents();
  }, [cycleId, top, bimesterIds, gradeIds, sectionIds, enabled, fetchTopStudents]);

  const refresh = useCallback(() => {
    fetchTopStudents();
  }, [fetchTopStudents]);

  return {
    ...state,
    refresh,
  };
};
