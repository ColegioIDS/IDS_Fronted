// src/services/reportService.ts

import apiClient from './api';
import {
  StudentAttendanceReport,
  ReportWithStudent,
  AttendanceStats,
  BimesterSummary,
  AtRiskStudent,
  InterventionStudent,
  SectionReport,
  StudentReportDetail,
  RecalculateReportDto,
} from '@/types/report';
import { ApiResponse } from '@/types/api';

/**
 * Servicio de Reportes
 * Contiene todas las llamadas HTTP relacionadas con reportes de asistencia
 */

export const reportService = {
  /**
   * Obtiene el reporte de asistencia de un estudiante para un bimestre
   * @param enrollmentId - ID de la matrícula
   * @param bimesterId - ID del bimestre
   * @param courseId - ID del curso (opcional)
   */
  getStudentReport: async (enrollmentId: number, bimesterId: number, courseId?: number) => {
    try {
      const url = courseId
        ? `/attendance/report/${enrollmentId}/${bimesterId}?courseId=${courseId}`
        : `/attendance/report/${enrollmentId}/${bimesterId}`;

      const { data } = await apiClient.get<ApiResponse<StudentAttendanceReport>>(url);
      if (!data.success) {
        throw new Error('Reporte no encontrado');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Recalcula el reporte de asistencia de un estudiante
   * @param enrollmentId - ID de la matrícula
   * @param bimesterId - ID del bimestre
   */
  recalculateReport: async (enrollmentId: number, bimesterId: number) => {
    try {
      const { data } = await apiClient.post<ApiResponse<StudentAttendanceReport>>(
        `/attendance/report/${enrollmentId}/${bimesterId}/recalculate`,
        {}
      );
      if (!data.success) {
        throw new Error('Error al recalcular reporte');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error recalculating report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene todos los estudiantes en riesgo
   * @param page - Número de página
   * @param limit - Cantidad por página
   */
  getAtRiskStudents: async (page: number = 1, limit: number = 10) => {
    try {
      const { data } = await apiClient.get<any>(
        `/attendance/report/at-risk?page=${page}&limit=${limit}`
      );
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching at-risk students: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene estudiantes que necesitan intervención
   * @param page - Número de página
   * @param limit - Cantidad por página
   */
  getStudentsNeedingIntervention: async (page: number = 1, limit: number = 10) => {
    try {
      const { data } = await apiClient.get<any>(
        `/attendance/report/intervention?page=${page}&limit=${limit}`
      );
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching intervention students: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene todos los reportes de un bimestre
   * @param bimesterId - ID del bimestre
   * @param page - Número de página
   * @param limit - Cantidad por página
   */
  getBimesterReports: async (bimesterId: number, page: number = 1, limit: number = 10) => {
    try {
      const { data } = await apiClient.get<any>(
        `/attendance/report/bimester/${bimesterId}?page=${page}&limit=${limit}`
      );
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching bimester reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene resumen estadístico de un bimestre
   * @param bimesterId - ID del bimestre
   */
  getBimesterSummary: async (bimesterId: number) => {
    try {
      const { data } = await apiClient.get<ApiResponse<BimesterSummary>>(
        `/attendance/report/bimester/${bimesterId}/summary`
      );
      if (!data.success) {
        throw new Error('Error al obtener resumen');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene estadísticas generales de asistencia
   * @param bimesterId - ID del bimestre (opcional)
   */
  getAttendanceStats: async (bimesterId?: number) => {
    try {
      const url = bimesterId
        ? `/attendance/report/stats?bimesterId=${bimesterId}`
        : '/attendance/report/stats';

      const { data } = await apiClient.get<ApiResponse<AttendanceStats>>(url);
      if (!data.success) {
        throw new Error('Error al obtener estadísticas');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene reporte de una sección completa
   * @param sectionId - ID de la sección
   * @param bimesterId - ID del bimestre
   */
  getSectionReport: async (sectionId: number, bimesterId: number) => {
    try {
      const { data } = await apiClient.get<ApiResponse<SectionReport>>(
        `/attendance/report/section/${sectionId}/${bimesterId}`
      );
      if (!data.success) {
        throw new Error('Reporte de sección no encontrado');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching section report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Exporta reportes a JSON
   * @param bimesterId - ID del bimestre
   */
  exportReportsJSON: async (bimesterId: number) => {
    try {
      const { data } = await apiClient.get(
        `/attendance/report/export/json?bimesterId=${bimesterId}`,
        { responseType: 'blob' }
      );
      return data;
    } catch (error) {
      throw new Error(`Error exporting reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Exporta reportes a CSV
   * @param bimesterId - ID del bimestre
   */
  exportReportsCSV: async (bimesterId: number) => {
    try {
      const { data } = await apiClient.get(
        `/attendance/report/export/csv?bimesterId=${bimesterId}`,
        { responseType: 'blob' }
      );
      return data;
    } catch (error) {
      throw new Error(`Error exporting reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene reporte detallado de un estudiante
   * @param enrollmentId - ID de la matrícula
   * @param bimesterId - ID del bimestre
   */
  getDetailedStudentReport: async (enrollmentId: number, bimesterId: number) => {
    try {
      const { data } = await apiClient.get<ApiResponse<StudentReportDetail>>(
        `/attendance/report/detail/${enrollmentId}/${bimesterId}`
      );
      if (!data.success) {
        throw new Error('Reporte detallado no encontrado');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching detailed report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Obtiene reporte con filtros avanzados
   * @param filters - Objeto con filtros (isAtRisk, needsIntervention, etc)
   * @param page - Número de página
   * @param limit - Cantidad por página
   */
  getFilteredReports: async (filters?: any, page: number = 1, limit: number = 10) => {
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

      const { data } = await apiClient.get<any>(
        `/attendance/report/filtered?${params.toString()}`
      );
      return data.data;
    } catch (error) {
      throw new Error(`Error fetching filtered reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

export default reportService;