// src/hooks/data/useRoles.ts
import { useState, useEffect, useCallback } from 'react';
import { rolesService } from '@/services/roles.service';
import { Role, RolesQuery, PaginatedRoles } from '@/types/roles.types';

export function useRoles(initialQuery: RolesQuery = {}) {
  const [data, setData] = useState<PaginatedRoles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<RolesQuery>(initialQuery);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ FIX: Usar useEffect con query serializado
  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await rolesService.getRoles(query);
        
        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error al cargar roles');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, [
    query.page,
    query.limit,
    query.search,
    query.isActive,
    query.isSystem,
    query.roleType,
    query.sortBy,
    query.sortOrder,
    refreshKey,
  ]); // ✅ Dependencias específicas en lugar del objeto completo

  const updateQuery = useCallback((newQuery: Partial<RolesQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

 const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    data,
    isLoading,
    error,
    query,
    updateQuery,
    refresh,
  };
}