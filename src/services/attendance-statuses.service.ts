// src/services/attendance-statuses.service.ts

/**
 * Servicio para gestionar Estados de Asistencia
 * Proporciona métodos para interactuar con los 11 endpoints de attendance-statuses
 * 
 * Endpoints disponibles:
 * 1. GET /api/attendance-statuses - Listar con paginación y filtros
 * 2. GET /api/attendance-statuses/active - Obtener solo activos
 * 3. GET /api/attendance-statuses/negative - Obtener solo negativos
 * 4. GET /api/attendance-statuses/:id - Obtener por ID
 * 5. GET /api/attendance-statuses/:id/stats - Obtener estadísticas
 * 6. GET /api/attendance-statuses/code/:code - Obtener por código
 * 7. POST /api/attendance-statuses - Crear
 * 8. PATCH /api/attendance-statuses/:id - Actualizar
 * 9. PATCH /api/attendance-statuses/:id/deactivate - Desactivar
 * 10. PATCH /api/attendance-statuses/:id/activate - Activar
 * 11. DELETE /api/attendance-statuses/:id - Eliminar
 */

import { api } from '@/config/api';
import {
  AttendanceStatus,
  PaginatedAttendanceStatuses,
  AttendanceStatusQuery,
  AttendanceStatusStats,
  CreateAttendanceStatusDto,
  UpdateAttendanceStatusDto,
  PaginationMeta,
} from '@/types/attendance-status.types';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Limpiar parámetros de consulta removiendo valores undefined
 */
function cleanParams(params: Record<string, any>): URLSearchParams {
  const cleaned = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleaned.append(key, String(value));
    }
  });
  return cleaned;
}

/**
 * Extraer metadatos de paginación de la respuesta
 */
function extractPaginationMeta(response: any, query: AttendanceStatusQuery): PaginationMeta {
  return {
    page: response?.page || query.page || 1,
    limit: response?.limit || query.limit || 10,
    total: response?.total || 0,
    totalPages: response?.totalPages || 0,
    hasNextPage: response?.hasNextPage || false,
    hasPreviousPage: response?.hasPreviousPage || false,
  };
}

// ============================================
// SERVICIO PRINCIPAL
// ============================================

