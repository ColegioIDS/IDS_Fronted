// src/hooks/data/useAttendanceStatuses.ts
import { useState, useEffect, useCallback } from 'react';
import { attendanceStatusesService } from '@/services/attendance-statuses.service';
import {
  AttendanceStatus,
  PaginatedAttendanceStatuses,
  AttendanceStatusQuery,
} from '@/types/attendance-status.types';

export function useAttendanceStatuses(initialQuery: AttendanceStatusQuery = {}) {
  const [data, setData] = useState<PaginatedAttendanceStatuses | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<AttendanceStatusQuery>(initialQuery);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadStatuses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await attendanceStatusesService.getStatuses(query);

        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error al cargar estados de asistencia');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStatuses();

    return () => {
      isMounted = false;
    };
  }, [
    query.page,
    query.limit,
    query.search,
    query.isActive,
    query.isNegative,
    query.isExcused,
    query.requiresJustification,
    query.sortBy,
    query.sortOrder,
    refreshKey,
  ]);

  const updateQuery = useCallback((newQuery: Partial<AttendanceStatusQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    data,
    isLoading,
    error,
    query,
    updateQuery,
    refresh,
  };
}
