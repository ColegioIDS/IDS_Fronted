// src/hooks/data/useSections.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { sectionsService } from '@/services/sections.service';
import type {
  Section,
  QuerySectionsDto,
  CreateSectionDto,
  UpdateSectionDto,
} from '@/types/sections.types';

interface UseSectionsReturn {
  data: Section[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  query: QuerySectionsDto;
  updateQuery: (newQuery: Partial<QuerySectionsDto>) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  createSection: (data: CreateSectionDto) => Promise<Section>;
  updateSection: (id: number, data: UpdateSectionDto) => Promise<Section>;
  deleteSection: (id: number) => Promise<void>;
}

/**
 * Hook para gestión de secciones con paginación y filtros
 */
export function useSections(initialQuery: QuerySectionsDto = {}): UseSectionsReturn {
  const [data, setData] = useState<Section[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QuerySectionsDto>({
    page: 1,
    limit: 12,
    sortBy: 'name',
    sortOrder: 'asc',
    ...initialQuery,
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await sectionsService.getAll(query);
      
      setData(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      setError(err.message || 'Error al cargar secciones');
      setData([]);
      setMeta({ page: 1, limit: 12, total: 0, totalPages: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateQuery = useCallback((newQuery: Partial<QuerySectionsDto>) => {
    setQuery((prev) => ({ ...prev, ...newQuery, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const createSection = useCallback(async (data: CreateSectionDto): Promise<Section> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await sectionsService.create(data);
      await loadData(); // Recargar lista
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al crear sección');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  const updateSection = useCallback(async (id: number, data: UpdateSectionDto): Promise<Section> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await sectionsService.update(id, data);
      await loadData(); // Recargar lista
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar sección');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  const deleteSection = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await sectionsService.delete(id);
      await loadData(); // Recargar lista
    } catch (err: any) {
      setError(err.message || 'Error al eliminar sección');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  return {
    data,
    meta,
    isLoading,
    error,
    query,
    updateQuery,
    setPage,
    refresh,
    createSection,
    updateSection,
    deleteSection,
  };
}
