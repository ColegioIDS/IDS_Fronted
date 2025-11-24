/**
 * ====================================================================
 * USE ATTENDANCE STATISTICS - Hook para estadísticas completas
 * ====================================================================
 */

'use client';

import { useState, useCallback } from 'react';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { AttendanceStatistics, ReportQueryParams } from '@/types/attendance-reports.types';
import { parseApiError, ApiErrorResponse } from '@/middleware/api-handler';

export interface UseStatisticsReturn {
  statistics: AttendanceStatistics | null;
  loading: boolean;
  error: ApiErrorResponse | null;
  loadStatistics: (params?: Partial<ReportQueryParams>) => Promise<AttendanceStatistics | null>;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar estadísticas completas de asistencia
 */
export function useAttendanceStatistics(): UseStatisticsReturn {
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [currentParams, setCurrentParams] = useState<Partial<ReportQueryParams>>();

  const loadStatistics = useCallback(
    async (params?: Partial<ReportQueryParams>): Promise<AttendanceStatistics | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await attendanceReportsService.getStatistics(params);
        setStatistics(response);
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
      await loadStatistics(currentParams);
    }
  }, [currentParams, loadStatistics]);

  return {
    statistics,
    loading,
    error,
    loadStatistics,
    refetch,
  };
}
