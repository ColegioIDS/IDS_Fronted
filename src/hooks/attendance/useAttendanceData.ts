// src/hooks/attendance/useAttendanceData.ts

'use client';

import { useState, useCallback } from 'react';
import { attendanceService } from '@/services/attendance.service';
import {
  StudentAttendanceWithRelations,
  PaginatedAttendance,
  AttendanceQuery,
  AttendanceQueryWithScope,
  AttendanceStats,
} from '@/types/attendance.types';

interface UseAttendanceDataState {
  attendances: StudentAttendanceWithRelations[];
  stats: AttendanceStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: UseAttendanceDataState = {
  attendances: [],
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

export const useAttendanceData = () => {
  const [state, setState] = useState<UseAttendanceDataState>(initialState);

  /**
   * Obtener asistencias
   */
  const fetchAttendances = useCallback(
    async (query: AttendanceQuery | AttendanceQueryWithScope = {}) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      console.log('📡 fetchAttendances llamado con query:', query);

      try {
        const result: PaginatedAttendance = await attendanceService.getAttendances(query);
        console.log('✅ Respuesta de asistencias:', result);

        setState((prev) => ({
          ...prev,
          attendances: result.data,
          stats: result.stats || null,
          pagination: result.meta,
          loading: false,
        }));

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('❌ Error fetchAttendances:', errorMessage);
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        throw err;
      }
    },
    []
  );

  /**
   * Obtener una asistencia por ID
   */
  const fetchAttendanceById = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const attendance = await attendanceService.getAttendanceById(id);
      setState((prev) => ({ ...prev, loading: false }));
      return attendance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      throw err;
    }
  }, []);

  /**
   * Obtener asistencias por estudiante
   */
  const fetchStudentAttendances = useCallback(
    async (enrollmentId: number, query?: Omit<AttendanceQuery, 'enrollmentId'>) => {
      return fetchAttendances({ ...query, enrollmentId });
    },
    [fetchAttendances]
  );

  /**
   * Obtener asistencias por sección
   */
  const fetchSectionAttendances = useCallback(
    async (sectionId: number, query?: Omit<AttendanceQuery, 'sectionId'>) => {
      return fetchAttendances({ ...query, sectionId });
    },
    [fetchAttendances]
  );

  /**
   * Obtener estadísticas
   */
  const fetchStats = useCallback(async (query: AttendanceQuery = {}) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const stats = await attendanceService.getAttendanceStats(query);
      setState((prev) => ({
        ...prev,
        stats,
        loading: false,
      }));
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      throw err;
    }
  }, []);

  /**
   * Cambiar página
   */
  const changePage = useCallback(
    (page: number, query?: AttendanceQuery | AttendanceQueryWithScope) => {
      return fetchAttendances({ ...query, page });
    },
    [fetchAttendances]
  );

  /**
   * Cambiar límite de resultados
   */
  const changeLimit = useCallback(
    (limit: number, query?: AttendanceQuery | AttendanceQueryWithScope) => {
      return fetchAttendances({ ...query, limit, page: 1 });
    },
    [fetchAttendances]
  );

  /**
   * Limpiar estado
   */
  const clearState = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchAttendances,
    fetchAttendanceById,
    fetchStudentAttendances,
    fetchSectionAttendances,
    fetchStats,
    changePage,
    changeLimit,
    clearState,
    clearError,
  };
};
