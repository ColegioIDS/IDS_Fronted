// src/hooks/attendance/useAttendanceActions.ts

'use client';

import { useCallback, useState } from 'react';
import { attendanceService } from '@/services/attendance.service';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  BulkCreateAttendanceDto,
  BulkUpdateAttendanceDto,
  BulkDeleteAttendanceDto,
  BulkApplyStatusDto,
  StudentAttendance,
  BulkAttendanceResponse,
  CreateJustificationDto,
  UpdateJustificationDto,
  StudentJustification,
} from '@/types/attendance.types';

interface ActionState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ActionState = {
  loading: false,
  error: null,
  success: false,
};

export const useAttendanceActions = () => {
  const [state, setState] = useState<ActionState>(initialState);

  /**
   * Crear asistencia
   */
  const createAttendance = useCallback(async (data: CreateAttendanceDto) => {
    setState({ loading: true, error: null, success: false });

    try {
      const result = await attendanceService.createAttendance(data);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState({ loading: false, error: errorMessage, success: false });
      throw err;
    }
  }, []);

  /**
   * Actualizar asistencia
   */
  const updateAttendance = useCallback(async (id: number, data: UpdateAttendanceDto) => {
    setState({ loading: true, error: null, success: false });

    try {
      const result = await attendanceService.updateAttendance(id, data);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState({ loading: false, error: errorMessage, success: false });
      throw err;
    }
  }, []);

  /**
   * Eliminar asistencia
   */
  const deleteAttendance = useCallback(async (id: number) => {
    setState({ loading: true, error: null, success: false });

    try {
      await attendanceService.deleteAttendance(id);
      setState({ loading: false, error: null, success: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState({ loading: false, error: errorMessage, success: false });
      throw err;
    }
  }, []);

  /**
   * Crear múltiples asistencias
   */
  const bulkCreateAttendances = useCallback(async (data: BulkCreateAttendanceDto) => {
    setState({ loading: true, error: null, success: false });

    try {
      const result = await attendanceService.bulkCreateAttendances(data);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState({ loading: false, error: errorMessage, success: false });
      throw err;
    }
  }, []);

  /**
   * Actualizar múltiples asistencias
   */
  const bulkUpdateAttendances = useCallback(async (data: BulkUpdateAttendanceDto) => {
    setState({ loading: true, error: null, success: false });

    try {
      const result = await attendanceService.bulkUpdateAttendances(data);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState({ loading: false, error: errorMessage, success: false });
      throw err;
    }
  }, []);

  /**
   * Eliminar múltiples asistencias
   */
  const bulkDeleteAttendances = useCallback(async (data: BulkDeleteAttendanceDto) => {
    setState({ loading: true, error: null, success: false });

    try {
      const result = await attendanceService.bulkDeleteAttendances(data);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState({ loading: false, error: errorMessage, success: false });
      throw err;
    }
  }, []);

  /**
   * Aplicar estado a múltiples estudiantes
   */
  const bulkApplyStatus = useCallback(async (data: BulkApplyStatusDto) => {
    setState({ loading: true, error: null, success: false });

    try {
      const result = await attendanceService.bulkApplyStatus(data);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState({ loading: false, error: errorMessage, success: false });
      throw err;
    }
  }, []);

  /**
   * Crear justificante
   */
  const createJustification = useCallback(async (data: CreateJustificationDto) => {
    setState({ loading: true, error: null, success: false });

    try {
      const result = await attendanceService.createJustification(data);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState({ loading: false, error: errorMessage, success: false });
      throw err;
    }
  }, []);

  /**
   * Actualizar justificante
   */
  const updateJustification = useCallback(
    async (id: number, data: UpdateJustificationDto) => {
      setState({ loading: true, error: null, success: false });

      try {
        const result = await attendanceService.updateJustification(id, data);
        setState({ loading: false, error: null, success: true });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setState({ loading: false, error: errorMessage, success: false });
        throw err;
      }
    },
    []
  );

  /**
   * Aprobar justificante
   */
  const approveJustification = useCallback(async (id: number, approvedBy: number) => {
    setState({ loading: true, error: null, success: false });

    try {
      const result = await attendanceService.approveJustification(id, approvedBy);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState({ loading: false, error: errorMessage, success: false });
      throw err;
    }
  }, []);

  /**
   * Rechazar justificante
   */
  const rejectJustification = useCallback(async (id: number, rejectionReason: string) => {
    setState({ loading: true, error: null, success: false });

    try {
      const result = await attendanceService.rejectJustification(id, rejectionReason);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState({ loading: false, error: errorMessage, success: false });
      throw err;
    }
  }, []);

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
    createAttendance,
    updateAttendance,
    deleteAttendance,
    bulkCreateAttendances,
    bulkUpdateAttendances,
    bulkDeleteAttendances,
    bulkApplyStatus,
    createJustification,
    updateJustification,
    approveJustification,
    rejectJustification,
    clearState,
    clearError,
  };
};
