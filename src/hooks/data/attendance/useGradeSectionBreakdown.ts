/**
 * ====================================================================
 * USE GRADE SECTION BREAKDOWN - Hook para desglose grado-sección
 * ====================================================================
 */

'use client';

import { useState, useCallback } from 'react';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { GradeSectionBreakdown, ReportQueryParams } from '@/types/attendance-reports.types';
import { parseApiError, ApiErrorResponse } from '@/middleware/api-handler';

export interface UseGradeSectionBreakdownReturn {
  data: GradeSectionBreakdown | null;
  loading: boolean;
  error: ApiErrorResponse | null;
  loadBreakdown: (params?: Partial<ReportQueryParams>) => Promise<GradeSectionBreakdown | null>;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar desglose de asistencia por grado y sección
 */
export function useGradeSectionBreakdown(): UseGradeSectionBreakdownReturn {
  const [data, setData] = useState<GradeSectionBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [currentParams, setCurrentParams] = useState<Partial<ReportQueryParams>>();

  const loadBreakdown = useCallback(
    async (params?: Partial<ReportQueryParams>): Promise<GradeSectionBreakdown | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await attendanceReportsService.getByGradeSection(params);
        setData(response);
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
    if (currentParams) {
      await loadBreakdown(currentParams);
    }
  }, [currentParams, loadBreakdown]);

  return {
    data,
    loading,
    error,
    loadBreakdown,
    refetch,
  };
}
