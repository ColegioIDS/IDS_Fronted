'use client';

import { useMutation } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { ExportParams, ExportFormat } from '@/types/attendance-reports.types';

interface UseExportStudentReportParams {
  studentId: number;
  format?: ExportFormat;
  gradeId?: number;
  sectionId?: number;
  courseId?: number;
  bimesterId?: number | null;
  startDate?: string;
  endDate?: string;
}

/**
 * Hook para exportar reporte de asistencia de un estudiante
 */
export function useExportStudentReport() {
  const mutation = useMutation({
    mutationFn: async ({
      studentId,
      format = 'excel',
      gradeId,
      sectionId,
      courseId,
      bimesterId,
      startDate,
      endDate,
    }: UseExportStudentReportParams) => {
      if (!gradeId || !sectionId || !courseId) {
        throw new Error('gradeId, sectionId y courseId son requeridos');
      }

      const blob = await attendanceReportsService.exportStudentReport(studentId, {
        gradeId,
        sectionId,
        courseId,
        format,
        bimesterId,
        startDate,
        endDate,
      });

      return { blob, format, studentId };
    },
    onSuccess: ({ blob, format, studentId }) => {
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
      link.download = `reporte_estudiante_${studentId}_${new Date().getTime()}${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });

  return mutation;
}
