// src/services/rolesService.ts

import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import {
  Role,
  RoleWithRelations,
  RoleFilters,
  RoleFormValues,
  BulkCreateRolesPayload,
  BulkUpdateRolesPayload,
  BulkDeleteRolesPayload,
  BulkOperationResponse,
} from '@/types/roles';
import { PaginatedResponse, ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== ROLES - CRUD ====================

/**
 * Obtener todos los roles con paginación y filtros
 * GET /api/roles
 */
export const getRoles = async (
  filters?: RoleFilters
): Promise<PaginatedResponse<RoleWithRelations>> => {
  try {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.isSystem !== undefined) params.append('isSystem', String(filters.isSystem));

    const { data } = await apiClient.get<PaginatedResponse<RoleWithRelations>>(
      '/api/roles',
      { params }
    );

    return data;
  } catch (error) {
    handleApiError(error, 'Error al obtener roles');
  }
};

/**
 * Obtener un rol por ID
 * GET /api/roles/:id
 */
export const getRoleById = async (id: number): Promise<RoleWithRelations> => {
  try {
    const { data } = await apiClient.get<ApiResponse<RoleWithRelations>>(`/api/roles/${id}`);
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el rol');
  }
};

/**
 * Crear un nuevo rol
 * POST /api/roles
 */
export const createRole = async (roleData: RoleFormValues): Promise<RoleWithRelations> => {
  try {
    const { data } = await apiClient.post<RoleWithRelations>('/api/roles', roleData);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al crear rol');
  }
};

/**
 * Actualizar un rol existente
 * PATCH /api/roles/:id
 */
export const updateRole = async (
  id: number,
  roleData: Partial<RoleFormValues>
): Promise<RoleWithRelations> => {
  try {
    const { data } = await apiClient.patch<RoleWithRelations>(`/api/roles/${id}`, roleData);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar rol');
  }
};

/**
 * Eliminar un rol (soft delete)
 * DELETE /api/roles/:id
 */
export const deleteRole = async (id: number): Promise<Role> => {
  try {
    const { data } = await apiClient.delete<Role>(`/api/roles/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al eliminar rol');
  }
};

// ==================== ROLES - BULK OPERATIONS ====================

/**
 * Crear múltiples roles
 * POST /api/roles/bulk
 */
export const createRolesBulk = async (
  payload: BulkCreateRolesPayload
): Promise<BulkOperationResponse> => {
  try {
    const { data } = await apiClient.post<BulkOperationResponse>('/api/roles/bulk', payload);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al crear roles en lote');
  }
};

/**
 * Actualizar múltiples roles
 * PATCH /api/roles/bulk
 */
export const updateRolesBulk = async (
  payload: BulkUpdateRolesPayload
): Promise<BulkOperationResponse> => {
  try {
    const { data } = await apiClient.patch<BulkOperationResponse>('/api/roles/bulk', payload);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar roles en lote');
  }
};

/**
 * Eliminar múltiples roles (soft delete)
 * DELETE /api/roles/bulk
 */
export const deleteRolesBulk = async (
  payload: BulkDeleteRolesPayload
): Promise<BulkOperationResponse> => {
  try {
    const { data } = await apiClient.delete<BulkOperationResponse>('/api/roles/bulk', {
      data: payload,
    });
    return data;
  } catch (error) {
    handleApiError(error, 'Error al eliminar roles en lote');
  }
};

// ==================== UTILS ====================

function handleApiError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || fallbackMessage;
    const details = error.response?.data?.details || [];
    const err = new Error(message);
    (err as any).details = details;
    throw err;
  }
  if (error instanceof Error) throw error;
  throw new Error(fallbackMessage);
}