export const attendanceStatusesService = {
  /**
   * ========================================
   * SECTION 1: LECTURA - LISTADOS
   * ========================================
   */

  /**
   * Obtener Estados de Asistencia con Paginación y Filtros
   * 
   * Endpoint: GET /api/attendance-statuses
   * 
   * @param query - Parámetros de paginación y filtros
   * @returns Estados paginados con metadatos
   * 
   * @example
   * const result = await attendanceStatusesService.getStatuses({
   *   page: 1,
   *   limit: 10,
   *   search: 'presente',
   *   isActive: true,
   *   sortBy: 'code',
   *   sortOrder: 'asc'
   * });
   */
  async getStatuses(
    query: AttendanceStatusQuery = {}
  ): Promise<PaginatedAttendanceStatuses> {
    const params = cleanParams({
      page: query.page || 1,
      limit: query.limit || 10,
      search: query.search,
      isActive: query.isActive,
      isNegative: query.isNegative,
      isExcused: query.isExcused,
      requiresJustification: query.requiresJustification,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    try {
      const response = await api.get(`/api/attendance-statuses?${params.toString()}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener estados');
      }

      const data = Array.isArray(response.data.data) ? response.data.data : [];
      const meta = extractPaginationMeta(response.data.meta, query);

      return { data, meta };
    } catch (error) {
      console.error('Error en getStatuses:', error);
      throw error;
    }
  },

  /**
   * Obtener Estados Activos
   * 
   * Endpoint: GET /api/attendance-statuses/active
   * 
   * @returns Array de estados activos
   * 
   * @example
   * const activeStatuses = await attendanceStatusesService.getActiveStatuses();
   */
  async getActiveStatuses(): Promise<AttendanceStatus[]> {
    try {
      const response = await api.get('/api/attendance-statuses/active');

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener estados activos');
      }

      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Error en getActiveStatuses:', error);
      throw error;
    }
  },

  /**
   * Obtener Estados Negativos (Ausencias)
   * 
   * Endpoint: GET /api/attendance-statuses/negative
   * 
   * @returns Array de estados negativos
   * 
   * @example
   * const negativeStatuses = await attendanceStatusesService.getNegativeStatuses();
   */
  async getNegativeStatuses(): Promise<AttendanceStatus[]> {
    try {
      const response = await api.get('/api/attendance-statuses/negative');

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener estados negativos');
      }

      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Error en getNegativeStatuses:', error);
      throw error;
    }
  },

  /**
   * ========================================
   * SECTION 2: LECTURA - INDIVIDUAL
   * ========================================
   */

  /**
   * Obtener Estado por ID
   * 
   * Endpoint: GET /api/attendance-statuses/:id
   * 
   * @param id - ID del estado
   * @returns Estado de asistencia encontrado
   * @throws Error si el estado no existe
   * 
   * @example
   * const status = await attendanceStatusesService.getStatusById(1);
   */
  async getStatusById(id: number): Promise<AttendanceStatus> {
    try {
      const response = await api.get(`/api/attendance-statuses/${id}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener el estado');
      }

      if (!response.data.data) {
        throw new Error('Estado no encontrado');
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error en getStatusById(${id}):`, error);
      throw error;
    }
  },

  /**
   * Obtener Estado por Código
   * 
   * Endpoint: GET /api/attendance-statuses/code/:code
   * 
   * @param code - Código del estado (ej: 'P', 'I', 'IJ')
   * @returns Estado de asistencia encontrado
   * @throws Error si el estado no existe
   * 
   * @example
   * const presentStatus = await attendanceStatusesService.getStatusByCode('P');
   */
  async getStatusByCode(code: string): Promise<AttendanceStatus> {
    try {
      const response = await api.get(`/api/attendance-statuses/code/${code}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener el estado');
      }

      if (!response.data.data) {
        throw new Error(`Estado con código '${code}' no encontrado`);
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error en getStatusByCode(${code}):`, error);
      throw error;
    }
  },

  /**
   * Obtener Estadísticas de un Estado
   * 
   * Endpoint: GET /api/attendance-statuses/:id/stats
   * 
   * @param id - ID del estado
   * @returns Estadísticas de uso del estado
   * 
   * @example
   * const stats = await attendanceStatusesService.getStatusStats(1);
   * console.log(`Este estado se ha usado ${stats.totalUsages} veces`);
   */
  async getStatusStats(id: number): Promise<AttendanceStatusStats> {
    try {
      const response = await api.get(`/api/attendance-statuses/${id}/stats`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener estadísticas');
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error en getStatusStats(${id}):`, error);
      throw error;
    }
  },

  /**
   * ========================================
   * SECTION 3: ESCRITURA - CREAR
   * ========================================
   */

  /**
   * Crear Nuevo Estado de Asistencia
   * 
   * Endpoint: POST /api/attendance-statuses
   * 
   * @param data - Datos del nuevo estado
   * @returns Estado creado con ID asignado
   * @throws Error si hay validación fallida
   * 
   * @example
   * const newStatus = await attendanceStatusesService.createStatus({
   *   code: 'P',
   *   name: 'Presente',
   *   description: 'Estudiante presente en clase',
   *   isNegative: false,
   *   isExcused: false,
   *   requiresJustification: false,
   *   canHaveNotes: false,
   *   colorCode: '#22c55e',
   *   order: 1,
   *   isActive: true
   * });
   */
  async createStatus(data: CreateAttendanceStatusDto): Promise<AttendanceStatus> {
    try {
      const response = await api.post('/api/attendance-statuses', data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al crear el estado');
      }

      if (!response.data.data) {
        throw new Error('No se pudo crear el estado');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en createStatus:', error);
      throw error;
    }
  },

  /**
   * ========================================
   * SECTION 4: ESCRITURA - ACTUALIZAR
   * ========================================
   */

  /**
   * Actualizar Estado de Asistencia
   * 
   * Endpoint: PATCH /api/attendance-statuses/:id
   * 
   * @param id - ID del estado a actualizar
   * @param data - Campos a actualizar (todos opcionales)
   * @returns Estado actualizado
   * @throws Error si el estado no existe o falla la validación
   * 
   * @example
   * const updated = await attendanceStatusesService.updateStatus(1, {
   *   name: 'Presente - Modificado',
   *   description: 'Nueva descripción',
   *   colorCode: '#00ff00'
   * });
   */
  async updateStatus(id: number, data: UpdateAttendanceStatusDto): Promise<AttendanceStatus> {
    try {
      const response = await api.patch(`/api/attendance-statuses/${id}`, data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al actualizar el estado');
      }

      if (!response.data.data) {
        throw new Error('No se pudo actualizar el estado');
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error en updateStatus(${id}):`, error);
      throw error;
    }
  },

  /**
   * ========================================
   * SECTION 5: ESCRITURA - ESTADO (Activar/Desactivar)
   * ========================================
   */

  /**
   * Activar Estado de Asistencia
   * 
   * Endpoint: PATCH /api/attendance-statuses/:id/activate
   * 
   * @param id - ID del estado a activar
   * @returns Estado actualizado con isActive=true
   * @throws Error si el estado no existe
   * 
   * @example
   * const activated = await attendanceStatusesService.activateStatus(1);
   */
  async activateStatus(id: number): Promise<AttendanceStatus> {
    try {
      const response = await api.patch(`/api/attendance-statuses/${id}/activate`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al activar el estado');
      }

      if (!response.data.data) {
        throw new Error('No se pudo activar el estado');
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error en activateStatus(${id}):`, error);
      throw error;
    }
  },

  /**
   * Desactivar Estado de Asistencia
   * 
   * Endpoint: PATCH /api/attendance-statuses/:id/deactivate
   * 
   * @param id - ID del estado a desactivar
   * @returns Estado actualizado con isActive=false
   * @throws Error si el estado no existe
   * 
   * @example
   * const deactivated = await attendanceStatusesService.deactivateStatus(1);
   */
  async deactivateStatus(id: number): Promise<AttendanceStatus> {
    try {
      const response = await api.patch(`/api/attendance-statuses/${id}/deactivate`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al desactivar el estado');
      }

      if (!response.data.data) {
        throw new Error('No se pudo desactivar el estado');
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error en deactivateStatus(${id}):`, error);
      throw error;
    }
  },

  /**
   * ========================================
   * SECTION 6: ESCRITURA - ELIMINAR
   * ========================================
   */

  /**
   * Eliminar Estado de Asistencia
   * 
   * Endpoint: DELETE /api/attendance-statuses/:id
   * 
   * @param id - ID del estado a eliminar
   * @throws Error si el estado no existe o está en uso
   * 
   * @example
   * await attendanceStatusesService.deleteStatus(1);
   */
  async deleteStatus(id: number): Promise<void> {
    try {
      const response = await api.delete(`/api/attendance-statuses/${id}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al eliminar el estado');
      }
    } catch (error) {
      console.error(`Error en deleteStatus(${id}):`, error);
      throw error;
    }
  },

  /**
   * ========================================
   * SECTION 7: HELPER METHODS (Métodos Auxiliares)
   * ========================================
   */

  /**
   * Verificar si un estado es válido
   * 
   * @param status - Estado a verificar
   * @returns true si el estado tiene los campos requeridos
   * 
   * @example
   * if (attendanceStatusesService.isValidStatus(status)) {
   *   // Procesar estado
   * }
   */
  isValidStatus(status: any): status is AttendanceStatus {
    return (
      status &&
      typeof status === 'object' &&
      typeof status.id === 'number' &&
      typeof status.code === 'string' &&
      typeof status.name === 'string' &&
      typeof status.isActive === 'boolean'
    );
  },

  /**
   * Filtrar estados por estado activo
   * 
   * @param statuses - Array de estados
   * @param active - true para activos, false para inactivos
   * @returns Estadosfiltrados
   */
  filterByActive(statuses: AttendanceStatus[], active: boolean): AttendanceStatus[] {
    return statuses.filter((status) => status.isActive === active);
  },

  /**
   * Filtrar estados por tipo (negativo, justificado, etc)
   * 
   * @param statuses - Array de estados
   * @param type - 'negative' | 'excused' | 'temporal'
   * @returns Estados filtrados
   */
  filterByType(
    statuses: AttendanceStatus[],
    type: 'negative' | 'excused' | 'temporal'
  ): AttendanceStatus[] {
    switch (type) {
      case 'negative':
        return statuses.filter((status) => status.isNegative);
      case 'excused':
        return statuses.filter((status) => status.isExcused);
      case 'temporal':
        return statuses.filter((status) => status.isTemporal);
      default:
        return statuses;
    }
  },

  /**
   * Ordenar estados por campo
   * 
   * @param statuses - Array de estados
   * @param field - Campo por el que ordenar
   * @param order - 'asc' | 'desc'
   * @returns Estados ordenados
   */
  sortStatuses(
    statuses: AttendanceStatus[],
    field: 'code' | 'name' | 'order',
    order: 'asc' | 'desc' = 'asc'
  ): AttendanceStatus[] {
    const sorted = [...statuses].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  },

  /**
   * Buscar estado por código rápidamente
   * Versión local sin llamada API (para usar con estados ya cargados)
   * 
   * @param statuses - Array de estados
   * @param code - Código a buscar
   * @returns Estado encontrado o undefined
   */
  findByCode(statuses: AttendanceStatus[], code: string): AttendanceStatus | undefined {
    return statuses.find((status) => status.code.toUpperCase() === code.toUpperCase());
  },

  /**
   * Agrupar estados por tipo
   * 
   * @param statuses - Array de estados
   * @returns Objeto con estados agrupados
   */
  groupByType(
    statuses: AttendanceStatus[]
  ): {
    negative: AttendanceStatus[];
    positive: AttendanceStatus[];
    excused: AttendanceStatus[];
    other: AttendanceStatus[];
  } {
    return {
      negative: statuses.filter((s) => s.isNegative),
      positive: statuses.filter((s) => !s.isNegative),
      excused: statuses.filter((s) => s.isExcused),
      other: statuses.filter((s) => !s.isNegative && !s.isExcused),
    };
  },

  /**
   * Mapear estados a opciones de select
   * 
   * @param statuses - Array de estados
   * @returns Array de opciones para select components
   */
  toSelectOptions(
    statuses: AttendanceStatus[]
  ): Array<{ value: number; label: string; code: string }> {
    return statuses.map((status) => ({
      value: status.id,
      label: status.name,
      code: status.code,
    }));
  },

  /**
   * Obtener color para estado
   * 
   * @param status - Estado
   * @returns Color en hex o por defecto
   */
  getStatusColor(status: AttendanceStatus): string {
    return status.colorCode || '#6b7280'; // gray-500 por defecto
  },
};

