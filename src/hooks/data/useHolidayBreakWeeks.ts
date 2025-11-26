// src/hooks/data/useHolidayBreakWeeks.ts

import { useState, useEffect } from 'react';
import { holidaysService } from '@/services/holidays.service';
import { BreakWeek } from '@/types/holidays.types';

/**
 * 🌴 Hook para obtener semanas de tipo BREAK de un ciclo
 * 
 * Uso:
 * ```tsx
 * const { breakWeeks, isLoading, error, isDateInBreak } = useHolidayBreakWeeks(cycleId, bimesterId);
 * ```
 * 
 * @param cycleId - ID del ciclo escolar (requerido)
 * @param bimesterId - ID del bimestre (opcional, para filtrar)
 */
export function useHolidayBreakWeeks(cycleId: number | undefined, bimesterId?: number) {
  const [breakWeeks, setBreakWeeks] = useState<BreakWeek[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cycleId) {
      setBreakWeeks([]);
      return;
    }

    const loadBreakWeeks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await holidaysService.getBreakWeeks(cycleId, bimesterId);
        // Asegurar que siempre sea un array
        setBreakWeeks(Array.isArray(data) ? data : []);
      } catch (err: any) {
        const errorMessage = err.message || 'Error al cargar semanas de receso';
        setError(errorMessage);
        console.error('Error loading break weeks:', err);
        setBreakWeeks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBreakWeeks();
  }, [cycleId, bimesterId]);

  // Helper para validar si una fecha está en un BREAK
  const isDateInBreak = (date: string): boolean => {
    if (!Array.isArray(breakWeeks) || breakWeeks.length === 0) return false;
    return holidaysService.isDateInBreakWeek(date, breakWeeks);
  };

  return { 
    breakWeeks: Array.isArray(breakWeeks) ? breakWeeks : [], 
    isLoading, 
    error, 
    isDateInBreak 
  };
}

export default useHolidayBreakWeeks;
