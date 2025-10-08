// src/services/permissionsService.ts

import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  Permission, 
  PermissionWithRelations, 
  PermissionDetail,
  PermissionFilters 
} from '@/types/permissions';
import { PaginatedResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== PERMISSIONS ====================

/**
 * Obtener todos los permisos con paginación y filtros
 * GET /api/permissions
 */
export const getPermissions = async (
  filters?: PermissionFilters
): Promise<PaginatedResponse<PermissionWithRelations>> => {
  try {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.isSystem !== undefined) params.append('isSystem', String(filters.isSystem));

    const { data } = await apiClient.get<PaginatedResponse<PermissionWithRelations>>(
      '/api/permissions',
      { params }
    );

    return data;
  } catch (error) {
    handleApiError(error, 'Error al obtener permisos');
  }
};

/**
 * Obtener un permiso por ID
 * GET /api/permissions/:id
 */
export const getPermissionById = async (id: number): Promise<PermissionDetail> => {
  try {
    const { data } = await apiClient.get<PermissionDetail>(`/api/permissions/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el permiso');
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