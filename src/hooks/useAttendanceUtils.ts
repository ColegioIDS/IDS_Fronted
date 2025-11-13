/**
 * =========================
 * ATTENDANCE UTILITIES HOOK
 * =========================
 * 
 * Hook with utility functions for common attendance operations
 * Date calculations, validation, formatting
 */

import { useCallback, useMemo } from 'react';
import { AttendanceStatusCode, AttendanceReportStatus } from '@/types/attendance.types';

// ============================================================================
// DATE UTILITIES
// ============================================================================

interface UseAttendanceDateUtilsOptions {
  today?: Date;
}

/**
 * Hook with date utility functions for attendance
 */
export function useAttendanceDateUtils({ today = new Date() }: UseAttendanceDateUtilsOptions = {}) {
  // Format date to ISO string (YYYY-MM-DD)
  const formatDateISO = useCallback((date: Date): string => {
    return date.toISOString().split('T')[0];
  }, []);

  // Parse ISO date string
  const parseISO = useCallback((dateStr: string): Date => {
    return new Date(dateStr + 'T00:00:00Z');
  }, []);

  // Check if date is today
  const isToday = useCallback((dateStr: string): boolean => {
    return formatDateISO(today) === dateStr;
  }, [today, formatDateISO]);

  // Check if date is in past
  const isPast = useCallback((dateStr: string): boolean => {
    return parseISO(dateStr) < today;
  }, [today, parseISO]);

  // Check if date is in future
  const isFuture = useCallback((dateStr: string): boolean => {
    return parseISO(dateStr) > today;
  }, [today, parseISO]);

  // Check if date is within range
  const isWithinRange = useCallback(
    (dateStr: string, startStr: string, endStr: string): boolean => {
      const date = parseISO(dateStr);
      const start = parseISO(startStr);
      const end = parseISO(endStr);
      return date >= start && date <= end;
    },
    [parseISO]
  );

  // Get date range (last N days)
  const getLastNDays = useCallback(
    (n: number): string[] => {
      const dates: string[] = [];
      for (let i = n - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(formatDateISO(date));
      }
      return dates;
    },
    [today, formatDateISO]
  );

  // Get this month date range
  const getMonthRange = useCallback((): [string, string] => {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return [formatDateISO(start), formatDateISO(end)];
  }, [today, formatDateISO]);

  return {
    formatDateISO,
    parseISO,
    isToday,
    isPast,
    isFuture,
    isWithinRange,
    getLastNDays,
    getMonthRange,
    today: formatDateISO(today),
  };
}

// ============================================================================
// STATUS UTILITIES
// ============================================================================

/**
 * Hook with status utility functions
 */
export function useAttendanceStatusUtils() {
  // Check if status is negative (absent, tardy)
  const isNegativeStatus = useCallback((code: AttendanceStatusCode): boolean => {
    return ['I', 'IJ', 'T', 'TJ', 'A', 'M'].includes(code);
  }, []);

  // Check if status requires justification
  const requiresJustification = useCallback((code: AttendanceStatusCode): boolean => {
    return ['I', 'IJ', 'T', 'TJ', 'A'].includes(code);
  }, []);

  // Get status description
  const getStatusDescription = useCallback((code: AttendanceStatusCode): string => {
    const descriptions: Record<AttendanceStatusCode, string> = {
      P: 'Present',
      I: 'Absent',
      IJ: 'Absent (Justified)',
      T: 'Late',
      TJ: 'Late (Justified)',
      E: 'Excused',
      M: 'Medical',
      A: 'Absence',
    };
    return descriptions[code] || code;
  }, []);

  // Get status color
  const getStatusColor = useCallback((code: AttendanceStatusCode): string => {
    const colors: Record<AttendanceStatusCode, string> = {
      P: 'bg-green-100 text-green-800',
      I: 'bg-red-100 text-red-800',
      IJ: 'bg-orange-100 text-orange-800',
      T: 'bg-yellow-100 text-yellow-800',
      TJ: 'bg-yellow-100 text-yellow-800',
      E: 'bg-blue-100 text-blue-800',
      M: 'bg-purple-100 text-purple-800',
      A: 'bg-red-100 text-red-800',
    };
    return colors[code] || 'bg-gray-100 text-gray-800';
  }, []);

  return {
    isNegativeStatus,
    requiresJustification,
    getStatusDescription,
    getStatusColor,
  };
}

