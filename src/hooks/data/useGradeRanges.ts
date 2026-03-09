// src/hooks/data/useGradeRanges.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { gradeRangesService } from '@/services/grade-ranges.service';
import { GradeRange, QueryGradeRangesDto, PaginatedGradeRangesResponse } from '@/types/grade-ranges.types';

interface UseGradeRangesReturn {
  data: GradeRange[];
  meta: PaginatedGradeRangesResponse['meta'] | null;
  isLoading: boolean;
  error: string | null;
  query: QueryGradeRangesDto;
  updateQuery: (newQuery: Partial<QueryGradeRangesDto>) => void;
  setPage: (page: number) => void;
  refresh: () => void;
}

/**
 * 📊 Hook para gestión de lista de rangos de calificaciones con paginación y filtros
 */
export function useGradeRanges(initialQuery: QueryGradeRangesDto = {}): UseGradeRangesReturn {
  const [data, setData] = useState<GradeRange[]>([]);
  const [meta, setMeta] = useState<PaginatedGradeRangesResponse['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QueryGradeRangesDto>({
    page: 1,
    limit: 10,
    sortBy: 'minScore',
    sortOrder: 'asc',
    ...initialQuery,
  });

  const fetchGradeRanges = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await gradeRangesService.getAll(query);
      setData(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.message || 'Error al cargar rangos de calificaciones');
      setData([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchGradeRanges();
  }, [fetchGradeRanges]);

  const updateQuery = useCallback((newQuery: Partial<QueryGradeRangesDto>) => {
    setQuery(prev => ({ ...prev, ...newQuery }));
  }, []);

  const setPage = useCallback((page: number) => {
    updateQuery({ page });
  }, [updateQuery]);

  const refresh = useCallback(() => {
    fetchGradeRanges();
  }, [fetchGradeRanges]);

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

export default useGradeRanges;
