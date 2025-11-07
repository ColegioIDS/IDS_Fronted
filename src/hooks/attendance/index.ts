// src/hooks/attendance/index.ts

/**
 * Centralizar todas las exportaciones de hooks de attendance
 * para importaciones limpias en componentes
 */

// Hooks de asistencia (PHASE 1 & 2)
export { useAttendanceData } from './useAttendanceData';
export { useAttendanceFilters } from './useAttendanceFilters';
export { useAttendanceActions } from './useAttendanceActions';

// Hooks de configuración (PHASE 3)
export { useGradesAndSections } from './useGradesAndSections';
export { useHolidaysData } from './useHolidaysData';

