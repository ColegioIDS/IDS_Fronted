'use client';

import { useState, useEffect, useCallback } from 'react';
import { academicAnalyticsService } from '@/services/academic-analytics.service';
import { GradeRange } from '@/types/academic-analytics.types';

interface UseGradeRangesReturn {
  data: GradeRange[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 📊 Hook para obtener los rangos de calificaciones
 *
 * Obtiene todos los rangos de calificaciones configurados en el sistema
 * con información de colores, niveles educativos y letras de calificación
 *
 * @example
 * const { data: gradeRanges, isLoading, error } = useGradeRanges();
 * // data: [{name, minScore, maxScore, hexColor, level, ...}]
 */
export function useGradeRanges(): UseGradeRangesReturn {
  const [data, setData] = useState<GradeRange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGradeRanges = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await academicAnalyticsService.getGradeRanges();
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Error al cargar rangos de calificaciones');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGradeRanges();
  }, [fetchGradeRanges]);

  const refresh = useCallback(() => {
    fetchGradeRanges();
  }, [fetchGradeRanges]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}

export default useGradeRanges;