/**
 * =========================
 * ATTENDANCE VALIDATION SERVICES
 * =========================
 * 
 * Servicios para las validaciones de ciclo, bimestre, academic week y ausencia
 * Se conectan a los endpoints del backend
 */

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/config/api';

// ============================================================================
// TIPOS
// ============================================================================

export interface SchoolCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  canEnroll: boolean;
}

export interface Bimester {
  id: number;
  cycleId: number;
  name: string;
  order: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AcademicWeek {
  id: number;
  bimesterId: number;
  startDate: string;
  endDate: string;
  weekType: 'REGULAR' | 'EVALUATION' | 'REVIEW' | 'BREAK';
  weekNumber: number;
}

export interface TeacherAbsence {
  id: number;
  teacherId: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  reason: string;
}

// ============================================================================
// SCHOOL CYCLE HOOK
// ============================================================================

export function useSchoolCycles() {
  const { data: cycles = [], isLoading, error, refetch } = useQuery({
    queryKey: ['schoolCycles'],
    queryFn: async () => {
      const response = await api.get('/school-cycles');
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  const getActiveCycle = useCallback(() => {
    return cycles.find((c: SchoolCycle) => c.isActive && !c.isArchived);
  }, [cycles]);

  const getCycleForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return cycles.find(
      (c: SchoolCycle) => c.startDate <= dateStr && dateStr <= c.endDate && !c.isArchived
    );
  }, [cycles]);

  return {
    cycles,
    isLoading,
    error,
    refetch,
    getActiveCycle,
    getCycleForDate,
  };
}

// ============================================================================
// BIMESTER HOOK
// ============================================================================

export function useBimesters(cycleId?: number) {
  const { data: bimesters = [], isLoading, error, refetch } = useQuery({
    queryKey: ['bimesters', cycleId],
    queryFn: async () => {
      const url = cycleId 
        ? `/bimesters?cycleId=${cycleId}`
        : '/bimesters';
      const response = await api.get(url);
      return response.data;
    },
    enabled: !!cycleId,
    staleTime: 1000 * 60 * 60,
  });

  const getActiveBimester = useCallback(() => {
    return bimesters.find((b: Bimester) => b.isActive);
  }, [bimesters]);

  const getBimesterForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bimesters.find(
      (b: Bimester) => b.startDate <= dateStr && dateStr <= b.endDate && b.isActive
    );
  }, [bimesters]);

  return {
    bimesters,
    isLoading,
    error,
    refetch,
    getActiveBimester,
    getBimesterForDate,
  };
}

// ============================================================================
// ACADEMIC WEEK HOOK
// ============================================================================

export function useAcademicWeeks(bimesterId?: number) {
  const { data: weeks = [], isLoading, error, refetch } = useQuery({
    queryKey: ['academicWeeks', bimesterId],
    queryFn: async () => {
      const url = bimesterId
        ? `/academic-weeks?bimesterId=${bimesterId}`
        : '/academic-weeks';
      const response = await api.get(url);
      return response.data;
    },
    enabled: !!bimesterId,
    staleTime: 1000 * 60 * 60,
  });

  const getWeekForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return weeks.find(
      (w: AcademicWeek) => w.startDate <= dateStr && dateStr <= w.endDate
    );
  }, [weeks]);

  const isBreakWeek = useCallback((date: Date): boolean => {
    const week = getWeekForDate(date);
    return week?.weekType === 'BREAK';
  }, [getWeekForDate]);

  return {
    weeks,
    isLoading,
    error,
    refetch,
    getWeekForDate,
    isBreakWeek,
  };
}

// ============================================================================
// TEACHER ABSENCE HOOK
// ============================================================================

export function useTeacherAbsences(teacherId?: number) {
  const { data: absences = [], isLoading, error, refetch } = useQuery({
    queryKey: ['teacherAbsences', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      const response = await api.get(`/teachers/${teacherId}/absences`);
      return response.data;
    },
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  const hasActiveAbsence = useCallback((date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return absences.some(
      (a: TeacherAbsence) =>
        a.startDate <= dateStr &&
        dateStr <= a.endDate &&
        (a.status === 'approved' || a.status === 'active')
    );
  }, [absences]);

  const getAbsenceForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return absences.find(
      (a: TeacherAbsence) =>
        a.startDate <= dateStr &&
        dateStr <= a.endDate &&
        (a.status === 'approved' || a.status === 'active')
    );
  }, [absences]);

  return {
    absences,
    isLoading,
    error,
    refetch,
    hasActiveAbsence,
    getAbsenceForDate,
  };
}

// ============================================================================
// COMPOSITE HOOK: ALL VALIDATION DATA
// ============================================================================

export function useAttendanceValidationData(
  cycleId?: number,
  bimesterId?: number,
  teacherId?: number
) {
  const schoolCycles = useSchoolCycles();
  const bimesters = useBimesters(cycleId);
  const academicWeeks = useAcademicWeeks(bimesterId);
  const teacherAbsences = useTeacherAbsences(teacherId);

  const isLoading = 
    schoolCycles.isLoading || 
    bimesters.isLoading || 
    academicWeeks.isLoading || 
    teacherAbsences.isLoading;

  return {
    schoolCycles,
    bimesters,
    academicWeeks,
    teacherAbsences,
    isLoading,
  };
}
