/**
 * ====================================================================
 * USE DAILY REGISTRATION - Hook para registro diario (TAB 1)
 * ====================================================================
 *
 * Hook especializado para el flujo de registro de asistencia diaria:
 * • Selección masiva de estudiantes
 * • Cambio de estado para grupos
 * • Validaciones previas
 * • Envío de cambios
 */

'use client';

import { useState, useCallback } from 'react';
import { Enrollment } from '@/types/attendance.types';
import { parseApiError, ApiErrorResponse } from '@/middleware/api-handler';
import { registerDailyAttendance } from '@/services/attendance.service';

/**
 * Registro temporal para una sesión diaria
 */
export interface DailyRegistrationRecord {
  enrollmentId: number;
  studentName: string;
  originalStatus: string;
  currentStatus: string;
  isSelected: boolean;
  isModified: boolean;
}

/**
 * Estado del registro diario
 */
export interface DailyRegistrationState {
  registrations: Map<number, DailyRegistrationRecord>;
  selectedCount: number;
  modifiedCount: number;
  isSubmitting: boolean;
  error: ApiErrorResponse | null;
  successMessage?: string;
  dateForRegistration?: string;
  sectionIdForRegistration?: number;
}

/**
 * Acciones del registro diario
 */
export interface DailyRegistrationActions {
  initializeRegistrations: (students: Enrollment[], date: string, sectionId: number) => void;
  toggleStudent: (enrollmentId: number) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setStatusForSelected: (status: string) => void;
  setStatusForStudent: (enrollmentId: number, status: string) => void;
  submitRegistration: () => Promise<boolean>;
  clearError: () => void;
  resetForm: () => void;
}

/**
 * Hook para registro diario de asistencia
 */
export function useDailyRegistration(): [DailyRegistrationState, DailyRegistrationActions] {
  const [state, setState] = useState<DailyRegistrationState>({
    registrations: new Map(),
    selectedCount: 0,
    modifiedCount: 0,
    isSubmitting: false,
    error: null,
    successMessage: undefined,
    dateForRegistration: undefined,
    sectionIdForRegistration: undefined,
  });

  /**
   * Inicializa registros a partir de lista de estudiantes
   */
  const initializeRegistrations = useCallback(
    (students: Enrollment[], date: string, sectionId: number) => {
      const registrations = new Map<number, DailyRegistrationRecord>();

      students.forEach(student => {
        registrations.set(student.id, {
          enrollmentId: student.id,
          studentName: student.studentName || 'N/A',
          originalStatus: 'PRESENT', // Default status
          currentStatus: 'PRESENT', // Default status
          isSelected: false,
          isModified: false,
        });
      });

      setState(prev => ({
        ...prev,
        registrations,
        dateForRegistration: date,
        sectionIdForRegistration: sectionId,
        selectedCount: 0,
        modifiedCount: 0,
        error: null,
        successMessage: undefined,
      }));
    },
    []
  );

  /**
   * Alterna selección de un estudiante
   */
  const toggleStudent = useCallback((enrollmentId: number) => {
    setState(prev => {
      const record = prev.registrations.get(enrollmentId);
      if (!record) return prev;

      const updated = new Map(prev.registrations);
      updated.set(enrollmentId, {
        ...record,
        isSelected: !record.isSelected,
      });

      const selectedCount = Array.from(updated.values()).filter(r => r.isSelected).length;

      return {
        ...prev,
        registrations: updated,
        selectedCount,
      };
    });
  }, []);

  /**
   * Selecciona todos los estudiantes
   */
  const selectAll = useCallback(() => {
    setState(prev => {
      const updated = new Map(prev.registrations);
      updated.forEach(record => {
        record.isSelected = true;
      });
      return {
        ...prev,
        registrations: updated,
        selectedCount: updated.size,
      };
    });
  }, []);

  /**
   * Deselecciona todos los estudiantes
   */
  const deselectAll = useCallback(() => {
    setState(prev => {
      const updated = new Map(prev.registrations);
      updated.forEach(record => {
        record.isSelected = false;
      });
      return {
        ...prev,
        registrations: updated,
        selectedCount: 0,
      };
    });
  }, []);

  /**
   * Establece estado para todos los seleccionados
   */
  const setStatusForSelected = useCallback((status: string) => {
    setState(prev => {
      const updated = new Map(prev.registrations);
      let modifiedCount = 0;

      updated.forEach(record => {
        if (record.isSelected) {
          record.currentStatus = status;
          record.isModified = status !== record.originalStatus;
          if (record.isModified) modifiedCount++;
        }
      });

      return {
        ...prev,
        registrations: updated,
        modifiedCount,
      };
    });
  }, []);

  /**
   * Establece estado para un estudiante específico
   */
  const setStatusForStudent = useCallback((enrollmentId: number, status: string) => {
    setState(prev => {
      const record = prev.registrations.get(enrollmentId);
      if (!record) return prev;

      const updated = new Map(prev.registrations);
      const isModified = status !== record.originalStatus;

      updated.set(enrollmentId, {
        ...record,
        currentStatus: status,
        isModified,
      });

      let modifiedCount = 0;
      updated.forEach(r => {
        if (r.isModified) modifiedCount++;
      });

      return {
        ...prev,
        registrations: updated,
        modifiedCount,
      };
    });
  }, []);

  /**
   * Envía el registro diario
   */
  const submitRegistration = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      if (!state.dateForRegistration || !state.sectionIdForRegistration) {
        throw new Error('Falta información de fecha o sección');
      }

      // Preparar enrollmentStatuses (enrollmentId -> statusId)
      // En una implementación real, necesitarías mapear códigos de status a IDs
      const enrollmentStatuses: Record<number, number> = {};
      let modifiedCount = 0;

      state.registrations.forEach(record => {
        if (record.isModified) {
          // TODO: En la implementación real, mapear record.currentStatus a attendanceStatusId
          // Por ahora usar un placeholder
          enrollmentStatuses[record.enrollmentId] = 1;
          modifiedCount++;
        }
      });

      // Llamar al servicio
      await registerDailyAttendance({
        date: state.dateForRegistration,
        sectionId: state.sectionIdForRegistration,
        enrollmentStatuses,
      });

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        successMessage: `${modifiedCount} registros guardados exitosamente`,
        registrations: new Map(),
        selectedCount: 0,
        modifiedCount: 0,
      }));

      return true;
    } catch (error) {
      const apiError = parseApiError(error);
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: apiError,
      }));
      return false;
    }
  }, [state.dateForRegistration, state.sectionIdForRegistration, state.registrations]);

  /**
   * Limpia mensaje de error
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  /**
   * Reinicia el formulario
   */
  const resetForm = useCallback(() => {
    setState({
      registrations: new Map(),
      selectedCount: 0,
      modifiedCount: 0,
      isSubmitting: false,
      error: null,
      successMessage: undefined,
      dateForRegistration: undefined,
      sectionIdForRegistration: undefined,
    });
  }, []);

  const actions: DailyRegistrationActions = {
    initializeRegistrations,
    toggleStudent,
    selectAll,
    deselectAll,
    setStatusForSelected,
    setStatusForStudent,
    submitRegistration,
    clearError,
    resetForm,
  };

  return [state, actions];
}