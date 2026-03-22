// src/hooks/data/academic-analytics/useAnalyticsData.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { academicAnalyticsService } from '@/services/academic-analytics.service';
import { AnalyticsData } from '@/types/academic-analytics.types';

interface UseAnalyticsDataReturn {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 📊 Hook para obtener datos en cascada para analítica académica
 *
 * Retorna:
 * - Ciclo escolar activo
 * - Bimestres disponibles
 * - Grados disponibles
 * - Secciones agrupadas por grado
 *
 * @example
 * const { data, isLoading, error, refresh } = useAnalyticsData();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorAlert message={error} />;
 *
 * return (
 *   <>
 *     <CycleFilter cycle={data?.cycle} />
 *     <BimesterFilter bimesters={data?.bimesters} />
 *     <GradeSection grades={data?.grades} sections={data?.gradesSections} />
 *   </>
 * );
 */
export function useAnalyticsData(): UseAnalyticsDataReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await academicAnalyticsService.getAnalyticsData();
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos de analítica');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const refresh = useCallback(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}

export default useAnalyticsData;
