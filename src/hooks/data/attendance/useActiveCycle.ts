/**
 * ====================================================================
 * USE ACTIVE CYCLE - Hook para ciclo escolar activo
 * ====================================================================
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { ActiveCycleInfo, BimesterInfo } from '@/types/attendance-reports.types';
import { parseApiError, ApiErrorResponse } from '@/middleware/api-handler';

export interface UseActiveCycleReturn {
  cycle: ActiveCycleInfo | null;
  bimesters: BimesterInfo[];
  loading: boolean;
  error: ApiErrorResponse | null;
  loadCycle: () => Promise<void>;
  loadBimesters: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar ciclo escolar activo y sus bimestres
 */
export function useActiveCycle(): UseActiveCycleReturn {
  const [cycle, setCycle] = useState<ActiveCycleInfo | null>(null);
  const [bimesters, setBimesters] = useState<BimesterInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);

  const loadCycle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cycleData = await attendanceReportsService.getActiveCycle();
      setCycle(cycleData);
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBimesters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const bimestersData = await attendanceReportsService.getActiveCycleBimesters();
      setBimesters(bimestersData);
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await Promise.all([loadCycle(), loadBimesters()]);
  }, [loadCycle, loadBimesters]);

  // Cargar automáticamente al montar
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    cycle,
    bimesters,
    loading,
    error,
    loadCycle,
    loadBimesters,
    refetch,
  };
}
