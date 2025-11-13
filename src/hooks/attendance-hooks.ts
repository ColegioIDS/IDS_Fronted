/**
 * =========================
 * ATTENDANCE HOOKS INDEX
 * =========================
 * 
 * Central export for all attendance hooks
 * Makes importing cleaner: import { useAttendance, useAttendanceConfig } from '@/hooks'
 */

// Main hooks
export {
  useAttendance,
  useAttendanceHistory,
  useAttendanceReport,
  useSectionAttendanceStats,
  useCreateAttendance,
  useUpdateAttendance,
  useBulkUpdateAttendance,
  useBulkApplyStatus,
  useBulkDeleteAttendance,
  attendanceKeys,
} from './useAttendance';

// Permission hooks
export {
  useAttendancePermissions,
  useAdminPermissions,
  useSecretaryPermissions,
  useTeacherPermissions,
  useViewerPermissions,
} from './useAttendancePermissions';

// Configuration hooks
export {
  useAttendanceConfig,
  useAttendanceStatuses,
  useGradesAndSections,
  useHolidays,
  useAttendanceConfiguration,
  useStatusesOnly,
  useGradesAndSectionsOnly,
  useHolidaysOnly,
  configKeys,
} from './useAttendanceConfigHook';

// Utility hooks
export {
  useAttendanceDateUtils,
  useAttendanceStatusUtils,
  useAttendanceStatsUtils,
  useAttendanceValidation,
  useAttendanceUtils,
} from './useAttendanceUtils';

// Re-export types for convenience
export type { AttendanceScope, UserAttendancePermissions } from '@/types/attendance.types';
