/**
 * ====================================================================
 * USE ATTENDANCE - Hook principal del módulo
 * ====================================================================
 *
 * Hook composado que maneja:
 * • Carga de datos base (ciclo, bimestre, sección, estudiantes)
 * • Estado general del módulo
 * • Transiciones entre tabs
 * • Errores y loading states
 *
 * Reutiliza services ya existentes y hooks de datos
 */

'use client';

import { getTodayInConfiguredTimezone } from '@/config/timezone';

import { useState, useCallback, useEffect } from 'react';
import { AttendanceRecord } from '@/types/attendance.types';
import { parseApiError, ApiErrorResponse } from '@/middleware/api-handler';
import {
  registerDailyAttendance,
  getActiveCycle,
} from '@/services/attendance.service';
import { ATTENDANCE_TABS } from '@/constants/attendance.constants';

/**
 * Estado del módulo de asistencia
 */
export interface AttendanceState {
  // Selecciones
  selectedCycleId: number | null;
  selectedBimesterId: number | null;
  selectedSectionId: number | null;
  selectedDate: string; // YYYY-MM-DD

  // Datos cargados
  activeCycle: Record<string, unknown> | null;
  students: AttendanceRecord[];
  registrations: Map<number, AttendanceRecord>;

  // Estados de carga
  isLoadingCycle: boolean;
  isLoadingStudents: boolean;
  isRegistering: boolean;

  // Errores
  error: ApiErrorResponse | null;
  validationErrors: Record<string, string>;

  // UI
  currentTab: string;
  expandedStudentId: number | null;
}

/**
 * Acciones disponibles
 */
export interface AttendanceActions {
  // Selecciones
  selectCycle: (cycleId: number) => void;
  selectBimester: (bimesterId: number) => void;
  selectSection: (sectionId: number | undefined) => void;
  selectDate: (date: string) => void;

  // Carga de datos
  loadActiveCycle: () => Promise<void>;
  loadDailyRegistrationStatus: () => Promise<void>;

  // Operaciones
  registerDaily: (enrollmentStatuses: Record<number, number>) => Promise<void>;

  // UI
  setCurrentTab: (tab: string) => void;
  setExpandedStudent: (studentId: number | null) => void;
  clearError: () => void;
  setStudents: (students: Record<string, unknown>[]) => void;

  // Reset
  reset: () => void;
}

/**
 * Hook principal de asistencia
 * @returns {Object} Estado y acciones
 */
