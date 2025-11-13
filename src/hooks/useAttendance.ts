/**
 * =========================
 * ATTENDANCE HOOKS - Core Hook
 * =========================
 * 
 * Main hook for attendance operations with React Query
 * Handles queries and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  registerAttendance,
  updateAttendance,
  bulkUpdateAttendance,
  bulkApplyStatus,
  bulkDeleteAttendance,
  getAttendanceHistory,
  getAttendanceReport,
  getSectionAttendanceStats,
  formatAttendanceError,
} from '@/services/attendance.service';
import {
  CreateAttendancePayload,
  BulkCreateAttendancePayload,
  UpdateAttendancePayload,
  BulkUpdateAttendancePayload,
  BulkApplyStatusPayload,
  BulkDeleteAttendancePayload,
  AttendanceQueryWithScope,
} from '@/types/attendance.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const attendanceKeys = {
  all: ['attendance'] as const,
  histories: () => [...attendanceKeys.all, 'histories'] as const,
  history: (enrollmentId: number) => [...attendanceKeys.histories(), enrollmentId] as const,
  reports: () => [...attendanceKeys.all, 'reports'] as const,
  report: (enrollmentId: number) => [...attendanceKeys.reports(), enrollmentId] as const,
  stats: () => [...attendanceKeys.all, 'stats'] as const,
  sectionStats: (sectionId: number) => [...attendanceKeys.stats(), sectionId] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

export function useAttendanceHistory(
  enrollmentId: number,
  params?: AttendanceQueryWithScope
) {
  return useQuery({
    queryKey: attendanceKeys.history(enrollmentId),
    queryFn: () => getAttendanceHistory(enrollmentId, params),
    enabled: !!enrollmentId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useAttendanceReport(
  enrollmentId: number,
  {
    dateFrom,
    dateTo,
    bimesterId,
  }: { dateFrom?: string; dateTo?: string; bimesterId?: number } = {}
) {
  return useQuery({
    queryKey: attendanceKeys.report(enrollmentId),
    queryFn: () =>
      getAttendanceReport(enrollmentId, {
        dateFrom,
        dateTo,
        bimesterId,
      }),
    enabled: !!enrollmentId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useSectionAttendanceStats(
  sectionId: number,
  params?: AttendanceQueryWithScope
) {
  return useQuery({
    queryKey: attendanceKeys.sectionStats(sectionId),
    queryFn: () => getSectionAttendanceStats(sectionId, params),
    enabled: !!sectionId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAttendancePayload | BulkCreateAttendancePayload) =>
      registerAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (error) => {
      console.error('Create attendance error:', formatAttendanceError(error));
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAttendancePayload }) =>
      updateAttendance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (error) => {
      console.error('Update attendance error:', formatAttendanceError(error));
    },
  });
}

export function useBulkUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkUpdateAttendancePayload) => bulkUpdateAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (error) => {
      console.error('Bulk update error:', formatAttendanceError(error));
    },
  });
}

export function useBulkApplyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkApplyStatusPayload) => bulkApplyStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (error) => {
      console.error('Apply status error:', formatAttendanceError(error));
    },
  });
}

export function useBulkDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkDeleteAttendancePayload) => bulkDeleteAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (error) => {
      console.error('Delete attendance error:', formatAttendanceError(error));
    },
  });
}

// ============================================================================
// COMPOSITE HOOK
// ============================================================================

export function useAttendance(enrollmentId: number) {
  const historyQuery = useAttendanceHistory(enrollmentId);
  const reportQuery = useAttendanceReport(enrollmentId);
  const createMutation = useCreateAttendance();
  const updateMutation = useUpdateAttendance();
  const bulkUpdateMutation = useBulkUpdateAttendance();
  const deleteMutation = useBulkDeleteAttendance();
  const applyStatusMutation = useBulkApplyStatus();

  return {
    history: historyQuery.data,
    historyLoading: historyQuery.isLoading,
    historyError: historyQuery.error,
    report: reportQuery.data,
    reportLoading: reportQuery.isLoading,
    reportError: reportQuery.error,
    createAttendance: createMutation.mutate,
    createLoading: createMutation.isPending,
    updateAttendance: updateMutation.mutate,
    updateLoading: updateMutation.isPending,
    bulkUpdate: bulkUpdateMutation.mutate,
    bulkUpdateLoading: bulkUpdateMutation.isPending,
    bulkDelete: deleteMutation.mutate,
    bulkDeleteLoading: deleteMutation.isPending,
    applyStatus: applyStatusMutation.mutate,
    applyStatusLoading: applyStatusMutation.isPending,
    isLoading:
      historyQuery.isLoading || reportQuery.isLoading || createMutation.isPending || updateMutation.isPending,
  };
}
