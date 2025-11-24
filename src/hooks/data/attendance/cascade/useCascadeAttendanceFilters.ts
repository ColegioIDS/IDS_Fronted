'use client';

import { useState, useCallback } from 'react';

export interface CascadeAttendanceFilters {
  cycleId: number | null;
  bimesterId: number | null;
  gradeId: number | null;
  sectionId: number | null;
  weekId?: number | null;
}

export function useCascadeAttendanceFilters(
  initialFilters?: Partial<CascadeAttendanceFilters>
) {
  const [filters, setFilters] = useState<CascadeAttendanceFilters>({
    cycleId: initialFilters?.cycleId ?? null,
    bimesterId: initialFilters?.bimesterId ?? null,
    gradeId: initialFilters?.gradeId ?? null,
    sectionId: initialFilters?.sectionId ?? null,
    weekId: initialFilters?.weekId ?? null,
  });

  const setCycle = useCallback((cycleId: number | null) => {
    setFilters((prev) => ({
      ...prev,
      cycleId,
      bimesterId: null,
      gradeId: null,
      sectionId: null,
    }));
  }, []);

  const setBimester = useCallback((bimesterId: number | null) => {
    setFilters((prev) => ({
      ...prev,
      bimesterId,
      gradeId: null,
      sectionId: null,
    }));
  }, []);

  const setGrade = useCallback((gradeId: number | null) => {
    setFilters((prev) => ({
      ...prev,
      gradeId,
      sectionId: null,
    }));
  }, []);

  const setSection = useCallback((sectionId: number | null) => {
    console.log('🔄 [CascadeFilters] setSection called with:', sectionId);
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        sectionId,
      };
      console.log('🔄 [CascadeFilters] Filters updated to:', newFilters);
      return newFilters;
    });
  }, []);

  const setWeek = useCallback((weekId: number | null | undefined) => {
    setFilters((prev) => ({
      ...prev,
      weekId,
    }));
  }, []);

  const reset = useCallback(() => {
    setFilters({
      cycleId: null,
      bimesterId: null,
      gradeId: null,
      sectionId: null,
      weekId: null,
    });
  }, []);

  const isComplete = useCallback(() => {
    return !!(
      filters.cycleId &&
      filters.bimesterId &&
      filters.gradeId &&
      filters.sectionId
    );
  }, [filters]);

  const hasBasicSelection = useCallback(() => {
    return !!(filters.cycleId && filters.bimesterId);
  }, [filters]);

  return {
    filters,
    setCycle,
    setBimester,
    setGrade,
    setSection,
    setWeek,
    reset,
    isComplete,
    hasBasicSelection,
  };
}
