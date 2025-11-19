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
export { useAttendanceByDate } from './useAttendanceByDate';
export { useActiveCycleId } from './useActiveCycleId';

// Hooks de estados (PHASE 3 - Dynamic Status Management)
export { useAttendanceStatuses } from './useAttendanceStatuses';

// Hooks de cursos del maestro (NUEVOS - Endpoint 1 & 2)
export { useTeacherCourses } from './useTeacherCourses';
export { useTeacherAttendanceRegistration } from './useTeacherAttendanceRegistration';

// Hooks para estudiantes de sección (NUEVO - Get Section Students)
export { useSectionStudents } from './useSectionStudents';
export type { StudentForAttendance, EnrollmentsBySectionResponse, UseSectionStudentsReturn } from './useSectionStudents';


