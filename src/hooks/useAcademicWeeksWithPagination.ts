// hooks/useAcademicWeeksWithPagination.ts

import { useState, useEffect } from 'react';
import { academicWeekService } from '@/services/academic-week.service';
import { AcademicWeek, QueryAcademicWeeksDto } from '@/types/academic-week.types';

interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

interface UseAcademicWeeksWithPaginationReturn {
  data: AcademicWeek[];
  meta: PaginationMeta;
  isLoading: boolean;
  error: string | null;
  query: QueryAcademicWeeksDto;
  updateQuery: (newQuery: Partial<QueryAcademicWeeksDto>) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

const DEFAULT_META: PaginationMeta = {
  page: 1,
  perPage: 12,
  total: 0,
  totalPages: 1,
};

export function useAcademicWeeksWithPagination(): UseAcademicWeeksWithPaginationReturn {
  const [data, setData] = useState<AcademicWeek[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QueryAcademicWeeksDto>({
    page: 1,
    limit: 12,
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await academicWeekService.getAll(query);
      setData(response.data);
      setMeta({
        page: response.meta.page,
        perPage: response.meta.limit,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
      });
    } catch (err: any) {
      console.error('Error al cargar semanas académicas:', err);
      setError(err.message || 'Error al cargar las semanas académicas');
      setData([]);
      setMeta(DEFAULT_META);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [query]);

  const updateQuery = (newQuery: Partial<QueryAcademicWeeksDto>) => {
    setQuery((prev) => ({
      ...prev,
      ...newQuery,
      page: 1, // Reset to first page on filter change
    }));
  };

  const setPage = (page: number) => {
    setQuery((prev) => ({
      ...prev,
      page,
    }));
  };

  return {
    data,
    meta,
    isLoading,
    error,
    query,
    updateQuery,
    setPage,
    refresh: loadData,
  };
}
