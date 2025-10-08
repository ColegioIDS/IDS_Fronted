// src/hooks/usePermissions.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getPermissions, getPermissionById } from '@/services/permissionsService';
import { PermissionWithRelations, PermissionDetail, PermissionFilters } from '@/types/permissions';
import { PaginatedResponse } from '@/types/api';

// ==================== QUERY KEYS ====================
export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'list'] as const,
  list: (filters?: PermissionFilters) => [...permissionKeys.lists(), filters] as const,
  details: () => [...permissionKeys.all, 'detail'] as const,
  detail: (id: number) => [...permissionKeys.details(), id] as const,
};

// ==================== HOOKS ====================

/**
 * Hook para obtener lista de permisos con paginación
 */
export function usePermissions(
  filters?: PermissionFilters,
  enabled: boolean = true
): UseQueryResult<PaginatedResponse<PermissionWithRelations>, Error> {
  return useQuery({
    queryKey: permissionKeys.list(filters),
    queryFn: () => getPermissions(filters),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener un permiso por ID
 */
export function usePermission(
  id: number | undefined,
  enabled?: boolean
): UseQueryResult<PermissionDetail, Error> {
  return useQuery({
    queryKey: permissionKeys.detail(id!),
    queryFn: () => getPermissionById(id!),
    enabled: enabled ?? !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook especializado para selector de permisos
 */
export function usePermissionsForSelector(enabled: boolean = true) {
  return usePermissions(
    { 
      limit: 100,
      isActive: true 
    },
    enabled
  );
}