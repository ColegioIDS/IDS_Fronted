// src/hooks/data/useStudentExport.ts
'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  studentExportService,
  ExportFormData,
  ExportOptions,
} from '@/services/student-export.service';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseStudentExportOptions {
  autoFetch?: boolean;
}

export function useStudentExport(options: UseStudentExportOptions = {}) {
  const { autoFetch = true } = options;
  const [isDownloading, setIsDownloading] = useState(false);

  // ✅ Query para obtener datos del formulario
  const {
    data: formData,
    isLoading: isFormLoading,
    error: formError,
    refetch: refetchFormData,
  }: UseQueryResult<ExportFormData[], Error> = useQuery({
    queryKey: ['student-export', 'form-data'],
    queryFn: () => studentExportService.getExportFormData(),
    enabled: autoFetch,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 2,
  });

  /**
   * Descarga estudiantes en Excel
   */
  const downloadExcel = useCallback(
    async (cycleId: number, gradeId: number, sectionId: number, exportOptions?: ExportOptions) => {
      setIsDownloading(true);
      try {
        await studentExportService.exportStudents(cycleId, gradeId, sectionId, {
          ...exportOptions,
          format: 'excel',
        });
        toast.success('Archivo Excel descargado correctamente');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al descargar';
        toast.error(message);
        throw error;
      } finally {
        setIsDownloading(false);
      }
    },
    []
  );

  /**
   * Descarga estudiantes en CSV
   */
  const downloadCsv = useCallback(
    async (cycleId: number, gradeId: number, sectionId: number, exportOptions?: ExportOptions) => {
      setIsDownloading(true);
      try {
        await studentExportService.exportStudents(cycleId, gradeId, sectionId, {
          ...exportOptions,
          format: 'csv',
        });
        toast.success('Archivo CSV descargado correctamente');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al descargar';
        toast.error(message);
        throw error;
      } finally {
        setIsDownloading(false);
      }
    },
    []
  );

  /**
   * Descarga estudiantes en JSON
   */
  const downloadJson = useCallback(
    async (cycleId: number, gradeId: number, sectionId: number, exportOptions?: ExportOptions) => {
      setIsDownloading(true);
      try {
        await studentExportService.exportStudents(cycleId, gradeId, sectionId, {
          ...exportOptions,
          format: 'json',
        });
        toast.success('Archivo JSON descargado correctamente');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al descargar';
        toast.error(message);
        throw error;
      } finally {
        setIsDownloading(false);
      }
    },
    []
  );

  return {
    // Data
    formData,
    isFormLoading,
    formError,
    isDownloading,

    // Methods
    downloadExcel,
    downloadCsv,
    downloadJson,
    refetchFormData,
  };
}
