// src/services/permissions.service.ts
import { api } from '@/config/api';
import {
  Permission,
  PermissionWithRelations,
  PermissionsQuery,
  PaginatedPermissions,
  PermissionStats,
} from '@/types/permissions.types';

export const permissionsService = {
  /**
   * Obtener permisos paginados con filtros
   */
  async getPermissions(query: PermissionsQuery = {}): Promise<PaginatedPermissions> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.module) params.append('module', query.module);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.isSystem !== undefined) params.append('isSystem', query.isSystem.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get(`/api/permissions?${params.toString()}`);
        console.log('Response data:', response);

    // ✅ VALIDACIÓN AGREGADA
    if (!response.data.data) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener permisos');
    }


    // ✅ VALIDACIÓN: data puede ser array vacío
    const data = Array.isArray(response.data.data) ? response.data.data : [];
    
    // ✅ VALIDACIÓN: meta con valores por defecto
    const meta = response.data.meta || {
      page: query.page || 1,
      limit: query.limit || 10,
      total: 0,
      totalPages: 0,
    };

    return { data, meta };
  },

  /**
   * Obtener permiso por ID
   */
  async getPermissionById(id: number): Promise<PermissionWithRelations> {
    const response = await api.get(`/api/permissions/${id}`);
    
    // ✅ VALIDACIÓN AGREGADA
    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener el permiso');
    }

    if (!response.data.data) {
      throw new Error('Permiso no encontrado');
    }
    console.log('Permission data:', response.data.data);
    return response.data.data;
  },

  /**
   * Obtener módulos únicos
   */
  async getModules(): Promise<string[]> {
    const response = await api.get('/api/permissions/modules');
    
    // ✅ VALIDACIÓN AGREGADA
    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener módulos');
    }

    // ✅ VALIDACIÓN: data puede ser array vacío
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener estadísticas por módulo
   */
  async getStatsByModule(): Promise<PermissionStats> {
    const response = await api.get('/api/permissions/stats/by-module');
    
    // ✅ VALIDACIÓN AGREGADA
    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener estadísticas');
    }

    // ✅ VALIDACIÓN: data puede ser objeto vacío
    return response.data.data || {};
  },

  /**
   * Obtener permisos dependientes
   */
  async getDependentPermissions(id: number): Promise<Permission[]> {
    const response = await api.get(`/api/permissions/${id}/dependents`);
    
    // ✅ VALIDACIÓN AGREGADA
    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener dependientes');
    }

    // ✅ VALIDACIÓN: data puede ser array vacío
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Actualizar permiso
   */
  async updatePermission(
    id: number,
    data: { description?: string; isActive?: boolean }
  ): Promise<Permission> {
    const response = await api.patch(`/api/permissions/${id}`, data);
    
    // ✅ VALIDACIÓN AGREGADA
    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al actualizar el permiso');
    }

    if (!response.data.data) {
      throw new Error('No se recibieron datos del permiso actualizado');
    }

    return response.data.data;
  },
};