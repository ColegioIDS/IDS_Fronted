// src/hooks/data/useAcademicWeeks.ts

import { useState, useEffect, useCallback } from 'react';
import { academicWeekService } from '@/services/academic-week.service';
import {
  AcademicWeek,
  QueryAcademicWeeksDto,
  PaginatedAcademicWeeksResponse,
} from '@/types/academic-week.types';

/**
 * 🎓 Hook para gestionar semanas académicas
 * 
 * Uso:
 * ```tsx
 * const { data, meta, isLoading, error, refresh } = useAcademicWeeks({
 *   bimesterId: 1,
 *   limit: 20
 * });
 * ```
 */
export function useAcademicWeeks(initialQuery: QueryAcademicWeeksDto = {}) {
  const [data, setData] = useState<AcademicWeek[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QueryAcademicWeeksDto>(initialQuery);

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await academicWeekService.getAll(query);
      setData(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar semanas académicas';
      setError(errorMessage);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  // Efecto inicial
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actualizar query (resetea a página 1)
  const updateQuery = useCallback((newQuery: Partial<QueryAcademicWeeksDto>) => {
    setQuery((prev) => ({ ...prev, ...newQuery, page: 1 }));
  }, []);

  // Cambiar página
  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);

  // Refrescar datos
  const refresh = useCallback(() => loadData(), [loadData]);

  return {
    data,
    meta,
    isLoading,
    error,
    query,
    updateQuery,
    setPage,
    refresh,
  };
}

export default useAcademicWeeks;
