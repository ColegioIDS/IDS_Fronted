// src/services/justificationService.ts

import apiClient from './api';
import {
  StudentJustification,
  CreateJustificationDto,
  ApproveJustificationDto,
  RejectJustificationDto,
  BulkApproveJustificationDto,
  JustificationListResponse,
  BulkJustificationResponse,
  JustificationApprovalResult,
} from '@/types/justification';
import { ApiResponse } from '@/types/api';

/**
 * Servicio de Justificativos
 * Contiene todas las llamadas HTTP relacionadas con justificativos
 */

export const justificationService = {
  /**
   * Crea una nueva solicitud de justificativo
   * @param dto - Datos del justificativo
   */
  createJustification: async (dto: CreateJustificationDto) => {
    try {
      const { data } = await apiClient.post<ApiResponse<StudentJustification>>(
        '/attendance/justification',
        dto
      );
      if (!data.success) {
        throw new Error('Error al crear justificativo');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error creating justification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene las justificaciones pendientes de aprobación
   * @param page - Número de página (default: 1)
   * @param limit - Cantidad de registros por página (default: 10)
   */
  getPendingJustifications: async (page: number = 1, limit: number = 10) => {
    try {
      const { data } = await apiClient.get<JustificationListResponse>(
        `/attendance/justification/pending?page=${page}&limit=${limit}`
      );
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching pending justifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Aprueba una justificación
   * @param id - ID de la justificación
   * @param dto - Datos de aprobación
   */
  approveJustification: async (id: number, dto: ApproveJustificationDto) => {
    try {
      const { data } = await apiClient.post<ApiResponse<StudentJustification>>(
        `/attendance/justification/${id}/approve`,
        dto
      );
      if (!data.success) {
        throw new Error('Error al aprobar justificativo');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error approving justification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Rechaza una justificación
   * @param id - ID de la justificación
   * @param dto - Datos del rechazo
   */
  rejectJustification: async (id: number, dto: RejectJustificationDto) => {
    try {
      const { data } = await apiClient.post<ApiResponse<StudentJustification>>(
        `/attendance/justification/${id}/reject`,
        dto
      );
      if (!data.success) {
        throw new Error('Error al rechazar justificativo');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error rejecting justification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Aprueba múltiples justificaciones (BULK)
   * @param dto - Objeto con array de IDs y opciones
   */
  bulkApproveJustifications: async (dto: BulkApproveJustificationDto) => {
    try {
      const { data } = await apiClient.post<BulkJustificationResponse>(
        '/attendance/justification/bulk/approve',
        dto
      );
      if (!data.success) {
        throw new Error('Error en aprobación masiva');
      }
      return data;
    } catch (error) {
      throw new Error(`Error bulk approving: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene todas las justificaciones con filtros opcionales
   * @param filters - Objeto con filtros (status, type, dates, etc)
   * @param page - Número de página
   * @param limit - Cantidad por página
   */
  getJustifications: async (filters?: any, page: number = 1, limit: number = 10) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, String(value));
          }
        });
      }

      const { data } = await apiClient.get<JustificationListResponse>(
        `/attendance/justification?${params.toString()}`
      );
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching justifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene una justificación específica por ID
   * @param id - ID de la justificación
   */
  getJustificationById: async (id: number) => {
    try {
      const { data } = await apiClient.get<ApiResponse<StudentJustification>>(
        `/attendance/justification/${id}`
      );
      if (!data.success) {
        throw new Error('Justificativo no encontrado');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching justification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene justificaciones por matrícula de estudiante
   * @param enrollmentId - ID de la matrícula
   * @param page - Número de página
   * @param limit - Cantidad por página
   */
  getJustificationsByEnrollment: async (enrollmentId: number, page: number = 1, limit: number = 10) => {
    try {
      const { data } = await apiClient.get<JustificationListResponse>(
        `/attendance/justification/enrollment/${enrollmentId}?page=${page}&limit=${limit}`
      );
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching justifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Descarga/exporta un justificativo (si existe documento)
   * @param id - ID de la justificación
   */
  downloadJustificationDocument: async (id: number) => {
    try {
      const response = await apiClient.get(
        `/attendance/justification/${id}/document`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Error downloading document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

export default justificationService;