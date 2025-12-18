// src/services/student-export.service.ts
import { api } from '@/config/api';

export type ExportFormat = 'csv' | 'excel' | 'json';

export interface ExportPayload {
  cycleId: number;
  gradeId: number;
  sectionId: number;
  format: ExportFormat;
  columns?: string[];
}

export interface ExportResponse {
  success: boolean;
  data: {
    format: ExportFormat;
    fileName: string;
    content: string;
    totalRows: number;
    generatedAt: string;
  };
}

export interface ExportOptions {
  format?: ExportFormat;
  columns?: string[];
}

export interface ExportFormData {
  id: number;
  name: string;
  description?: string;
  academicYear?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  canEnroll?: boolean;
  isArchived?: boolean;
  grades: Array<{
    id: number;
    name: string;
    level: string;
    order?: number;
    sections: Array<{
      id: number;
      name: string;
      capacity: number;
      gradeId: number;
      teacherId?: number | null;
      teacher?: {
        id: number;
        givenNames: string;
        lastNames: string;
      } | null;
    }>;
  }>;
}

export const studentExportService = {
  /**
   * Obtiene los datos del formulario de exportación
   * (ciclos, grados y secciones)
   */
  async getExportFormData(): Promise<ExportFormData[]> {
    try {
      const response = await api.get('/api/students/export-form-data');
      
      if (!response.data) {
        throw new Error('No se recibieron los datos del formulario');
      }

      // Manejar ambas estructuras: respuesta con envelope (success/message/data) o directamente el array
      const data = response.data.data || response.data;
      
      if (!Array.isArray(data)) {
        throw new Error('Los datos del formulario no son válidos');
      }

      return data;
    } catch (error) {
      throw new Error(
        `Error al obtener datos del formulario: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      );
    }
  },

  /**
   * Descarga la lista de estudiantes en el formato especificado
   * @param cycleId - ID del ciclo escolar
   * @param gradeId - ID del grado
   * @param sectionId - ID de la sección
   * @param options - Opciones de exportación (formato y columnas)
   */
  async exportStudents(
    cycleId: number,
    gradeId: number,
    sectionId: number,
    options: ExportOptions = {
      format: 'excel',
    }
  ): Promise<void> {
    // ✅ VALIDACIÓN
    if (!cycleId || cycleId <= 0) {
      throw new Error('ID de ciclo inválido');
    }
    if (!gradeId || gradeId <= 0) {
      throw new Error('ID de grado inválido');
    }
    if (!sectionId || sectionId <= 0) {
      throw new Error('ID de sección inválido');
    }

    const format: ExportFormat = options.format || 'excel';

    try {
      const response = await api.post(
        '/api/students/export',
        {
          cycleId,
          gradeId,
          sectionId,
          format,
          columns: options.columns,
        } as ExportPayload,
        {
          responseType: 'blob', // ✅ IMPORTANTE: Recibir como archivo binario directo
        }
      );

      // ✅ VALIDACIÓN: Respuesta exitosa
      if (!response.data || response.data.size === 0) {
        throw new Error('El archivo descargado está vacío');
      }

      console.log('📥 Respuesta recibida:', {
        size: response.data.size,
        type: response.data.type,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
      });

      // Extraer nombre de archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `estudiantes_export.${format === 'excel' ? 'xlsx' : format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          fileName = filenameMatch[1];
        }
      }

      downloadBlob(response.data, fileName);
    } catch (error) {
      console.error('❌ Error en exportStudents:', error);
      throw new Error(
        `Error al exportar estudiantes: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      );
    }
  },

  /**
   * Descarga la lista de estudiantes en formato Excel
   * @param gradeId - ID del grado
   * @param sectionId - ID de la sección
   * @param options - Opciones de exportación
   */
  async downloadStudentsExcel(
  cycleId: number,
  gradeId: number,
  sectionId: number
): Promise<void> {
  // ✅ VALIDACIONES
  if (!cycleId || cycleId <= 0) throw new Error('ID de ciclo inválido');
  if (!gradeId || gradeId <= 0) throw new Error('ID de grado inválido');
  if (!sectionId || sectionId <= 0) throw new Error('ID de sección inválido');

  try {
    // ✅ CORRECTO: POST a /api/students/export con formato excel
    const response = await api.post(
      '/api/students/export',
      {
        cycleId,
        gradeId,
        sectionId,
        format: 'excel',  // ✅ Especificar formato
      },
      {
        responseType: 'blob',  // ✅ Recibir como archivo binario
      }
    );

    if (!response.data || response.data.size === 0) {
      throw new Error('El archivo descargado está vacío');
    }

    const fileName = `estudiantes_g${gradeId}_s${sectionId}.xlsx`;
    downloadBlob(response.data, fileName);
  } catch (error) {
    throw new Error(
      `Error al descargar Excel: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  }
},

  /**
   * Descarga la lista de estudiantes en formato PDF
   * @param gradeId - ID del grado
   * @param sectionId - ID de la sección
   * @param options - Opciones de exportación
   */
  async downloadStudentsPdf(
    gradeId: number,
    sectionId: number,
    options: ExportOptions = {
      format: 'excel',
    }
  ): Promise<void> {
    // ✅ VALIDACIÓN
    if (!gradeId || gradeId <= 0) {
      throw new Error('ID de grado inválido');
    }
    if (!sectionId || sectionId <= 0) {
      throw new Error('ID de sección inválido');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('gradeId', String(gradeId));
    queryParams.append('sectionId', String(sectionId));

    try {
      const response = await api.get(
        `/api/students/export/pdf?${queryParams.toString()}`,
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

      downloadBlob(blob, `estudiantes-export-${gradeId}-${sectionId}.pdf`);
    } catch (error) {
      throw new Error(
        `Error al descargar el archivo PDF: ${
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