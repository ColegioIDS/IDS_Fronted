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
  DashboardSummaryResponse,
  AttendanceStatusResponse,
  RoleWithPermissionCount,
  StatusListQueryParams,
  PaginatedStatusResponse,
} from '@/types/attendance-permissions.types';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Limpia parámetros undefined/null de queries
 */
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

// ============================================
// MAIN SERVICE
// ============================================

export const attendancePermissionsService = {
  // ============================================
  // 1. DASHBOARD ENDPOINTS
  // ============================================

  /**
   * GET /api/attendance-permissions/dashboard/summary
   * Obtiene resumen estadístico general de permisos
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

    // El backend ya retorna la estructura correcta en response.data.data
    return response.data.data;
  },

  // ============================================
  // 2. TEACHER ROLES ENDPOINTS
  // ============================================

  /**
   * GET /api/attendance-permissions/teachers/list
   * Obtiene lista paginada de roles de tipo TEACHER
   */
  async getTeacherRoles(
    page = 1,
    limit = 10,
    search?: string
  ): Promise<TeacherRolesResponse> {
    const params = cleanParams({ page, limit, search });
    const response = await api.get(
      '/api/attendance-permissions/teachers/list',
      { params }
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener roles de maestros'
      );
    }

    return response.data.data || {
      data: [],
      meta: { page, limit, total: 0, totalPages: 0 },
    };
  },

  // ============================================
  // 3. MATRIX ENDPOINTS
  // ============================================

  /**
   * GET /api/attendance-permissions/matrix
   * Obtiene matriz completa de roles vs estados
   */
  async getPermissionsMatrix(
    roleType?: string,
    roleId?: number
  ): Promise<PermissionMatrix> {
    const params = cleanParams({ roleType, roleId });
    const response = await api.get('/api/attendance-permissions/matrix', {
      params,
    });

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener matriz de permisos'
      );
    }

    return response.data.data;
  },

  // ============================================
  // 4. ROLE-BASED ENDPOINTS
  // ============================================

  /**
   * GET /api/attendance-permissions/by-role/:roleId
   * Obtiene todos los permisos de un rol específico
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
   * GET /api/attendance-permissions/summary/:roleId
   * Obtiene resumen de permisos de un rol
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
   * GET /api/attendance-permissions/roles/:type
   * Obtiene roles por tipo con paginación
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

  // ============================================
  // 5. STATUS-BASED ENDPOINTS
  // ============================================

  /**
   * GET /api/attendance-permissions/by-status/:attendanceStatusId
   * Obtiene todos los permisos para un estado específico
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

  // ============================================
  // 6. TEMPLATE ENDPOINTS
  // ============================================

  /**
   * GET /api/attendance-permissions/templates/:roleType
   * Obtiene plantilla de permisos por tipo de rol
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

  // ============================================
  // 7. ATTENDANCE STATUS ENDPOINTS
  // ============================================

  /**
   * GET /api/attendance-permissions/statuses/list/all
   * Obtiene lista paginada de todos los estados de asistencia
   */
  async getAttendanceStatusesList(
    query: StatusListQueryParams = {}
  ): Promise<PaginatedStatusResponse> {
    const params = cleanParams({
      page: query.page || 1,
      limit: query.limit || 10,
      isActive: query.isActive,
      isNegative: query.isNegative,
      isExcused: query.isExcused,
      isTemporal: query.isTemporal,
      search: query.search,
      sortBy: query.sortBy || 'order',
      sortOrder: query.sortOrder || 'asc',
    });

    const response = await api.get(
      '/api/attendance-permissions/statuses/list/all',
      { params }
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener estados de asistencia'
      );
    }

    return response.data;
  },

  /**
   * GET /api/attendance-permissions/statuses/active
   * Obtiene solo los estados de asistencia activos (sin paginación)
   */
  async getActiveAttendanceStatuses(): Promise<AttendanceStatusResponse[]> {
    const response = await api.get(
      '/api/attendance-permissions/statuses/active'
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener estados activos'
      );
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * GET /api/attendance-permissions/statuses/:id
   * Obtiene un estado específico por ID
   */
  async getAttendanceStatusById(
    id: number
  ): Promise<AttendanceStatusResponse> {
    const response = await api.get(`/api/attendance-permissions/statuses/${id}`);

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener el estado'
      );
    }

    return response.data.data;
  },

  // ============================================
  // 8. PERMISSION LIST ENDPOINTS
  // ============================================

  /**
   * GET /api/attendance-permissions
   * Lista todos los permisos con paginación y filtros
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
   * GET /api/attendance-permissions/:roleId/:attendanceStatusId
   * Obtiene un permiso específico
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

  // ============================================
  // 9. CREATE ENDPOINTS
  // ============================================

  /**
   * POST /api/attendance-permissions
   * Crea un nuevo permiso
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
   * POST /api/attendance-permissions/bulk
   * Crea múltiples permisos en lote
   */
  async createPermissionsBulk(
    permissions: CreateAttendancePermissionDto[]
  ): Promise<BulkOperationResult> {
    const response = await api.post(
      '/api/attendance-permissions/bulk',
      permissions
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al crear permisos en lote'
      );
    }

    return response.data.data || { createdCount: 0, results: [] };
  },

  // ============================================
  // 10. UPDATE ENDPOINTS
  // ============================================

  /**
   * PATCH /api/attendance-permissions/:roleId/:attendanceStatusId
   * Actualiza un permiso específico
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
   * PATCH /api/attendance-permissions/roles/:roleId/batch
   * Actualiza múltiples permisos de un rol en lote
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

    return response.data.data || { updatedCount: 0, results: [] };
  },

  // ============================================
  // 11. DELETE ENDPOINTS
  // ============================================

  /**
   * DELETE /api/attendance-permissions/:roleId/:attendanceStatusId
   * Elimina un permiso específico
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
   * DELETE /api/attendance-permissions/roles/:roleId
   * Elimina todos los permisos de un rol
   */
  async deleteRolePermissions(
    roleId: number
  ): Promise<{ deletedCount: number }> {
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

  // ============================================
  // HELPER METHODS (Convenience wrappers)
  // ============================================
  /**
   * Obtener todos los roles disponibles (de todos los tipos)
   * Intenta obtener roles de diferentes tipos ADMIN, TEACHER, COORDINATOR
   */
  async getRoles(
    page = 1,
    limit = 100,
    search?: string
  ): Promise<RoleWithPermissionCount[]> {
    try {
      console.log('📋 Obteniendo matriz de permisos para extraer roles...');
      // Primero intentamos obtener la matriz completa que tiene todos los roles
      const matrix = await this.getPermissionsMatrix();
      
      if (matrix?.roles && Array.isArray(matrix.roles) && matrix.roles.length > 0) {
        console.log(`✅ Se obtuvieron ${matrix.roles.length} roles de la matriz`);
        return matrix.roles;
      }

      console.log('⚠️ La matriz no retornó roles, intentando getRolesByType...');
      // Si la matriz no tiene roles, intenta con los roles de tipo TEACHER como fallback
      const result = await this.getTeacherRoles(page, limit, search);
      const rolesData = result.data || [];
      console.log(`✅ Se obtuvieron ${rolesData.length} roles de tipo TEACHER`);
      return rolesData;
    } catch (error) {
      console.error('❌ Error obteniendo roles:', error);
      // Fallback final: intentar obtener cualquier rol
      try {
        const result = await this.getTeacherRoles(page, limit, search);
        const rolesData = result.data || [];
        console.log(`✅ Fallback: Se obtuvieron ${rolesData.length} roles`);
        return rolesData;
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
        return [];
      }
    }
  },

  /**
   * Obtiene estados de asistencia para selectores
   * Intenta obtener solo los activos, si falla intenta con la lista paginada
   */
  async getAttendanceStatuses(): Promise<AttendanceStatusResponse[]> {
    try {
      console.log('📋 Obteniendo estados activos de asistencia...');
      const statuses = await this.getActiveAttendanceStatuses();
      console.log(`✅ Se obtuvieron ${statuses.length} estados activos`);
      return statuses;
    } catch (error) {
      console.error('❌ Error obteniendo estados activos:', error);
      // Si falla, intenta obtener la lista paginada como fallback
      try {
        console.log('⚠️ Intentando fallback con lista paginada...');
        const result = await this.getAttendanceStatusesList({ 
          page: 1, 
          limit: 100,
          isActive: true 
        });
        const statuses = Array.isArray(result.data) ? result.data : [];
        console.log(`✅ Fallback: Se obtuvieron ${statuses.length} estados`);
        return statuses;
      } catch (fallbackError) {
        console.error('❌ Error en fallback de estados:', fallbackError);
        return [];
      }
    }
  },
};
