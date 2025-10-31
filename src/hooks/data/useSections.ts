// src/hooks/data/useSections.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { sectionsService } from '@/services/sections.service';
import type {
  Section,
  QuerySectionsDto,
  PaginatedSectionsResponse,
} from '@/types/sections.types';

interface UseSectionsOptions extends Omit<QuerySectionsDto, 'page' | 'limit'> {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function useSections(options: UseSectionsOptions = {}) {
  const {
    page = 1,
    limit = 10,
    autoFetch = true,
    ...filters
  } = options;

  const [data, setData] = useState<Section[]>([]);
  const [meta, setMeta] = useState<PaginatedSectionsResponse['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState<QuerySectionsDto>({
    page,
    limit,
    ...filters,
  });

  const fetchSections = useCallback(async (params?: QuerySectionsDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await sectionsService.getAll(params || query);
      setData(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error fetching sections'));
      setData([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const updateQuery = useCallback((newQuery: Partial<QuerySectionsDto>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

  const setPage = useCallback((newPage: number) => {
    updateQuery({ page: newPage });
  }, [updateQuery]);

  const refresh = useCallback(() => {
    fetchSections(query);
  }, [fetchSections, query]);

  useEffect(() => {
    if (autoFetch) {
      fetchSections(query);
    }
  }, [query, autoFetch, fetchSections]);

  return {
    data,
    meta,
    isLoading,
    error,
    query,
    updateQuery,
    setPage,
    refresh,
    fetchSections,
  };
}
