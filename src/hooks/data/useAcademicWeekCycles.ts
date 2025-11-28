// src/hooks/data/useAcademicWeekCycles.ts

import { useState, useEffect, useCallback } from 'react';
import { academicWeekService } from '@/services/academic-week.service';
import {
  CycleForAcademicWeek,
  QueryCyclesDto,
} from '@/types/academic-week.types';

/**
 * 🎓 Hook para gestionar ciclos escolares (helpers de academic weeks)
 * 
 * IMPORTANTE: Usa /api/academic-weeks/helpers/cycles
 * Solo requiere academic-week:read
 * 
 * Uso:
 * ```tsx
 * const { cycles, activeCycle, isLoading } = useAcademicWeekCycles();
 * ```
 */
export function useAcademicWeekCycles(initialQuery: QueryCyclesDto = {}) {
  const [cycles, setCycles] = useState<CycleForAcademicWeek[]>([]);
  const [activeCycle, setActiveCycle] = useState<CycleForAcademicWeek | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QueryCyclesDto>(initialQuery);

  // Cargar ciclos disponibles (NO archivados por defecto)
  const loadAvailableCycles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await academicWeekService.getAvailableCycles(query);
      setCycles(result.data);

      // Auto-seleccionar el ciclo activo si existe
      const active = result.data.find((cycle) => cycle.isActive);
      if (active) {
        setActiveCycle(active);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar ciclos disponibles');
      setCycles([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  // Efecto inicial
  useEffect(() => {
    loadAvailableCycles();
  }, [loadAvailableCycles]);

  // Actualizar query
  const updateQuery = useCallback((newQuery: Partial<QueryCyclesDto>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

  // Refrescar datos
  const refresh = useCallback(() => loadAvailableCycles(), [loadAvailableCycles]);

  return {
    cycles,
    activeCycle,
    isLoading,
    error,
    query,
    updateQuery,
    refresh,
  };
}

export default useAcademicWeekCycles;
