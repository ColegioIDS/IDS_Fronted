import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboard.service';

/**
 * Hook para obtener tareas pendientes por calificar (Para docentes titulares y especialistas)
 */
export function usePendingTasks() {
  const [pendingTasks, setPendingTasks] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await dashboardService.getPendingTasks();
        setPendingTasks(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error en usePendingTasks:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { pendingTasks, isLoading, error };
}
