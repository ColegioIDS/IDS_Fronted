// src/hooks/data/useHolidayCycles.ts

import { useState, useEffect } from 'react';
import { holidaysService } from '@/services/holidays.service';
import { CycleForHoliday } from '@/types/holidays.types';

/**
 * 🔄 Hook para obtener ciclos escolares disponibles para holidays
 * 
 * Uso:
 * ```tsx
 * const { cycles, isLoading, error } = useHolidayCycles();
 * ```
 */
export function useHolidayCycles() {
  const [cycles, setCycles] = useState<CycleForHoliday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCycles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await holidaysService.getAvailableCycles();
        // Asegurar que siempre sea un array
        setCycles(Array.isArray(data) ? data : []);
      } catch (err: any) {
        const errorMessage = err.message || 'Error al cargar ciclos escolares';
        setError(errorMessage);
        setCycles([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCycles();
  }, []);

  return { 
    cycles: Array.isArray(cycles) ? cycles : [], 
    isLoading, 
    error 
  };
}

export default useHolidayCycles;
