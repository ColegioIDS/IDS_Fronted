/**
 * ====================================================================
 * USE ATTENDANCE BY STATUS - Hook para desglose por estado
 * ====================================================================
 */

'use client';

import { useState, useCallback } from 'react';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { AttendanceByStatusResponse, ReportQueryParams } from '@/types/attendance-reports.types';
import { parseApiError, ApiErrorResponse } from '@/middleware/api-handler';

export interface UseByStatusReturn {
  data: AttendanceByStatusResponse | null;
  loading: boolean;
  error: ApiErrorResponse | null;
  loadByStatus: (params?: Partial<ReportQueryParams>) => Promise<AttendanceByStatusResponse | null>;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar desglose de asistencia por estado
 */
export function useAttendanceByStatus(): UseByStatusReturn {
  const [data, setData] = useState<AttendanceByStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [currentParams, setCurrentParams] = useState<Partial<ReportQueryParams>>();

  const loadByStatus = useCallback(
    async (params?: Partial<ReportQueryParams>): Promise<AttendanceByStatusResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await attendanceReportsService.getByStatus(params);
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
      await loadByStatus(currentParams);
    }
  }, [currentParams, loadByStatus]);

  return {
    data,
    loading,
    error,
    loadByStatus,
    refetch,
  };
}
