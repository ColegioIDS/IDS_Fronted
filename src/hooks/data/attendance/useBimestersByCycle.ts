/**
 * Hook para obtener bimestre activo
 * Nota: El backend de attendance NO tiene endpoint para obtener bimestres de un ciclo específico
 * Solo tiene getActiveBimester(), por lo que este hook siempre retorna el bimestre activo actual
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getActiveBimester } from '@/services/attendance.service';

export interface BimesterData {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
}

interface UseBimestersByCycleReturn {
  bimesters: BimesterData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener bimestre activo
 * (El parámetro cycleId es ignorado - siempre obtiene el bimestre activo)
 */
export const useBimestersByCycle = (): UseBimestersByCycleReturn => {
  const [bimesters, setBimesters] = useState<BimesterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBimesters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener bimestre activo desde attendance service
      const data = await getActiveBimester();
      
      if (data && data.id) {
        const bimesterItem: BimesterData = {
          id: Number(data.id),
          name: String(data.name || ''),
          startDate: data.startDate ? String(data.startDate) : undefined,
          endDate: data.endDate ? String(data.endDate) : undefined,
        };
        console.log('[useBimestersByCycle] Bimestre cargado:', bimesterItem);
        setBimesters([bimesterItem]);
      } else {
        console.log('[useBimestersByCycle] No hay data o id:', data);
        setBimesters([]);
      }
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as Record<string, unknown>).message)
        : 'Error al obtener bimestre activo';
      setError(errorMessage);
      console.error('[useBimestersByCycle] Error:', errorMessage);
      setBimesters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBimesters();
  }, [fetchBimesters]);

  return {
    bimesters,
    loading,
    error,
    refetch: fetchBimesters,
  };
};

export default useBimestersByCycle;
