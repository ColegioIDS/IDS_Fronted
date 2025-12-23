// src/services/schedule-export.service.ts
import { api } from '@/config/api';

export type ScheduleExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

export interface ScheduleExportPayload {
  sectionId: number;
  format: ScheduleExportFormat;
  columns?: string[];
  includeTeacherName?: boolean;
}

export interface ScheduleExportResponse {
  success: boolean;
  data: {
    format: ScheduleExportFormat;
    fileName: string;
    content: string;
    totalRows: number;
    generatedAt: string;
  };
}

export interface ScheduleExportOptions {
  format?: ScheduleExportFormat;
  columns?: string[];
  includeTeacherName?: boolean;
}

export const scheduleExportService = {
  /**
   * Descarga la lista de horarios en el formato especificado
   * @param sectionId - ID de la sección
   * @param options - Opciones de exportación (formato y columnas)
   */
  async exportSchedules(
    sectionId: number,
    options: ScheduleExportOptions = {
      format: 'excel',
    }
  ): Promise<void> {
    // ✅ VALIDACIÓN
    if (!sectionId || sectionId <= 0) {
      throw new Error('ID de sección inválido');
    }

    const format: ScheduleExportFormat = options.format || 'excel';

    try {
      const response = await api.post(
        '/api/schedules/export',
        {
          sectionId,
          format,
          columns: options.columns,
          includeTeacherName: options.includeTeacherName ?? true,
        } as ScheduleExportPayload,
        {
          responseType: 'blob', // ✅ IMPORTANTE: Recibir como archivo binario directo
        }
      );

      // ✅ VALIDACIÓN: Respuesta exitosa
      if (!response.data || response.data.size === 0) {
        throw new Error('El archivo descargado está vacío');
      }

      console.log('📥 Respuesta de exportación de horarios:', {
        size: response.data.size,
        type: response.data.type,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
      });

      // Extraer nombre de archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `horarios_export.${format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          fileName = filenameMatch[1];
        }
      }

      downloadBlob(response.data, fileName);
    } catch (error) {
      console.error('❌ Error en exportSchedules:', error);
      throw new Error(
        `Error al exportar horarios: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      );
    }
  },
};

/**
 * Función auxiliar para descargar un blob
 * ✅ VALIDACIÓN: Verifica que el URL sea válido antes de descargar
 */
function downloadBlob(blob: Blob, filename: string): void {
  // ✅ VALIDACIÓN
  if (!blob || !filename) {
    throw new Error('Blob o nombre de archivo inválido');
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // ✅ IMPORTANTE: Pequeño delay antes de cleanup
  // Para asegurar que el click se procese completamente
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}