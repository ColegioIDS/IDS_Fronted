// hooks/useAcademicWeekCycles.ts

import { useState, useEffect } from 'react';
import { academicWeekService } from '@/services/academic-week.service';
import { CycleForAcademicWeek } from '@/types/academic-week.types';

interface UseAcademicWeekCyclesReturn {
  cycles: CycleForAcademicWeek[];
  activeCycle: CycleForAcademicWeek | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAcademicWeekCycles(): UseAcademicWeekCyclesReturn {
  const [cycles, setCycles] = useState<CycleForAcademicWeek[]>([]);
  const [activeCycle, setActiveCycle] = useState<CycleForAcademicWeek | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableCycles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await academicWeekService.getAvailableCycles({});
      setCycles(response.data);

      // Auto-seleccionar ciclo activo
      const active = response.data.find((cycle) => cycle.isActive);
      if (active) {
        setActiveCycle(active);
      }
    } catch (err: any) {
      console.error('Error al cargar ciclos:', err);
      setError(err.message || 'Error al cargar los ciclos');
      setCycles([]);
      setActiveCycle(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableCycles();
  }, []);

  return {
    cycles,
    activeCycle,
    isLoading,
    error,
    refresh: loadAvailableCycles,
  };
}
