// src/hooks/data/useGrades.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { gradesService } from '@/services/grades.service';
import { Grade, QueryGradesDto, PaginatedGradesResponse } from '@/types/grades.types';

interface UseGradesReturn {
  data: Grade[];
  meta: PaginatedGradesResponse['meta'] | null;
  isLoading: boolean;
  error: string | null;
  query: QueryGradesDto;
  updateQuery: (newQuery: Partial<QueryGradesDto>) => void;
  setPage: (page: number) => void;
  refresh: () => void;
}

/**
 * 📚 Hook para gestión de lista de grados con paginación y filtros
 */
export function useGrades(initialQuery: QueryGradesDto = {}): UseGradesReturn {
  const [data, setData] = useState<Grade[]>([]);
  const [meta, setMeta] = useState<PaginatedGradesResponse['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QueryGradesDto>({
    page: 1,
    limit: 10,
    sortBy: 'order',
    sortOrder: 'asc',
    ...initialQuery,
  });

  const fetchGrades = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await gradesService.getAll(query);
      setData(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.message || 'Error al cargar grados');
      setData([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const updateQuery = useCallback((newQuery: Partial<QueryGradesDto>) => {
    setQuery(prev => ({ ...prev, ...newQuery }));
  }, []);

  const setPage = useCallback((page: number) => {
    updateQuery({ page });
  }, [updateQuery]);

  const refresh = useCallback(() => {
    fetchGrades();
  }, [fetchGrades]);

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

export default useGrades;
