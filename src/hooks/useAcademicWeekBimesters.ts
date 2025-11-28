// hooks/useAcademicWeekBimesters.ts

import { useState, useEffect } from 'react';
import { academicWeekService } from '@/services/academic-week.service';
import { BimesterForAcademicWeek } from '@/types/academic-week.types';

interface UseAcademicWeekBimestersParams {
  cycleId: number | null;
}

interface UseAcademicWeekBimestersReturn {
  bimesters: BimesterForAcademicWeek[];
  activeBimester: BimesterForAcademicWeek | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAcademicWeekBimesters({
  cycleId,
}: UseAcademicWeekBimestersParams): UseAcademicWeekBimestersReturn {
  const [bimesters, setBimesters] = useState<BimesterForAcademicWeek[]>([]);
  const [activeBimester, setActiveBimester] = useState<BimesterForAcademicWeek | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableBimesters = async () => {
    if (!cycleId) {
      setBimesters([]);
      setActiveBimester(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await academicWeekService.getAvailableBimesters({
        cycleId,
      });
      setBimesters(response.data);

      // Auto-seleccionar bimestre activo
      const active = response.data.find((bimester) => bimester.isActive);
      if (active) {
        setActiveBimester(active);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los bimestres');
      setBimesters([]);
      setActiveBimester(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableBimesters();
  }, [cycleId]);

  return {
    bimesters,
    activeBimester,
    isLoading,
    error,
    refresh: loadAvailableBimesters,
  };
}
