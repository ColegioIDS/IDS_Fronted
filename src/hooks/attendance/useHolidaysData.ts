// src/hooks/attendance/useHolidaysData.ts
// ✅ Hook aislado para cargar días festivos
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Holiday } from '@/types/attendance.types';
import { attendanceConfigurationService } from '@/services/attendance-configuration.service';

interface UseHolidaysDataReturn {
  holidays: Holiday[];
  loading: boolean;
  error: string | null;
  isHoliday: (date: Date) => boolean;
  getHolidayInfo: (date: Date) => Holiday | null;
  fetchHolidays: () => Promise<void>;
  getUpcomingHolidays: (fromDate: Date, daysAhead?: number) => Promise<Holiday[]>;
}

/**
 * Hook para cargar y gestionar días festivos
 * - AISLADO: No usa otros hooks, context o servicios
 * - Proporciona métodos para verificar si una fecha es festiva
 */
export function useHolidaysData(): UseHolidaysDataReturn {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapa de fechas para búsqueda O(1)
  const holidayMap = useMemo(() => {
    const map = new Map<string, Holiday>();
    holidays.forEach(holiday => {
      const dateKey = holiday.date.split('T')[0]; // ISO date without time
      map.set(dateKey, holiday);
    });
    return map;
  }, [holidays]);

  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceConfigurationService.getHolidays();
      setHolidays(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar días festivos';
      setError(message);
      console.error('fetchHolidays error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const isHoliday = useCallback(
    (date: Date): boolean => {
      const dateKey = date.toISOString().split('T')[0];
      return holidayMap.has(dateKey);
    },
    [holidayMap]
  );

  const getHolidayInfo = useCallback(
    (date: Date): Holiday | null => {
      const dateKey = date.toISOString().split('T')[0];
      return holidayMap.get(dateKey) || null;
    },
    [holidayMap]
  );

  const getUpcomingHolidaysHelper = useCallback(
    async (fromDate: Date, daysAhead: number = 30): Promise<Holiday[]> => {
      try {
        const fromDateStr = fromDate.toISOString().split('T')[0];
        return await attendanceConfigurationService.getUpcomingHolidays(fromDateStr, daysAhead);
      } catch (err) {
        console.error('getUpcomingHolidays error:', err);
        return [];
      }
    },
    []
  );

  // Auto-fetch en mount
  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  return {
    holidays,
    loading,
    error,
    isHoliday,
    getHolidayInfo,
    fetchHolidays,
    getUpcomingHolidays: getUpcomingHolidaysHelper,
  };
}
