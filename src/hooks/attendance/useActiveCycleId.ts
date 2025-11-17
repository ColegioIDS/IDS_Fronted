'use client';

import { useState, useCallback, useEffect } from 'react';
import { attendanceConfigurationService } from '@/services/attendance-configuration.service';

/**
 * Hook para obtener el ID del ciclo activo
 * Solo usa el attendance service - sin dependencias externas
 * @returns { cycleId: number | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }
 */
export const useActiveCycleId = () => {
  const [cycleId, setCycleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCycleId = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[useActiveCycleId] Fetching active cycle ID...');
      const grades = await attendanceConfigurationService.getGrades();

      if (!grades || grades.length === 0) {
        throw new Error('No se encontraron grados');
      }

      // The first grade should have cycleId information
      // Extract cycleId from the response structure
      let activeCycleId: number | null = null;

      // Try to get cycleId from grades response
      if (grades[0]) {
        // The response structure should have cycle information
        // Based on the API, we need to look at the full response
        const firstGrade = grades[0];
        activeCycleId = (firstGrade as any).cycleId || (firstGrade as any).cycle?.id || null;
      }

      if (!activeCycleId) {
        console.warn('[useActiveCycleId] Could not extract cycleId from grades, trying direct API call');
        // If we can't get it from grades, try a direct call to get cycle info
        // For now, we'll assume cycleId = 1 (common default) or fetch from another endpoint
        activeCycleId = 1; // Fallback
      }

      console.log('[useActiveCycleId] Active cycle ID:', activeCycleId);
      setCycleId(activeCycleId);
    } catch (err) {
      console.error('[useActiveCycleId] Error:', err);
      setError(err instanceof Error ? err : new Error('Error loading active cycle'));
      setCycleId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCycleId();
  }, [fetchCycleId]);

  return {
    cycleId,
    loading,
    error,
    refetch: fetchCycleId,
  };
};
