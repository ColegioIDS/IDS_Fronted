// src/services/attendance-permissions.service.ts
import { api } from '@/config/api';
import {
  AttendancePermission,
  AttendancePermissionWithRelations,
  AttendancePermissionsQuery,
  PaginatedAttendancePermissions,
  PermissionMatrix,
  PermissionsDashboardSummary,
  RolePermissionsSummary,
  PermissionTemplate,
  CreateAttendancePermissionDto,
  UpdateAttendancePermissionDto,
  BulkCreatePermissionsDto,
  BulkUpdatePermissionsDto,
  BulkOperationResult,
  TeacherRolesResponse,
  RolesByTypeResponse,
} from '@/types/attendance-permissions.types';

// Helper para limpiar parámetros undefined/null
const cleanParams = (params: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Convertir strings que son números a números reales
      if (typeof value === 'string' && key.match(/page|limit|id|Id/i)) {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          cleaned[key] = numValue;
        } else {
          cleaned[key] = value;
        }
      } else {
        cleaned[key] = value;
      }
    }
  });

  return cleaned;
};

export const attendancePermissionsService = {
  /**
   * Obtener permisos paginados con filtros
   */
  async getPermissions(
    query: AttendancePermissionsQuery = {}
  ): Promise<PaginatedAttendancePermissions> {
    const params = cleanParams({
      page: query.page || 1,
      limit: query.limit || 10,
      roleId: query.roleId,
      attendanceStatusId: query.attendanceStatusId,
      canApprove: query.canApprove,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    const response = await api.get('/api/attendance-permissions', { params });

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener permisos de asistencia'
      );
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
   * Obtener un permiso específico
   */
  async getPermissionById(
    roleId: number,
    attendanceStatusId: number
  ): Promise<AttendancePermissionWithRelations> {
    const response = await api.get(
      `/api/attendance-permissions/${roleId}/${attendanceStatusId}`
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener el permiso'
      );
    }

    if (!response.data.data) {
      throw new Error('Permiso no encontrado');
    }

    return response.data.data;
  },

  /**
   * Crear un nuevo permiso
   */
  async createPermission(
    data: CreateAttendancePermissionDto
  ): Promise<AttendancePermission> {
    const response = await api.post('/api/attendance-permissions', data);

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al crear el permiso'
      );
    }

    return response.data.data;
  },

  /**
   * Actualizar un permiso
   */
  async updatePermission(
    roleId: number,
    attendanceStatusId: number,
    data: UpdateAttendancePermissionDto
  ): Promise<AttendancePermission> {
    const response = await api.patch(
      `/api/attendance-permissions/${roleId}/${attendanceStatusId}`,
      data
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al actualizar el permiso'
      );
    }

    return response.data.data;
  },

  /**
   * Eliminar un permiso
   */
  async deletePermission(
    roleId: number,
    attendanceStatusId: number
  ): Promise<void> {
    const response = await api.delete(
      `/api/attendance-permissions/${roleId}/${attendanceStatusId}`
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al eliminar el permiso'
      );
    }
  },

  /**
   * Obtener todos los permisos de un rol
   */
  async getPermissionsByRole(roleId: number): Promise<AttendancePermission[]> {
    const response = await api.get(
      `/api/attendance-permissions/by-role/${roleId}`
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener permisos del rol'
      );
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener todos los permisos por estado
   */
  async getPermissionsByStatus(
    attendanceStatusId: number
  ): Promise<AttendancePermission[]> {
    const response = await api.get(
      `/api/attendance-permissions/by-status/${attendanceStatusId}`
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener permisos del estado'
      );
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener roles tipo TEACHER
   */
  async getTeacherRoles(page = 1, limit = 10): Promise<TeacherRolesResponse> {
    const params = cleanParams({ page, limit });
    const response = await api.get(
      '/api/attendance-permissions/teachers/list',
      { params }
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener roles de maestros'
      );
    }

    return response.data.data || { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
  },

  /**
   * Obtener roles por tipo
   */
  async getRolesByType(
    roleType: string,
    page = 1,
    limit = 10
  ): Promise<RolesByTypeResponse> {
    const params = cleanParams({ page, limit });
    const response = await api.get(
      `/api/attendance-permissions/roles/${roleType}`,
      { params }
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener roles por tipo'
      );
    }

    return response.data.data;
  },

  /**
   * Obtener matriz de permisos
   */
  async getPermissionsMatrix(roleType?: string): Promise<PermissionMatrix> {
    const params = new URLSearchParams();
    if (roleType) params.append('roleType', roleType);

    const response = await api.get(
      `/api/attendance-permissions/matrix${params.toString() ? '?' + params.toString() : ''}`
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener matriz de permisos'
      );
    }

    return response.data.data;
  },

  /**
   * Obtener resumen general del dashboard
   */
  async getDashboardSummary(): Promise<PermissionsDashboardSummary> {
    const response = await api.get(
      '/api/attendance-permissions/dashboard/summary'
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener resumen del dashboard'
      );
    }

    return response.data.data;
  },

  /**
   * Obtener resumen de permisos de un rol
   */
  async getRolePermissionsSummary(
    roleId: number
  ): Promise<RolePermissionsSummary> {
    const response = await api.get(
      `/api/attendance-permissions/summary/${roleId}`
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener resumen del rol'
      );
    }

    return response.data.data;
  },

  /**
   * Obtener plantilla para un tipo de rol
   */
  async getTemplate(roleType: string): Promise<PermissionTemplate> {
    const response = await api.get(
      `/api/attendance-permissions/templates/${roleType}`
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener plantilla'
      );
    }

    return response.data.data;
  },

  /**
   * Crear múltiples permisos en lote
   */
  async createPermissionsBulk(
    permissions: CreateAttendancePermissionDto[]
  ): Promise<BulkOperationResult> {
    const response = await api.post('/api/attendance-permissions/bulk', permissions);

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al crear permisos en lote'
      );
    }

    return response.data.data || { inserted: 0, failed: 0, results: [] };
  },

  /**
   * Actualizar múltiples permisos de un rol
   */
  async updatePermissionsBatch(
    roleId: number,
    updates: Array<{
      attendanceStatusId: number;
      data: UpdateAttendancePermissionDto;
    }>
  ): Promise<BulkOperationResult> {
    const response = await api.patch(
      `/api/attendance-permissions/roles/${roleId}/batch`,
      updates
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al actualizar permisos en lote'
      );
    }

    return response.data.data || { updated: 0, results: [] };
  },

  /**
   * Eliminar todos los permisos de un rol
   */
  async deleteRolePermissions(roleId: number): Promise<{ deletedCount: number }> {
    const response = await api.delete(
      `/api/attendance-permissions/roles/${roleId}?confirm=true`
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al eliminar permisos del rol'
      );
    }

    return response.data.data || { deletedCount: 0 };
  },

  /**
   * Obtener lista de maestros/roles de maestros paginada
   */
  async getTeachersList(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      roleType?: string;
    } = {}
  ): Promise<PaginatedAttendancePermissions> {
    const params = cleanParams({
      page: query.page || 1,
      limit: query.limit || 10,
      search: query.search,
      roleType: query.roleType,
    });

    const response = await api.get(
      '/api/attendance-permissions/teachers/list',
      { params }
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener lista de maestros'
      );
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
   * Obtener lista de roles
   */
  async getRoles(page = 1, limit = 100): Promise<any> {
    const params = cleanParams({ page, limit });
    const response = await api.get('/api/roles', { params });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener roles');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener lista de estados de asistencia
   */
  async getAttendanceStatuses(page = 1, limit = 100): Promise<any> {
    const params = cleanParams({ page, limit });
    const response = await api.get('/api/attendance-statuses', { params });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estados');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },
};