export function useAttendance(): [AttendanceState, AttendanceActions] {
  // Estado
  const [state, setState] = useState<AttendanceState>({
    selectedCycleId: null,
    selectedBimesterId: null,
    selectedSectionId: null,
    selectedDate: getTodayInConfiguredTimezone(),
    activeCycle: null,
    students: [],
    registrations: new Map(),
    isLoadingCycle: false,
    isLoadingStudents: false,
    isRegistering: false,
    error: null,
    validationErrors: {},
    currentTab: ATTENDANCE_TABS.TAB_1,
    expandedStudentId: null,
  });

  // ====================================================================
  // SELECCIONES
  // ====================================================================

  const selectCycle = useCallback((cycleId: number) => {
    setState(prev => ({
      ...prev,
      selectedCycleId: cycleId,
      error: null,
    }));
  }, []);

  const selectBimester = useCallback((bimesterId: number) => {
    setState(prev => ({
      ...prev,
      selectedBimesterId: bimesterId,
      error: null,
    }));
  }, []);

  const selectSection = useCallback((sectionId: number | undefined) => {
    setState(prev => ({
      ...prev,
      selectedSectionId: sectionId ?? null,
      error: null,
    }));
  }, []);

  const selectDate = useCallback((date: string) => {
    setState(prev => ({
      ...prev,
      selectedDate: date,
      error: null,
    }));
  }, []);

  // ====================================================================
  // CARGA DE DATOS
  // ====================================================================

  const loadActiveCycle = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingCycle: true }));
    try {
      const cycle = await getActiveCycle();
      const cycleId = (cycle && typeof cycle === 'object' && 'id' in cycle) ? (cycle.id as number) : null;
      setState(prev => ({
        ...prev,
        activeCycle: cycle,
        selectedCycleId: cycleId,
        isLoadingCycle: false,
        error: null,
      }));
    } catch (error) {
      const apiError = parseApiError(error);
      setState(prev => ({
        ...prev,
        isLoadingCycle: false,
        error: apiError,
      }));
    }
  }, []);

  const loadDailyRegistrationStatus = useCallback(async () => {
    if (!state.selectedSectionId || !state.selectedDate) {
      setState(prev => ({
        ...prev,
        validationErrors: {
          section: 'Debes seleccionar una sección',
          date: 'Debes seleccionar una fecha',
        },
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoadingStudents: true }));
    try {
      // Placeholder: en la implementación real llamarías a getSectionAttendanceByDate
      setState(prev => ({
        ...prev,
        students: [],
        registrations: new Map(),
        isLoadingStudents: false,
        error: null,
        validationErrors: {},
      }));
    } catch (error) {
      const apiError = parseApiError(error);
      setState(prev => ({
        ...prev,
        isLoadingStudents: false,
        error: apiError,
      }));
    }
  }, [state.selectedSectionId, state.selectedDate]);

  // ====================================================================
  // OPERACIONES
  // ====================================================================

  const registerDaily = useCallback(
    async (enrollmentStatuses: Record<number, number>) => {
      if (!state.selectedSectionId || !state.selectedDate) {
        setState(prev => ({
          ...prev,
          error: parseApiError(new Error('Sección y fecha son requeridas')),
        }));
        return;
      }

      setState(prev => ({ ...prev, isRegistering: true }));
      try {
        await registerDailyAttendance({
          date: state.selectedDate,
          sectionId: state.selectedSectionId,
          enrollmentStatuses,
        });

        setState(prev => ({
          ...prev,
          isRegistering: false,
          error: null,
        }));
      } catch (error) {
        const apiError = parseApiError(error);
        setState(prev => ({
          ...prev,
          isRegistering: false,
          error: apiError,
        }));
      }
    },
    [state.selectedSectionId, state.selectedDate]
  );

  // ====================================================================
  // UI
  // ====================================================================

  const setCurrentTab = useCallback((tab: string) => {
    setState(prev => ({
      ...prev,
      currentTab: tab,
      error: null,
    }));
  }, []);

  const setExpandedStudent = useCallback((studentId: number | null) => {
    setState(prev => ({
      ...prev,
      expandedStudentId: studentId,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      validationErrors: {},
    }));
  }, []);

  const setStudents = useCallback((students: Record<string, unknown>[]) => {
    setState(prev => ({
      ...prev,
      students: students as unknown as AttendanceRecord[],
      registrations: new Map(),
    }));
  }, []);  // ====================================================================
  // RESET
  // ====================================================================

  const reset = useCallback(() => {
    setState({
      selectedCycleId: null,
      selectedBimesterId: null,
      selectedSectionId: null,
      selectedDate: getTodayInConfiguredTimezone(),
      activeCycle: null,
      students: [],
      registrations: new Map(),
      isLoadingCycle: false,
      isLoadingStudents: false,
      isRegistering: false,
      error: null,
      validationErrors: {},
      currentTab: ATTENDANCE_TABS.TAB_1,
      expandedStudentId: null,
    });
  }, []);

  // ====================================================================
  // EFECTOS
  // ====================================================================

  // Cargar ciclo activo al montar
  useEffect(() => {
    void loadActiveCycle();
  }, [loadActiveCycle]);

  // ====================================================================
  // ACCIONES
  // ====================================================================

  const actions: AttendanceActions = {
    selectCycle,
    selectBimester,
    selectSection,
    selectDate,
    loadActiveCycle,
    loadDailyRegistrationStatus,
    registerDaily,
    setCurrentTab,
    setExpandedStudent,
    clearError,
    setStudents,
    reset,
  };

  return [state, actions];
}