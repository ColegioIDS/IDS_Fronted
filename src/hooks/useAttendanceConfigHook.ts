/**
 * =========================
 * ATTENDANCE CONFIG HOOK
 * =========================
 * 
 * Hook for loading and managing attendance configuration
 * Handles statuses, grades, sections, holidays
 */

import { useQuery } from '@tanstack/react-query';
import {
  getAttendanceStatuses,
  getGradesAndSections,
  getHolidays,
  getAttendanceConfig,
} from '@/services/attendance.service';
import {
  AttendanceStatusInfo,
  Grade,
  Section,
  Holiday,
} from '@/types/attendance.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const configKeys = {
  all: ['attendance-config'] as const,
  statuses: () => [...configKeys.all, 'statuses'] as const,
  gradesAndSections: () => [...configKeys.all, 'grades-sections'] as const,
  holidays: () => [...configKeys.all, 'holidays'] as const,
  complete: () => [...configKeys.all, 'complete'] as const,
};

// ============================================================================
// INDIVIDUAL CONFIG HOOKS
// ============================================================================

/**
 * Hook to get attendance statuses
 * Note: Now requires roleId - uses mock value for now
 * TODO: Get roleId from auth context
 */
export function useAttendanceStatuses(roleId?: number) {
  return useQuery({
    queryKey: [...configKeys.statuses(), roleId] as const,
    queryFn: () => getAttendanceStatuses(roleId || 1), // Default roleId = 1 (temporary)
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!roleId || true, // Enable by default with fallback roleId
  });
}

/**
 * Hook to get grades and sections
 * Note: schoolCycleId parameter is ignored - uses active cycle automatically
 */
export function useGradesAndSections(_schoolCycleId?: number) {
  return useQuery({
    queryKey: configKeys.gradesAndSections(),
    queryFn: () => getGradesAndSections(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Hook to get holidays
 * Note: Backend only has validation endpoint, returns empty array
 */
export function useHolidays(bimesterId?: number) {
  return useQuery({
    queryKey: [...configKeys.holidays(), bimesterId] as const,
    queryFn: () => getHolidays(bimesterId),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Hook to get complete configuration
 * Note: schoolCycleId parameter is ignored - uses active config automatically
 */
export function useAttendanceConfiguration(_schoolCycleId?: number) {
  return useQuery({
    queryKey: configKeys.complete(),
    queryFn: () => getAttendanceConfig(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

// ============================================================================
// COMPOSITE HOOK
// ============================================================================

interface UseAttendanceConfigOptions {
  schoolCycleId?: number;
  bimesterId?: number;
  enabled?: boolean;
}

/**
 * Hook combining all configuration queries
 * Loads statuses, grades, sections, holidays
 */
export function useAttendanceConfig({
  schoolCycleId,
  bimesterId,
  enabled = true,
}: UseAttendanceConfigOptions = {}) {
  const statusesQuery = useAttendanceStatuses();
  const gradesAndSectionsQuery = useGradesAndSections(schoolCycleId);
  const holidaysQuery = useHolidays(bimesterId);

  const isLoading = statusesQuery.isLoading || gradesAndSectionsQuery.isLoading || holidaysQuery.isLoading;
  const error = statusesQuery.error || gradesAndSectionsQuery.error || holidaysQuery.error;

  return {
    // Individual queries
    statuses: statusesQuery.data?.data?.attendanceStatuses || [],
    grades: gradesAndSectionsQuery.data?.data?.grades || [],
    sections: gradesAndSectionsQuery.data?.data?.sections || [],
    holidays: holidaysQuery.data?.data || [],

    // Loading states
    isLoading,
    statusesLoading: statusesQuery.isLoading,
    gradesAndSectionsLoading: gradesAndSectionsQuery.isLoading,
    holidaysLoading: holidaysQuery.isLoading,

    // Error states
    error,
    statusesError: statusesQuery.error,
    gradesAndSectionsError: gradesAndSectionsQuery.error,
    holidaysError: holidaysQuery.error,

    // Utilities
    getStatusById: (id: number) => {
      const data = statusesQuery.data?.data?.attendanceStatuses;
      return data?.find((s: AttendanceStatusInfo) => s.id === id);
    },

    getStatusByCode: (code: string) => {
      const data = statusesQuery.data?.data?.attendanceStatuses;
      return data?.find((s: AttendanceStatusInfo) => s.code === code);
    },

    getGradeById: (id: number) => {
      const data = gradesAndSectionsQuery.data?.data?.grades;
      return data?.find((g: Grade) => g.id === id);
    },

    getSectionById: (id: number) => {
      const data = gradesAndSectionsQuery.data?.data?.sections;
      return data?.find((s: Section) => s.id === id);
    },

    getSectionsByGradeId: (gradeId: number) => {
      const data = gradesAndSectionsQuery.data?.data?.sections;
      return data?.filter((s: Section) => s.gradeId === gradeId) || [];
    },

    isHoliday: (date: string) => {
      return holidaysQuery.data?.data?.some((h: Holiday) => h.date === date) || false;
    },

    getHolidayByDate: (date: string) => {
      const data = holidaysQuery.data?.data;
      return data?.find((h: Holiday) => h.date === date);
    },
  };
}

// ============================================================================
// SPECIFIC CONFIG HOOKS
// ============================================================================

/**
 * Hook to get only statuses
 * More efficient if you only need statuses
 */
export function useStatusesOnly() {
  return useAttendanceStatuses();
}

/**
 * Hook to get only grades and sections
 * Useful for selectors
 * Note: schoolCycleId parameter is ignored - uses active cycle automatically
 */
export function useGradesAndSectionsOnly(_schoolCycleId?: number) {
  return useGradesAndSections();
}

/**
 * Hook to get only holidays
 * Useful for date calculations
 */
export function useHolidaysOnly(bimesterId?: number) {
  return useHolidays(bimesterId);
}
