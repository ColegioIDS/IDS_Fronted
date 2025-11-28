// src/hooks/data/useAcademicWeekBimesters.ts

import { useState, useEffect, useCallback } from 'react';
import { academicWeekService } from '@/services/academic-week.service';
import {
  BimesterForAcademicWeek,
  QueryBimestersDto,
} from '@/types/academic-week.types';

/**
 * 🎓 Hook para gestionar bimestres (helpers de academic weeks)
 * 
 * IMPORTANTE: Usa /api/academic-weeks/helpers/bimesters
 * Solo requiere academic-week:read
 * 
 * Uso:
 * ```tsx
 * const { bimesters, activeBimester, isLoading } = useAcademicWeekBimesters({ 
 *   cycleId: 1 
 * });
 * ```
 */
export function useAcademicWeekBimesters(initialQuery: QueryBimestersDto = {}) {
  const [bimesters, setBimesters] = useState<BimesterForAcademicWeek[]>([]);
  const [activeBimester, setActiveBimester] = useState<BimesterForAcademicWeek | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QueryBimestersDto>(initialQuery);

  // Cargar bimestres disponibles
  const loadAvailableBimesters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Si no hay cycleId, no hacer request
      if (!query.cycleId) {
        setBimesters([]);
        setActiveBimester(null);
        setIsLoading(false);
        return;
      }

      const result = await academicWeekService.getAvailableBimesters(query);
      setBimesters(result.data);

      // Auto-seleccionar el bimestre activo si existe
      const active = result.data.find((bimester) => bimester.isActive);
      if (active) {
        setActiveBimester(active);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar bimestres disponibles');
      setBimesters([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  // Efecto inicial
  useEffect(() => {
    loadAvailableBimesters();
  }, [loadAvailableBimesters]);

  // Actualizar query
  const updateQuery = useCallback((newQuery: Partial<QueryBimestersDto>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

  // Refrescar datos
  const refresh = useCallback(() => loadAvailableBimesters(), [loadAvailableBimesters]);

  return {
    bimesters,
    activeBimester,
    isLoading,
    error,
    query,
    updateQuery,
    refresh,
  };
}

export default useAcademicWeekBimesters;
