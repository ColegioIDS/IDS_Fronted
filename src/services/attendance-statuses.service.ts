// src/services/attendance-statuses.service.ts
import { api } from '@/config/api';
import {
  AttendanceStatus,
  PaginatedAttendanceStatuses,
  AttendanceStatusQuery,
  AttendanceStatusStats,
  CreateAttendanceStatusDto,
  UpdateAttendanceStatusDto,
} from '@/types/attendance-status.types';

export const attendanceStatusesService = {
  /**
   * Obtener estados de asistencia paginados
   */
  async getStatuses(
    query: AttendanceStatusQuery = {}
  ): Promise<PaginatedAttendanceStatuses> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.isNegative !== undefined) params.append('isNegative', query.isNegative.toString());
    if (query.isExcused !== undefined) params.append('isExcused', query.isExcused.toString());
    if (query.requiresJustification !== undefined)
      params.append('requiresJustification', query.requiresJustification.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get(`/api/attendance-statuses?${params.toString()}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estados');
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
   * Obtener estados activos
   */
  async getActiveStatuses(): Promise<AttendanceStatus[]> {
    const response = await api.get('/api/attendance-statuses/active');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estados activos');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener estados negativos (ausencias)
   */
  async getNegativeStatuses(): Promise<AttendanceStatus[]> {
    const response = await api.get('/api/attendance-statuses/negative');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estados negativos');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener estados que requieren justificación
   */
  async getJustifiableStatuses(): Promise<AttendanceStatus[]> {
    const response = await api.get('/api/attendance-statuses/justifiable');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estados justificables');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener estado por ID
   */
  async getStatusById(id: number): Promise<AttendanceStatus> {
    const response = await api.get(`/api/attendance-statuses/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el estado');
    }

    if (!response.data.data) {
      throw new Error('Estado no encontrado');
    }

    return response.data.data;
  },

  /**
   * Obtener estado por código
   */
  async getStatusByCode(code: string): Promise<AttendanceStatus> {
    const response = await api.get(`/api/attendance-statuses/code/${code}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el estado');
    }

    return response.data.data;
  },

  /**
   * Obtener estadísticas de un estado
   */
  async getStatusStats(id: number): Promise<AttendanceStatusStats> {
    const response = await api.get(`/api/attendance-statuses/${id}/stats`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estadísticas');
    }

    return response.data.data;
  },

  /**
   * Crear estado de asistencia
   */
  async createStatus(data: CreateAttendanceStatusDto): Promise<AttendanceStatus> {
    const response = await api.post('/api/attendance-statuses', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear el estado');
    }

    return response.data.data;
  },

  /**
   * Actualizar estado de asistencia
   */
  async updateStatus(id: number, data: UpdateAttendanceStatusDto): Promise<AttendanceStatus> {
    const response = await api.patch(`/api/attendance-statuses/${id}`, data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar el estado');
    }

    return response.data.data;
  },

  /**
   * Activar estado
   */
  async activateStatus(id: number): Promise<AttendanceStatus> {
    const response = await api.patch(`/api/attendance-statuses/${id}/activate`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al activar el estado');
    }

    return response.data.data;
  },

  /**
   * Desactivar estado
   */
  async deactivateStatus(id: number): Promise<AttendanceStatus> {
    const response = await api.patch(`/api/attendance-statuses/${id}/deactivate`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al desactivar el estado');
    }

    return response.data.data;
  },

  /**
   * Eliminar estado
   */
  async deleteStatus(id: number): Promise<void> {
    const response = await api.delete(`/api/attendance-statuses/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar el estado');
    }
  },
};
