// src/hooks/data/useScheduleExport.ts
'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  scheduleExportService,
  ScheduleExportOptions,
} from '@/services/schedule-export.service';

interface UseScheduleExportOptions {
  autoFetch?: boolean;
}

export function useScheduleExport(options: UseScheduleExportOptions = {}) {
  const [isDownloading, setIsDownloading] = useState(false);

  /**
   * Descarga horarios en Excel
   */
  const downloadExcel = useCallback(
    async (sectionId: number, exportOptions?: ScheduleExportOptions) => {
      setIsDownloading(true);
      try {
        await scheduleExportService.exportSchedules(sectionId, {
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
   * Descarga horarios en CSV
   */
  const downloadCsv = useCallback(
    async (sectionId: number, exportOptions?: ScheduleExportOptions) => {
      setIsDownloading(true);
      try {
        await scheduleExportService.exportSchedules(sectionId, {
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
   * Descarga horarios en JSON
   */
  const downloadJson = useCallback(
    async (sectionId: number, exportOptions?: ScheduleExportOptions) => {
      setIsDownloading(true);
      try {
        await scheduleExportService.exportSchedules(sectionId, {
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

  /**
   * Descarga horarios en PDF
   */
  const downloadPdf = useCallback(
    async (sectionId: number, exportOptions?: ScheduleExportOptions) => {
      setIsDownloading(true);
      try {
        await scheduleExportService.exportSchedules(sectionId, {
          ...exportOptions,
          format: 'pdf',
        });
        toast.success('Archivo PDF descargado correctamente');
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
    isDownloading,

    // Methods
    downloadExcel,
    downloadCsv,
    downloadJson,
    downloadPdf,
  };
}