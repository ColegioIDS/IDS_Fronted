// src/hooks/data/useHolidayBimesters.ts

import { useState, useEffect } from 'react';
import { holidaysService } from '@/services/holidays.service';
import { BimesterForHoliday } from '@/types/holidays.types';

/**
 * 📚 Hook para obtener bimestres de un ciclo escolar para holidays
 * 
 * Uso:
 * ```tsx
 * const { bimesters, isLoading, error } = useHolidayBimesters(cycleId);
 * ```
 */
export function useHolidayBimesters(cycleId: number | undefined) {
  const [bimesters, setBimesters] = useState<BimesterForHoliday[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cycleId) {
      setBimesters([]);
      return;
    }

    const loadBimesters = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await holidaysService.getBimestersByCycle(cycleId);
        // Asegurar que siempre sea un array
        setBimesters(Array.isArray(data) ? data : []);
      } catch (err: any) {
        const errorMessage = err.message || 'Error al cargar bimestres';
        setError(errorMessage);
        console.error('Error loading bimesters:', err);
        setBimesters([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBimesters();
  }, [cycleId]);

  return { 
    bimesters: Array.isArray(bimesters) ? bimesters : [], 
    isLoading, 
    error 
  };
}

export default useHolidayBimesters;
