// hooks/usePermissionFilters.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Permission } from '@/types/permission';
import { FilterOptions } from '@/types/permission';


type SortConfig = {
  key: keyof Permission;
  direction: 'asc' | 'desc';
};

export const usePermissionFilters = (permissions: Permission[] = []) => {
  const [filters, setFilters] = useState<FilterOptions>({
    module: 'all',
    action: 'all',
    status: 'all',
    system: 'all',
    search: ''
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'module',
    direction: 'asc'
  });

  // Valores únicos para los selects
  const uniqueValues = useMemo(() => ({
    modules: [...new Set(permissions.map(p => p.module))],
    actions: [...new Set(permissions.map(p => p.action))]
  }), [permissions]);

  // Filtrado y ordenamiento
  const filteredPermissions = useMemo(() => {
    let result = [...permissions];

    // Aplicar filtros
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(perm =>
        (perm.module ?? "").toLowerCase().includes(searchTerm) ||
        (perm.action ?? "").toLowerCase().includes(searchTerm) ||
        (perm.description ?? "").toLowerCase().includes(searchTerm)
      );
    }

    if (filters.module !== 'all') {
      result = result.filter(perm => perm.module === filters.module);
    }

    if (filters.action !== 'all') {
      result = result.filter(perm => perm.action === filters.action);
    }

    if (filters.status !== 'all') {
      result = result.filter(perm =>
        filters.status === 'active' ? perm.isActive : !perm.isActive
      );
    }

    if (filters.system !== 'all') {
      result = result.filter(perm =>
        filters.system === 'system' ? perm.isSystem : !perm.isSystem
      );
    }

    // Ordenamiento
    const { key, direction } = sortConfig;
    return result.sort((a, b) => {
      if (a[key]! < b[key]!) return direction === 'asc' ? -1 : 1;
      if (a[key]! > b[key]!) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [permissions, filters, sortConfig]);

  const requestSort = useCallback((key: keyof Permission) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      module: 'all',
      action: 'all',
      status: 'all',
      system: 'all',
      search: ''
    });
  }, []);

  return {
    filters,
    setFilters,
    sortConfig,
    requestSort,
    filteredPermissions,
    uniqueValues,
    resetFilters
  };
};