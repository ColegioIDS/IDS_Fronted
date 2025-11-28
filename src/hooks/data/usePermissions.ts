// src/hooks/data/usePermissions.ts
import { useState, useEffect, useCallback } from 'react';
import { permissionsService } from '@/services/permissions.service';
import {
  Permission,
  PermissionModule,
  PermissionsQuery,
  PaginatedPermissions,
} from '@/types/permissions.types';

export function usePermissions(initialQuery: PermissionsQuery = {}) {
  const [data, setData] = useState<PaginatedPermissions | null>(null);
  const [groupedData, setGroupedData] = useState<PermissionModule[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<PermissionsQuery>(initialQuery);

  // 🔄 Cargar permisos
  const loadPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await permissionsService.getPermissions(query);
      setData(result);

      // Agrupar por módulo
      const grouped = groupByModule(result.data);
      setGroupedData(grouped);
    } catch (err: any) {
      setError(err.message || 'Error al cargar permisos');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  // 🔄 Cargar módulos
  const loadModules = useCallback(async () => {
    try {
      const modulesList = await permissionsService.getModules();
      setModules(modulesList);
    } catch (err) {
    }
  }, []);

  // 🧠 Memoizar updateQuery y refresh
  const updateQuery = useCallback((newQuery: Partial<PermissionsQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

  const refresh = useCallback(() => {
    loadPermissions();
  }, [loadPermissions]);

  // ⏳ Ejecutar carga inicial
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  return {
    data,
    groupedData,
    modules,
    isLoading,
    error,
    query,
    updateQuery,
    refresh,
  };
}

// 🔧 Helper: Agrupar permisos por módulo
function groupByModule(permissions: Permission[]): PermissionModule[] {
  const grouped = permissions.reduce((acc, permission) => {
    const module = permission.module;

    if (!acc[module]) {
      acc[module] = {
        module,
        permissions: [],
        totalPermissions: 0,
        activePermissions: 0,
        rolesCount: 0,
        usedInRoles: [],
      };
    }

    acc[module].permissions.push(permission);
    acc[module].totalPermissions++;
    if (permission.isActive) acc[module].activePermissions++;

    return acc;
  }, {} as Record<string, PermissionModule>);

  return Object.values(grouped).sort((a, b) => a.module.localeCompare(b.module));
}