// ============================================================================
// STATISTICS UTILITIES
// ============================================================================

interface AttendanceRecord {
  attendanceStatusId: number;
  hasJustification?: boolean;
}

interface StatusCount {
  [key: string]: number;
}

/**
 * Hook with statistics calculation functions
 */
export function useAttendanceStatsUtils() {
  // Calculate attendance percentage
  const calculatePercentage = useCallback(
    (totalDays: number, presentDays: number): number => {
      if (totalDays === 0) return 0;
      return Math.round((presentDays / totalDays) * 100);
    },
    []
  );

  // Get attendance risk level
  const getRiskLevel = useCallback(
    (percentage: number): AttendanceReportStatus => {
      if (percentage >= 90) return 'excellent';
      if (percentage >= 75) return 'good';
      if (percentage >= 60) return 'fair';
      return 'poor';
    },
    []
  );

  // Determine if at risk
  const isAtRisk = useCallback((percentage: number): boolean => {
    return percentage < 75;
  }, []);

  // Count status occurrences
  const countStatuses = useCallback((records: AttendanceRecord[]): StatusCount => {
    return records.reduce(
      (acc, record) => {
        const statusId = record.attendanceStatusId.toString();
        acc[statusId] = (acc[statusId] || 0) + 1;
        return acc;
      },
      {} as StatusCount
    );
  }, []);

  return {
    calculatePercentage,
    getRiskLevel,
    isAtRisk,
    countStatuses,
  };
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Hook with validation functions
 */
export function useAttendanceValidation() {
  // Validate time format HH:MM
  const isValidTimeFormat = useCallback((time: string): boolean => {
    return /^\d{2}:\d{2}$/.test(time);
  }, []);

  // Validate ISO date format YYYY-MM-DD
  const isValidDateFormat = useCallback((date: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(new Date(date).getTime());
  }, []);

  // Validate time is in valid range (not future)
  const isValidTime = useCallback((time: string, date: string): boolean => {
    if (!isValidTimeFormat(time) || !isValidDateFormat(date)) return false;
    const [hours, minutes] = time.split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return false;
    const recordDateTime = new Date(date + 'T' + time);
    return recordDateTime <= new Date();
  }, [isValidTimeFormat, isValidDateFormat]);

  // Validate change reason length
  const isValidChangeReason = useCallback((reason: string): boolean => {
    return reason.length >= 5 && reason.length <= 500;
  }, []);

  // Validate notes length
  const isValidNotes = useCallback((notes: string): boolean => {
    return notes.length >= 0 && notes.length <= 500;
  }, []);

  return {
    isValidTimeFormat,
    isValidDateFormat,
    isValidTime,
    isValidChangeReason,
    isValidNotes,
  };
}

// ============================================================================
// MAIN COMPOSITE HOOK
// ============================================================================

/**
 * Main hook combining all utility functions
 */
export function useAttendanceUtils() {
  const dateUtils = useAttendanceDateUtils();
  const statusUtils = useAttendanceStatusUtils();
  const statsUtils = useAttendanceStatsUtils();
  const validation = useAttendanceValidation();

  return useMemo(
    () => ({
      ...dateUtils,
      ...statusUtils,
      ...statsUtils,
      ...validation,
    }),
    [dateUtils, statusUtils, statsUtils, validation]
  );
}


// Standalone utility functions

export function formatDateISO(date: Date | string): string {
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
}

export function parseISO(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z');
}

export function isToday(date: Date | string): boolean {
  const dateISO = formatDateISO(date);
  const todayISO = formatDateISO(new Date());
  return dateISO === todayISO;
}

export function isPast(date: Date | string): boolean {
  const dateISO = formatDateISO(date);
  const todayISO = formatDateISO(new Date());
  return dateISO < todayISO;
}

export function isFuture(date: Date | string): boolean {
  const dateISO = formatDateISO(date);
  const todayISO = formatDateISO(new Date());
  return dateISO > todayISO;
}
