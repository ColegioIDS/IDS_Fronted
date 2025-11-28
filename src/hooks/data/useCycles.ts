'use client';

import { useState, useEffect } from 'react';
import { enrollmentsService } from '@/services/enrollments.service';
import { CycleSummary } from '@/types/enrollments.types';

interface UseCyclesReturn {
  cycles: CycleSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener ciclos escolares disponibles para matrículas
 * 
 * Características:
 * - Obtiene ciclos con canEnroll=true e isArchived=false
 * - Maneja estados de carga y errores
 * - Permite refrescar manualmente
 * 
 * Uso:
 * ```tsx
 * const { cycles, loading, error } = useCycles();
 * 
 * if (loading) return <Spinner />;
 * if (error) return <Alert>{error}</Alert>;
 * 
 * return (
 *   <Select>
 *     {cycles.map(cycle => (
 *       <SelectItem key={cycle.id} value={cycle.id}>
 *         {cycle.name}
 *       </SelectItem>
 *     ))}
 *   </Select>
 * );
 * ```
 */
export const useCycles = (): UseCyclesReturn => {
  const [cycles, setCycles] = useState<CycleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enrollmentsService.getAvailableCycles();
      setCycles(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  return {
    cycles,
    loading,
    error,
    refetch: fetchCycles,
  };
};
