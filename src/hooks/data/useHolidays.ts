// src/hooks/data/useHolidays.ts

import { useState, useEffect, useCallback } from 'react';
import { holidaysService } from '@/services/holidays.service';
import {
  Holiday,
  QueryHolidaysDto,
  PaginatedHolidaysResponse,
} from '@/types/holidays.types';

/**
 * 📅 Hook para gestionar días festivos
 * 
 * Uso:
 * ```tsx
 * const { data, meta, isLoading, error, refresh } = useHolidays({
 *   bimesterId: 1,
 *   limit: 20
 * });
 * ```
 */
export function useHolidays(initialQuery: QueryHolidaysDto = {}) {
  const [data, setData] = useState<Holiday[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QueryHolidaysDto>(initialQuery);

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await holidaysService.getAll(query);
      setData(Array.isArray(result.data) ? result.data : []);
      setMeta(result.meta || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar días festivos';
      setError(errorMessage);
      console.error('Error loading holidays:', err);
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
  const updateQuery = useCallback((newQuery: Partial<QueryHolidaysDto>) => {
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

export default useHolidays;
