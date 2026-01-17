// src/hooks/data/attendance-statuses/useAttendanceStatuses.ts
/**
 * Hook para gestionar Estados de Asistencia
 * Proporciona métodos para listar, crear, actualizar y eliminar estados
 * Maneja caché, paginación, filtros y estados de carga
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { attendanceStatusesService } from '@/services/attendance-statuses.service';
import {
  AttendanceStatus,
  PaginatedAttendanceStatuses,
  AttendanceStatusQuery,
  AttendanceStatusStats,
  CreateAttendanceStatusDto,
  UpdateAttendanceStatusDto,
  AttendanceStatusFormData,
} from '@/types/attendance-status.types';

// ============================================
// TIPOS DEL HOOK
// ============================================

interface UseAttendanceStatusesReturn {
  // Estado
  statuses: AttendanceStatus[];
  currentStatus: AttendanceStatus | null;
  stats: AttendanceStatusStats | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isDeletingId: number | null;
  error: string | null;
  successMessage: string | null;
  query: AttendanceStatusQuery;
  pagination: PaginatedAttendanceStatuses['meta'] | null;

  // Métodos de consulta
  getStatuses: (filters?: AttendanceStatusQuery) => Promise<void>;
  getActiveStatuses: () => Promise<AttendanceStatus[]>;
  getNegativeStatuses: () => Promise<AttendanceStatus[]>;
  getStatusById: (id: number) => Promise<AttendanceStatus | null>;
  getStatusByCode: (code: string) => Promise<AttendanceStatus | null>;
  getStatusStats: (id: number) => Promise<AttendanceStatusStats | null>;

  // Métodos de mutación
  createStatus: (data: CreateAttendanceStatusDto) => Promise<AttendanceStatus | null>;
  updateStatus: (id: number, data: UpdateAttendanceStatusDto) => Promise<AttendanceStatus | null>;
  deleteStatus: (id: number) => Promise<boolean>;
  activateStatus: (id: number) => Promise<boolean>;
  deactivateStatus: (id: number) => Promise<boolean>;

  // Métodos de UI
  updateQuery: (newQuery: Partial<AttendanceStatusQuery>) => void;
  clearError: () => void;
  clearSuccess: () => void;
  refresh: () => Promise<void>;
  reset: () => void;

  // Computados
  totalCount: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasStatuses: boolean;
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useAttendanceStatuses(
  initialQuery: AttendanceStatusQuery = { page: 1, limit: 10 }
): UseAttendanceStatusesReturn {
  // ====== Estados de datos ======
  const [statuses, setStatuses] = useState<AttendanceStatus[]>([]);
  const [currentStatus, setCurrentStatus] = useState<AttendanceStatus | null>(null);
  const [stats, setStats] = useState<AttendanceStatusStats | null>(null);

  // ====== Estados de carga ======
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  // ====== Estados de mensajes ======
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ====== Estados de consulta ======
  const [query, setQuery] = useState<AttendanceStatusQuery>(initialQuery);
  const [pagination, setPagination] = useState<PaginatedAttendanceStatuses['meta'] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ====== Funciones auxiliares ======
  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccessMessage(null), []);

  // ====== Métodos de consulta (lectura) ======

  /**
   * Obtener estados paginados con filtros
   */
  const getStatuses = useCallback(
    async (filters?: AttendanceStatusQuery) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await attendanceStatusesService.getStatuses(
          filters || query
        );
        setStatuses(result.data);
        setPagination(result.meta);
      } catch (err: any) {
        const message = err.message || 'Error al cargar estados de asistencia';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [] // Sin dependencias para evitar loop infinito
  );

  /**
   * Obtener estados activos
   */
  const getActiveStatuses = useCallback(async (): Promise<AttendanceStatus[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await attendanceStatusesService.getActiveStatuses();
      return result;
    } catch (err: any) {
      const message = err.message || 'Error al obtener estados activos';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener estados negativos (ausencias)
   */
  const getNegativeStatuses = useCallback(async (): Promise<AttendanceStatus[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await attendanceStatusesService.getNegativeStatuses();
      return result;
    } catch (err: any) {
      const message = err.message || 'Error al obtener estados negativos';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener estado por ID
   */
  const getStatusById = useCallback(async (id: number): Promise<AttendanceStatus | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await attendanceStatusesService.getStatusById(id);
      setCurrentStatus(result);
      return result;
    } catch (err: any) {
      const message = err.message || 'Error al obtener estado';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener estado por código
   */
  const getStatusByCode = useCallback(
    async (code: string): Promise<AttendanceStatus | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await attendanceStatusesService.getStatusByCode(code);
        return result;
      } catch (err: any) {
        const message = err.message || 'Error al obtener estado por código';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Obtener estadísticas de un estado
   */
  const getStatusStats = useCallback(
    async (id: number): Promise<AttendanceStatusStats | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await attendanceStatusesService.getStatusStats(id);
        setStats(result);
        return result;
      } catch (err: any) {
        const message = err.message || 'Error al obtener estadísticas';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ====== Métodos de mutación (escritura) ======

  /**
   * Crear nuevo estado
   */
  const createStatus = useCallback(
    async (data: CreateAttendanceStatusDto): Promise<AttendanceStatus | null> => {
      try {
        setIsSubmitting(true);
        setError(null);
        const result = await attendanceStatusesService.createStatus(data);
        setSuccessMessage(`Estado "${result.name}" creado exitosamente`);
        setRefreshKey((k) => k + 1); // Refrescar lista
        return result;
      } catch (err: any) {
        const message = err.message || 'Error al crear estado';
        setError(message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  /**
   * Actualizar estado existente
   */
  const updateStatus = useCallback(
    async (id: number, data: UpdateAttendanceStatusDto): Promise<AttendanceStatus | null> => {
      try {
        setIsSubmitting(true);
        setError(null);
        const result = await attendanceStatusesService.updateStatus(id, data);
        setSuccessMessage(`Estado actualizado exitosamente`);
        setCurrentStatus(result);
        setRefreshKey((k) => k + 1); // Refrescar lista
        return result;
      } catch (err: any) {
        const message = err.message || 'Error al actualizar estado';
        setError(message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  /**
   * Eliminar estado
   */
  const deleteStatus = useCallback(async (id: number): Promise<boolean> => {
    try {
      setIsDeletingId(id);
      setError(null);
      await attendanceStatusesService.deleteStatus(id);
      setSuccessMessage('Estado eliminado exitosamente');
      setRefreshKey((k) => k + 1); // Refrescar lista
      return true;
    } catch (err: any) {
      const message = err.message || 'Error al eliminar estado';
      setError(message);
      return false;
    } finally {
      setIsDeletingId(null);
    }
  }, []);

  /**
   * Activar estado
   */
  const activateStatus = useCallback(async (id: number): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);
      await attendanceStatusesService.activateStatus(id);
      setSuccessMessage('Estado activado exitosamente');
      setRefreshKey((k) => k + 1); // Refrescar lista
      return true;
    } catch (err: any) {
      const message = err.message || 'Error al activar estado';
      setError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Desactivar estado
   */
  const deactivateStatus = useCallback(async (id: number): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);
      await attendanceStatusesService.deactivateStatus(id);
      setSuccessMessage('Estado desactivado exitosamente');
      setRefreshKey((k) => k + 1); // Refrescar lista
      return true;
    } catch (err: any) {
      const message = err.message || 'Error al desactivar estado';
      setError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // ====== Métodos de UI ======

  const updateQuery = useCallback((newQuery: Partial<AttendanceStatusQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery, page: 1 })); // Resetear página
  }, []);

  const refresh = useCallback(async () => {
    setRefreshKey((k) => k + 1);
    await getStatuses();
  }, [getStatuses]);

  const reset = useCallback(() => {
    setStatuses([]);
    setCurrentStatus(null);
    setStats(null);
    setError(null);
    setSuccessMessage(null);
    setQuery({ page: 1, limit: 10 });
    setPagination(null);
  }, []);

  // ====== Efecto para cargar datos ======

  useEffect(() => {
    getStatuses();
  }, [query, refreshKey, getStatuses]);

  // ====== Valores computados ======

  const totalCount = useMemo(() => pagination?.total || 0, [pagination?.total]);
  const isFirstPage = useMemo(() => pagination?.page === 1, [pagination?.page]);
  const isLastPage = useMemo(
    () => !pagination?.hasNextPage,
    [pagination?.hasNextPage]
  );
  const hasStatuses = useMemo(() => statuses.length > 0, [statuses.length]);

  // ====== Retorno ======

  return {
    // Estado
    statuses,
    currentStatus,
    stats,
    isLoading,
    isSubmitting,
    isDeletingId,
    error,
    successMessage,
    query,
    pagination,

    // Métodos de consulta
    getStatuses,
    getActiveStatuses,
    getNegativeStatuses,
    getStatusById,
    getStatusByCode,
    getStatusStats,

    // Métodos de mutación
    createStatus,
    updateStatus,
    deleteStatus,
    activateStatus,
    deactivateStatus,

    // Métodos de UI
    updateQuery,
    clearError,
    clearSuccess,
    refresh,
    reset,

    // Computados
    totalCount,
    isFirstPage,
    isLastPage,
    hasStatuses,
  };
}
