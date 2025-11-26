// src/hooks/data/useBimesters.ts

import { useState, useEffect, useCallback } from 'react';
import { bimesterService } from '@/services/bimester.service';
import {
  Bimester,
  QueryBimestersDto,
  PaginatedBimestersResponse,
} from '@/types/bimester.types';

/**
 * Hook para gestionar bimestres
 *
 * Sigue el patrón establecido en master_guide_general_v2.md
 *
 * Uso:
 * ```tsx
 * const { data, meta, isLoading, error, refresh } = useBimesters({
 *   schoolCycleId: 1,
 *   limit: 100
 * });
 * ```
 */
export function useBimesters(initialQuery: QueryBimestersDto = {}) {
  const [data, setData] = useState<Bimester[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QueryBimestersDto>(initialQuery);

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ✅ Solo hacer request si tenemos cycleId
      if (!query.schoolCycleId) {
        setData([]);
        setIsLoading(false);
        return;
      }

      const result = await bimesterService.getAll(query);
      setData(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar bimestres';
      setError(errorMessage);
      console.error('Error loading bimesters:', err);
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
  const updateQuery = useCallback((newQuery: Partial<QueryBimestersDto>) => {
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

export default useBimesters;