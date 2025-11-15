// src/services/roles.service.ts
import { api } from '@/config/api';
import {
  Role,
  RoleWithRelations,
  RolesQuery,
  PaginatedRoles,
  RoleStats,
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionDto,
  AssignMultiplePermissionsDto,
  RemoveMultiplePermissionsDto,
  RolePermission,
  RoleTypeInfo,
} from '@/types/roles.types';

export const rolesService = {
  /**
   * Obtener tipos de roles disponibles
   */
  async getRoleTypes(): Promise<RoleTypeInfo[]> {
    const response = await api.get('/api/roles/role-types');
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener tipos de rol');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener roles paginados con filtros
   */
  async getRoles(query: RolesQuery = {}): Promise<PaginatedRoles> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.isSystem !== undefined) params.append('isSystem', query.isSystem.toString());
    if (query.roleType) params.append('roleType', query.roleType);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get(`/api/roles?${params.toString()}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener roles');
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || {
      page: query.page || 1,
      limit: query.limit || 10,
      total: 0,
      totalPages: 0,
    };

    return { data, meta };
  },

  /**
   * Obtener rol por ID
   */
  async getRoleById(id: number): Promise<RoleWithRelations> {
    const response = await api.get(`/api/roles/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el rol');
    }

    if (!response.data.data) {
      throw new Error('Rol no encontrado');
    }

    return response.data.data;
  },

  /**
   * Obtener permisos de un rol
   */
  async getRolePermissions(id: number): Promise<RolePermission[]> {
    const response = await api.get(`/api/roles/${id}/permissions`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener permisos');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener estadísticas de un rol
   */
  async getRoleStats(id: number): Promise<RoleStats> {
    const response = await api.get(`/api/roles/${id}/stats`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estadísticas');
    }

    return response.data.data;
  },

  /**
   * Crear rol
   */
  async createRole(data: CreateRoleDto): Promise<Role> {
    const response = await api.post('/api/roles', data);
      console.log(response);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear el rol');
    }

    return response.data.data;
  },

  /**
   * Actualizar rol
   */
  async updateRole(id: number, data: UpdateRoleDto): Promise<Role> {
    const response = await api.patch(`/api/roles/${id}`, data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar el rol');
    }

    return response.data.data;
  },

  /**
   * Eliminar rol (soft delete)
   */
  async deleteRole(id: number): Promise<void> {
    const response = await api.delete(`/api/roles/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar el rol');
    }
  },

  /**
   * Restaurar rol
   */
  async restoreRole(id: number): Promise<Role> {
    const response = await api.patch(`/api/roles/${id}/restore`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al restaurar el rol');
    }

    return response.data.data;
  },

  /**
   * Asignar permiso a rol
   */
  async assignPermission(roleId: number, data: AssignPermissionDto): Promise<void> {
    const response = await api.post(`/api/roles/${roleId}/permissions`, data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al asignar permiso');
    }
  },

  /**
   * Asignar múltiples permisos
   */
  async assignMultiplePermissions(
    roleId: number,
    data: AssignMultiplePermissionsDto
  ): Promise<{ assigned: number; skipped: number }> {
    const response = await api.post(`/api/roles/${roleId}/permissions/bulk`, data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al asignar permisos');
    }

    return response.data.data;
  },

  /**
   * Remover permiso de rol
   */
  async removePermission(roleId: number, permissionId: number): Promise<void> {
    const response = await api.delete(`/api/roles/${roleId}/permissions/${permissionId}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al remover permiso');
    }
  },

  /**
   * Remover múltiples permisos
   */
  async removeMultiplePermissions(
    roleId: number,
    data: RemoveMultiplePermissionsDto
  ): Promise<{ removed: number }> {
    const response = await api.delete(`/api/roles/${roleId}/permissions/bulk`, { data });
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al remover permisos');
    }

    return response.data.data;
  },
};