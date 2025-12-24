'use client';

import { useMutation } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { ExportFormat } from '@/types/attendance-reports.types';

interface UseExportSectionReportParams {
  sectionId: number;
  format?: ExportFormat;
  gradeId?: number;
  courseId?: number;
  bimesterId?: number | null;
  academicWeekId?: number | null;
  startDate?: string;
  endDate?: string;
}

/**
 * Hook para exportar reporte de asistencia de una sección completa
 */
export function useExportSectionReport() {
  const mutation = useMutation({
    mutationFn: async ({
      sectionId,
      format = 'excel',
      gradeId,
      courseId,
      bimesterId,
      academicWeekId,
      startDate,
      endDate,
    }: UseExportSectionReportParams) => {
      if (!gradeId || !courseId) {
        throw new Error('gradeId y courseId son requeridos');
      }

      const blob = await attendanceReportsService.exportSectionReport(sectionId, {
        gradeId,
        courseId,
        format,
        bimesterId,
        academicWeekId,
        startDate,
        endDate,
      });

      return { blob, format, sectionId };
    },
    onSuccess: ({ blob, format, sectionId }) => {
      // Crear URL para descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Determinar extensión según formato
      const extensions: Record<string, string> = {
        excel: '.xlsx',
        pdf: '.pdf',
        csv: '.csv',
      };

      const extension = extensions[format] || '.xlsx';
      link.download = `reporte_seccion_${sectionId}_${new Date().getTime()}${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });

  return mutation;
}
