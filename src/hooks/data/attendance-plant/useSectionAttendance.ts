'use client';

/**
 * Hook para obtener asistencia de una sección
 */

import { useEffect, useState, useCallback } from 'react';
import { getSectionAttendance } from '@/services/attendance-plant.service';
import type { SectionAttendanceResponse } from '@/types/attendance-plant.types';

interface UseSectionAttendanceState {
  data: SectionAttendanceResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useSectionAttendance(params: {
  date: string;
  cycleId: number;
  bimesterId: number;
  gradeId: number;
  sectionId: number;
}) {
  const [state, setState] = useState<UseSectionAttendanceState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const loadAttendance = useCallback(async () => {
    try {
      console.log('[useSectionAttendance] Loading with params:', params);
      setState({ data: null, isLoading: true, error: null });
      const response = await getSectionAttendance(params);
      console.log('[useSectionAttendance] Success:', response);
      setState({ data: response, isLoading: false, error: null });
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al obtener asistencia';
      console.error('[useSectionAttendance] Error:', errorMessage);
      setState({ data: null, isLoading: false, error: errorMessage });
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  return {
    ...state,
    refetch: loadAttendance,
  };
}
