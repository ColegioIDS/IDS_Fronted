'use client';

import { useState, useCallback } from 'react';
import { attendanceReportsService } from '@/services/attendance-reports.service';

export interface WeeklyTrendData {
  week: number;
  weekStart: string;
  weekEnd: string;
  averageAttendance: number;
  totalRecords: number;
}

export interface UseWeeklyTrendReturn {
  data: WeeklyTrendData[] | null;
  loading: boolean;
  error: string | null;
  loadWeeklyTrend: (bimesterId?: number, cycleId?: number) => Promise<void>;
}

/**
 * Hook para cargar datos de tendencia semanal
 */
export function useWeeklyTrendData(): UseWeeklyTrendReturn {
  const [data, setData] = useState<WeeklyTrendData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyTrend = useCallback(
    async (bimesterId?: number, cycleId?: number) => {
      console.log('📈 [WeeklyTrend] Loading weekly trend data', { bimesterId, cycleId });
      setLoading(true);
      setError(null);

      try {
        const params: any = {};
        if (bimesterId) params.bimesterId = bimesterId;
        if (cycleId) params.cycleId = cycleId;

        console.log('📈 [WeeklyTrend] Calling API with params:', params);
        const result = await attendanceReportsService.getWeeklyAttendance(params);
        
        console.log('📈 [WeeklyTrend] API Response:', result);

        if (Array.isArray(result) && result.length > 0) {
          // Transformar datos para la gráfica
          const transformedData = result.map((item: any, index: number) => ({
            week: item.weekNumber || item.week || index + 1,
            weekStart: item.startDate || item.start_date || '',
            weekEnd: item.endDate || item.end_date || '',
            averageAttendance: item.averageAttendance || item.average_attendance || 0,
            totalRecords: item.totalRecords || item.total_records || 0,
          }));

          console.log('📈 [WeeklyTrend] Transformed data:', transformedData);
          setData(transformedData);
        } else {
          console.warn('📈 [WeeklyTrend] No data returned from API:', result);
          setData([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('📈 [WeeklyTrend] Error loading weekly trend:', errorMessage);
        setError(errorMessage);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    loading,
    error,
    loadWeeklyTrend,
  };
}
