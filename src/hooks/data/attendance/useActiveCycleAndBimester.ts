/**
 * Hook para obtener ciclo y bimestre activos
 * Usa attendance.service para traer ciclo y bimestre activos
 */

'use client';

import { useState, useEffect } from 'react';
import { getActiveCycle, getActiveBimester } from '@/services/attendance.service';

export interface ActiveCycleData {
  id: number;
  name: string;
  [key: string]: unknown;
}

export interface ActiveBimesterData {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface UseActiveCycleAndBimesterReturn {
  activeCycle: ActiveCycleData | null;
  activeBimester: ActiveBimesterData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener ciclo y bimestre activos
 */
export const useActiveCycleAndBimester = (): UseActiveCycleAndBimesterReturn => {
  const [activeCycle, setActiveCycle] = useState<ActiveCycleData | null>(null);
  const [activeBimester, setActiveBimester] = useState<ActiveBimesterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [cycleData, bimesterData] = await Promise.all([
        getActiveCycle(),
        getActiveBimester(),
      ]);

      if (cycleData && cycleData.id) {
        setActiveCycle(cycleData as ActiveCycleData);
      }

      if (bimesterData && bimesterData.id) {
        setActiveBimester(bimesterData as ActiveBimesterData);
      }
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err 
        ? String((err as Record<string, unknown>).message)
        : 'Error al obtener ciclo y bimestre activos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveData();
  }, []);

  return {
    activeCycle,
    activeBimester,
    loading,
    error,
    refetch: fetchActiveData,
  };
};

export default useActiveCycleAndBimester;
