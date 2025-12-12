// src/services/student-report.service.ts
import { api } from '@/config/api';

interface ReportOptions {
  includeParents?: boolean;
  includeMedical?: boolean;
  includeAcademic?: boolean;
}

export const studentReportService = {
  /**
   * Descarga el reporte de un estudiante en formato Excel
   * @param studentId - ID del estudiante
   * @param options - Opciones del reporte
   */
  async downloadStudentExcel(
    studentId: number,
    options: ReportOptions = {
      includeParents: true,
      includeMedical: true,
      includeAcademic: true,
    }
  ): Promise<void> {
    // ✅ VALIDACIÓN
    if (!studentId || studentId <= 0) {
      throw new Error('ID de estudiante inválido');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('includeParents', String(options.includeParents ?? true));
    queryParams.append('includeMedical', String(options.includeMedical ?? true));
    queryParams.append('includeAcademic', String(options.includeAcademic ?? true));

    try {
      const response = await api.get(
        `/api/reports/students/${studentId}/excel?${queryParams.toString()}`,
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        }
      );

      // ✅ VALIDACIÓN: Respuesta exitosa
      if (!response.data) {
        throw new Error('No se recibió el archivo');
      }

      const blob = response.data;

      // ✅ VALIDACIÓN: Blob válido
      if (!blob || blob.size === 0) {
        throw new Error('El archivo descargado está vacío');
      }

      downloadBlob(blob, `ficha-estudiante-${studentId}.xlsx`);
    } catch (error) {
      throw new Error(`Error al descargar el reporte en Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  /**
   * Descarga el reporte de un estudiante en formato PDF
   * @param studentId - ID del estudiante
   * @param options - Opciones del reporte
   */
  async downloadStudentPdf(
    studentId: number,
    options: ReportOptions = {
      includeParents: true,
      includeMedical: true,
      includeAcademic: true,
    }
  ): Promise<void> {
    // ✅ VALIDACIÓN
    if (!studentId || studentId <= 0) {
      throw new Error('ID de estudiante inválido');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('includeParents', String(options.includeParents ?? true));
    queryParams.append('includeMedical', String(options.includeMedical ?? true));
    queryParams.append('includeAcademic', String(options.includeAcademic ?? true));

    try {
      const response = await api.get(
        `/api/reports/students/${studentId}/pdf?${queryParams.toString()}`,
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/pdf',
          },
        }
      );

      // ✅ VALIDACIÓN: Respuesta exitosa
      if (!response.data) {
        throw new Error('No se recibió el archivo');
      }

      const blob = response.data;

      // ✅ VALIDACIÓN: Blob válido
      if (!blob || blob.size === 0) {
        throw new Error('El archivo descargado está vacío');
      }

      downloadBlob(blob, `ficha-estudiante-${studentId}.pdf`);
    } catch (error) {
      throw new Error(`Error al descargar el reporte en PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
