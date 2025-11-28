// src/hooks/data/useSchoolCycles.ts

import { useState, useEffect, useCallback } from 'react';
import { schoolCycleService } from '@/services/school-cycle.service';
import {
  SchoolCycle,
  QuerySchoolCyclesDto,
  PaginatedResponse,
} from '@/types/school-cycle.types';

export function useSchoolCycles(initialQuery: QuerySchoolCyclesDto = {}) {
  const [data, setData] = useState<SchoolCycle[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QuerySchoolCyclesDto>(initialQuery);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await schoolCycleService.getAll(query);
      setData(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      setError(err.message || 'Error al cargar ciclos escolares');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateQuery = useCallback((newQuery: Partial<QuerySchoolCyclesDto>) => {
    setQuery((prev) => ({ ...prev, ...newQuery, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);

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