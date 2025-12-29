/**
 * Service para el módulo de Exports
 * Obtiene datos académicos para exportación y gestiona descargas
 */

import { api } from '@/config/api';
import { ExportAcademicDataResponse, ExportsStudentFilterRequest, ExportsStudentFilterResponse } from '@/types/exports.types';

/**
 * Payload para descargar reporte de estudiantes
 */
export interface ExportStudentsPayload {
  type: 'pdf' | 'excel';
  enrollmentIds: number[];
  cicloId?: number;
  bimestreId?: number;
  fileName?: string;
}

export const exportsService = {
  /**
   * Obtiene datos académicos en cascada para el módulo de exports
   */
  async getAcademicData(): Promise<ExportAcademicDataResponse['data']> {
    const response = await api.get('/api/exports/academic-data');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener datos académicos');
    }

    if (!response.data.data) {
      throw new Error('No se encontraron datos académicos');
    }

    return response.data.data;
  },

  /**
   * Obtiene estudiantes filtrados
   */
  async getStudentsByFilter(filters: ExportsStudentFilterRequest): Promise<ExportsStudentFilterResponse> {
    const response = await api.post('/api/exports/students/filter', filters);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estudiantes');
    }

    return response.data;
  },

  /**
   * Descargar reporte de estudiantes en PDF o Excel
   * 
   * @param payload - Datos para generar el reporte
   * @returns Blob del archivo para descargar
   */
  async downloadStudentsReport(payload: ExportStudentsPayload): Promise<Blob> {
    try {
      const response = await api.post(
        '/api/exports/blank-download',
        payload,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data as Blob;
    } catch (error: any) {
      const message = error?.response?.data?.message || 
                     error?.message || 
                     'Error al descargar el reporte';
      throw new Error(message);
    }
  },

  /**
   * Descargar reporte PDF de estudiantes
   * 
   * @param enrollmentIds - Array de IDs de matriculas
   * @param cicloId - ID del ciclo (opcional)
   * @param bimestreId - ID del bimestre (opcional)
   */
  async downloadPDF(
    enrollmentIds: number[],
    cicloId?: number,
    bimestreId?: number,
    fileName?: string
  ): Promise<Blob> {
    return this.downloadStudentsReport({
      type: 'pdf',
      enrollmentIds,
      cicloId,
      bimestreId,
      fileName,
    });
  },

  /**
   * Descargar reporte Excel de estudiantes
   * 
   * @param enrollmentIds - Array de IDs de matriculas
   * @param cicloId - ID del ciclo (opcional)
   * @param bimestreId - ID del bimestre (opcional)
   */
  async downloadExcel(
    enrollmentIds: number[],
    cicloId?: number,
    bimestreId?: number,
    fileName?: string
  ): Promise<Blob> {
    return this.downloadStudentsReport({
      type: 'excel',
      enrollmentIds,
      cicloId,
      bimestreId,
      fileName,
    });
  },

  /**
   * Disparar descarga de archivo en el navegador
   * 
   * @param blob - Blob del archivo
   * @param fileName - Nombre del archivo a descargar
   */
  triggerDownload(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
