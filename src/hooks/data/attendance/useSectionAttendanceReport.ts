/**
 * ====================================================================
 * USE SECTION ATTENDANCE REPORT - Hook para reporte de sección
 * ====================================================================
 */

'use client';

import { useState, useCallback } from 'react';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { SectionAttendanceReport, ReportQueryParams } from '@/types/attendance-reports.types';
import { parseApiError, ApiErrorResponse } from '@/middleware/api-handler';

export interface UseSectionReportReturn {
  report: SectionAttendanceReport | null;
  loading: boolean;
  error: ApiErrorResponse | null;
  loadReport: (sectionId: number, params?: Partial<ReportQueryParams>) => Promise<SectionAttendanceReport | null>;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar reporte de asistencia de una sección
 */
export function useSectionAttendanceReport(): UseSectionReportReturn {
  const [report, setReport] = useState<SectionAttendanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
  const [currentParams, setCurrentParams] = useState<Partial<ReportQueryParams>>();

  const loadReport = useCallback(
    async (
      sectionId: number,
      params?: Partial<ReportQueryParams>
    ): Promise<SectionAttendanceReport | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await attendanceReportsService.getSectionReport(sectionId, params);
        setReport(response);
        setCurrentSectionId(sectionId);
        setCurrentParams(params);
        return response;
      } catch (err) {
        const apiError = parseApiError(err);
        setError(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refetch = useCallback(async () => {
    if (currentSectionId !== null && currentParams) {
      await loadReport(currentSectionId, currentParams);
    }
  }, [currentSectionId, currentParams, loadReport]);

  return {
    report,
    loading,
    error,
    loadReport,
    refetch,
  };
}
