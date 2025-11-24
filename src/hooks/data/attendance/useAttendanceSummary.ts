/**
 * ====================================================================
 * USE ATTENDANCE SUMMARY - Hook para resumen general
 * ====================================================================
 */

'use client';

import { useState, useCallback } from 'react';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { AttendanceSummary, ReportQueryParams } from '@/types/attendance-reports.types';
import { parseApiError, ApiErrorResponse } from '@/middleware/api-handler';

export interface UseSummaryReturn {
  summary: AttendanceSummary | null;
  loading: boolean;
  error: ApiErrorResponse | null;
  loadSummary: (params?: Partial<ReportQueryParams>) => Promise<AttendanceSummary | null>;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar el resumen general de asistencia
 */
export function useAttendanceSummary(): UseSummaryReturn {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [currentParams, setCurrentParams] = useState<Partial<ReportQueryParams>>();

  const loadSummary = useCallback(
    async (params?: Partial<ReportQueryParams>): Promise<AttendanceSummary | null> => {
      console.log('📊 [useAttendanceSummary] loadSummary called with params:', params);
      setLoading(true);
      setError(null);

      try {
        console.log('📊 [useAttendanceSummary] Calling getSummary service...');
        const data = await attendanceReportsService.getSummary(params);
        console.log('📊 [useAttendanceSummary] getSummary returned:', {
          hasData: !!data,
          data,
          studentsTotal: data?.studentsTotal,
          averageAttendance: data?.averageAttendance,
        });
        setSummary(data);
        setCurrentParams(params);
        return data;
      } catch (err) {
        console.error('📊 [useAttendanceSummary] Error loading summary:', err);
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
      await loadSummary(currentParams);
    }
  }, [currentParams, loadSummary]);

  return {
    summary,
    loading,
    error,
    loadSummary,
    refetch,
  };
}
