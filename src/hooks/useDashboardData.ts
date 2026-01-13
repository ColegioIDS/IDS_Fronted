// src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardTeacherStats } from '@/types/dashboard.types';

interface UseDashboardStatsState {
  stats: DashboardTeacherStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UseDashboardStatsState = {
  stats: null,
  isLoading: true,
  error: null,
};

/**
 * Hook para obtener las estadísticas del dashboard
 */
export function useDashboardStats() {
  const [state, setState] = useState<UseDashboardStatsState>(initialState);

  useEffect(() => {
    (async () => {
      try {
        setState({ stats: null, isLoading: true, error: null });
        const data = await dashboardService.getStats();
        setState({ stats: data, isLoading: false, error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setState({ stats: null, isLoading: false, error: errorMessage });
        console.error('Error en useDashboardStats:', error);
      }
    })();
  }, []);

  return state;
}
