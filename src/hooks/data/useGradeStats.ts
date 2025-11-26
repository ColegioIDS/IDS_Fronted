// src/hooks/data/useGradeStats.ts

'use client';

import { useState, useEffect } from 'react';
import { gradesService } from '@/services/grades.service';
import { GradeStats } from '@/types/grades.types';

interface UseGradeStatsReturn {
  stats: GradeStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  hasDependencies: boolean;
}

/**
 * 📊 Hook para obtener estadísticas de un grado
 */
export function useGradeStats(id: number | null): UseGradeStatsReturn {
  const [stats, setStats] = useState<GradeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!id) {
      setStats(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await gradesService.getStats(id);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [id]);

  const hasDependencies = stats
    ? stats.stats.sectionsCount > 0 || stats.stats.cyclesCount > 0
    : false;

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
    hasDependencies,
  };
}

export default useGradeStats;
