// src/services/attendanceService.ts

import apiClient from './api';
import {
  StudentAttendance,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  BulkCreateAttendanceDto,
  BulkUpdateAttendanceDto,
  BulkDeleteAttendanceDto,
  BulkApplyStatusDto,
  AttendanceChangeRecord,
  AttendanceListResponse,
  BulkAttendanceResponse,
} from '@/types/attendance';
import { ApiResponse, PaginatedResponse } from '@/types/api';

/**
 * Servicio de Asistencia
 * Contiene todas las llamadas HTTP relacionadas con asistencia
 */

export const attendanceService = {
  /**
   * Obtiene la asistencia de un estudiante específico
   * @param enrollmentId - ID de la matrícula
   * @param page - Número de página (default: 1)
   * @param limit - Cantidad de registros por página (default: 10)
   */
  getStudentAttendance: async (enrollmentId: number, page: number = 1, limit: number = 10) => {
    try {
      const { data } = await apiClient.get<AttendanceListResponse>(
        `/attendance/student/${enrollmentId}?page=${page}&limit=${limit}`
      );
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Crea un nuevo registro de asistencia
   * @param dto - Datos del registro
   */
  createAttendance: async (dto: CreateAttendanceDto) => {
    try {
      const { data } = await apiClient.post<ApiResponse<StudentAttendance>>(
        '/attendance',
        dto
      );
      if (!data.success) {
        throw new Error(data.data ? 'Error al crear asistencia' : 'Error desconocido');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error creating attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Actualiza un registro de asistencia existente
   * @param id - ID del registro
   * @param dto - Datos a actualizar
   * @param reason - Razón del cambio (opcional)
   */
  updateAttendance: async (id: number, dto: UpdateAttendanceDto, reason?: string) => {
    try {
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      const { data } = await apiClient.put<ApiResponse<StudentAttendance>>(
        `/attendance/${id}${params}`,
        dto
      );
      if (!data.success) {
        throw new Error('Error al actualizar asistencia');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error updating attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene el historial de cambios de un registro de asistencia
   * @param id - ID del registro
   */
  getAttendanceHistory: async (id: number) => {
    try {
      const { data } = await apiClient.get<ApiResponse<AttendanceChangeRecord[]>>(
        `/attendance/${id}/history`
      );
      if (!data.success) {
        throw new Error('Error al obtener historial');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Crea múltiples registros de asistencia (BULK)
   * @param dto - Objeto con array de asistencias
   */
  bulkCreateAttendance: async (dto: BulkCreateAttendanceDto) => {
    try {
      const { data } = await apiClient.post<BulkAttendanceResponse>(
        '/attendance/bulk/create',
        dto
      );
      if (!data.success) {
        throw new Error('Error en carga masiva');
      }
      return data;
    } catch (error) {
      throw new Error(`Error bulk creating: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Actualiza múltiples registros de asistencia (BULK)
   * @param dto - Objeto con array de actualizaciones
   */
  bulkUpdateAttendance: async (dto: BulkUpdateAttendanceDto) => {
    try {
      const { data } = await apiClient.put<BulkAttendanceResponse>(
        '/attendance/bulk/update',
        dto
      );
      if (!data.success) {
        throw new Error('Error en actualización masiva');
      }
      return data;
    } catch (error) {
      throw new Error(`Error bulk updating: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Elimina múltiples registros de asistencia (BULK)
   * @param dto - Objeto con array de IDs a eliminar
   */
  bulkDeleteAttendance: async (dto: BulkDeleteAttendanceDto) => {
    try {
      const { data } = await apiClient.delete<BulkAttendanceResponse>(
        '/attendance/bulk/delete',
        { data: dto }
      );
      if (!data.success) {
        throw new Error('Error en eliminación masiva');
      }
      return data;
    } catch (error) {
      throw new Error(`Error bulk deleting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Aplica un estado a múltiples estudiantes en un rango de fechas (BULK)
   * @param dto - Datos con studentIds, estado, fechas, etc.
   */
  bulkApplyStatus: async (dto: BulkApplyStatusDto) => {
    try {
      const { data } = await apiClient.post<BulkAttendanceResponse>(
        '/attendance/bulk/apply-status',
        dto
      );
      if (!data.success) {
        throw new Error('Error al aplicar estado masivamente');
      }
      return data;
    } catch (error) {
      throw new Error(`Error bulk applying status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene el estado de la API (health check)
   */
  health: async () => {
    try {
      const { data } = await apiClient.get<{ status: string; service: string }>(
        '/attendance/health'
      );
      return data;
    } catch (error) {
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

export default attendanceService;