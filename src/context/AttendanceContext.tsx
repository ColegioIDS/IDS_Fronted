/**
 * ====================================================================
 * ATTENDANCE CONTEXT - Contexto Global del Módulo de Asistencia
 * ====================================================================
 *
 * Proporciona el estado y acciones de asistencia a todos los componentes
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAttendance, AttendanceState, AttendanceActions } from '@/hooks/data/attendance/useAttendance';

interface AttendanceContextType {
  state: AttendanceState;
  actions: AttendanceActions;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [state, actions] = useAttendance();

  return (
    <AttendanceContext.Provider value={{ state, actions }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendanceContext() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendanceContext debe ser usado dentro de AttendanceProvider');
  }
  return context;
}
