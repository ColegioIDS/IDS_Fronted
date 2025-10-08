// src/hooks/useRoles.ts

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  createRolesBulk,
  updateRolesBulk,
  deleteRolesBulk,
} from '@/services/rolesService';
import {
  RoleWithRelations,
  RoleFilters,
  RoleFormValues,
  BulkCreateRolesPayload,
  BulkUpdateRolesPayload,
  BulkDeleteRolesPayload,
} from '@/types/roles';
import { PaginatedResponse } from '@/types/api';
import { permissionKeys } from './usePermissions';

// ==================== QUERY KEYS ====================
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters?: RoleFilters) => [...roleKeys.lists(), filters] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook para obtener lista de roles con paginación
 */
export function useRoles(
  filters?: RoleFilters,
  enabled: boolean = true
): UseQueryResult<PaginatedResponse<RoleWithRelations>, Error> {
  return useQuery({
    queryKey: roleKeys.list(filters),
    queryFn: () => getRoles(filters),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener un rol por ID
 */
export function useRole(
  id: number | undefined,
  enabled?: boolean
): UseQueryResult<RoleWithRelations, Error> {
  return useQuery({
    queryKey: roleKeys.detail(id!),
    queryFn: () => getRoleById(id!),
    enabled: enabled ?? !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook para crear un rol
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoleFormValues) => createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      toast.success('Rol creado correctamente');
    },
    onError: (error: any) => {
      const message = error?.message || 'Error al crear el rol';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar un rol
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RoleFormValues> }) =>
      updateRole(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      toast.success('Rol actualizado correctamente');
    },
    onError: (error: any) => {
      const message = error?.message || 'Error al actualizar el rol';
      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar un rol (soft delete)
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.removeQueries({ queryKey: roleKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      toast.success('Rol eliminado correctamente');
    },
    onError: (error: any) => {
      const message = error?.message || 'Error al eliminar el rol';
      toast.error(message);
    },
  });
}

// ==================== BULK MUTATION HOOKS ====================

/**
 * Hook para crear múltiples roles
 */
export function useCreateRolesBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkCreateRolesPayload) => createRolesBulk(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      toast.success(response.message || 'Roles creados correctamente');
    },
    onError: (error: any) => {
      const message = error?.message || 'Error al crear roles en lote';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar múltiples roles
 */
export function useUpdateRolesBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkUpdateRolesPayload) => updateRolesBulk(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      toast.success(response.message || 'Roles actualizados correctamente');
    },
    onError: (error: any) => {
      const message = error?.message || 'Error al actualizar roles en lote';
      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar múltiples roles
 */
export function useDeleteRolesBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkDeleteRolesPayload) => deleteRolesBulk(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      toast.success(response.message || 'Roles eliminados correctamente');
    },
    onError: (error: any) => {
      const message = error?.message || 'Error al eliminar roles en lote';
      toast.error(message);
    },
  });
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook especializado para selector de roles
 */
export function useRolesForSelector(enabled: boolean = true) {
  return useRoles({ limit: 100, isActive: true }, enabled);
}