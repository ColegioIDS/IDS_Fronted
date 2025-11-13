// src/services/attendance-config.service.ts
import { api } from '@/config/api';
import {
  AttendanceConfig,
  AttendanceConfigWithMetadata,
  CreateAttendanceConfigDto,
  UpdateAttendanceConfigDto,
  AttendanceConfigQuery,
  PaginatedAttendanceConfig,
  AttendanceConfigDefaults,
  ApiResponse,
} from '@/types/attendance-config.types';

export const attendanceConfigService = {
  /**
   * Obtener la configuración actual activa
   */
  async getCurrent(): Promise<AttendanceConfig> {
    const response = await api.get<ApiResponse<AttendanceConfig>>(
      '/api/attendance-config'
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener configuración'
      );
    }

    if (!response.data.data) {
      throw new Error('Configuración no encontrada');
    }

    return response.data.data;
  },

  /**
   * Obtener configuración por ID
   */
  async getById(id: number): Promise<AttendanceConfigWithMetadata> {
    const response = await api.get<ApiResponse<AttendanceConfigWithMetadata>>(
      `/api/attendance-config/${id}`
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener configuración'
      );
    }

    if (!response.data.data) {
      throw new Error('Configuración no encontrada');
    }

    return response.data.data;
  },

  /**
   * Obtener todas las configuraciones con paginación
   */
  async getAll(
    query: AttendanceConfigQuery = {}
  ): Promise<PaginatedAttendanceConfig> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get<ApiResponse<PaginatedAttendanceConfig>>(
      `/api/attendance-config/all?${params.toString()}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener configuraciones');
    }

    const data = Array.isArray(response.data.data?.data)
      ? response.data.data.data
      : [];
    const meta = response.data.data?.meta || {
      page: query.page || 1,
      limit: query.limit || 10,
      total: 0,
      totalPages: 0,
    };

    return { data, meta };
  },

  /**
   * Crear nueva configuración
   */
  async create(
    data: CreateAttendanceConfigDto
  ): Promise<AttendanceConfig> {
    const response = await api.post<ApiResponse<AttendanceConfig>>(
      '/api/attendance-config',
      data
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear configuración');
    }

    if (!response.data.data) {
      throw new Error('No se pudo crear la configuración');
    }

    return response.data.data;
  },

  /**
   * Actualizar configuración
   */
  async update(
    id: number,
    data: UpdateAttendanceConfigDto
  ): Promise<AttendanceConfig> {
    const response = await api.patch<ApiResponse<AttendanceConfig>>(
      `/api/attendance-config/${id}`,
      data
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al actualizar configuración'
      );
    }

    if (!response.data.data) {
      throw new Error('No se pudo actualizar la configuración');
    }

    return response.data.data;
  },

  /**
   * Eliminar configuración
   */
  async delete(id: number): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(
      `/api/attendance-config/${id}`
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al eliminar configuración'
      );
    }
  },

  /**
   * Resetear a valores por defecto
   */
  async reset(): Promise<AttendanceConfig> {
    const response = await api.post<ApiResponse<AttendanceConfig>>(
      '/api/attendance-config/reset',
      {}
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al resetear configuración'
      );
    }

    if (!response.data.data) {
      throw new Error('No se pudo resetear la configuración');
    }

    return response.data.data;
  },

  /**
   * Obtener valores por defecto
   */
  async getDefaults(): Promise<AttendanceConfigDefaults> {
    const response = await api.get<ApiResponse<AttendanceConfigDefaults>>(
      '/api/attendance-config/defaults'
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener valores por defecto'
      );
    }

    if (!response.data.data) {
      throw new Error('Valores por defecto no disponibles');
    }

    return response.data.data;
  },
};
