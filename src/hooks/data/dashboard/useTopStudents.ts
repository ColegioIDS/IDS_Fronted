import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboard.service';

/**
 * Hook para obtener estudiantes destacados (Solo para docentes titulares)
 */
export function useTopStudents() {
  const [topStudents, setTopStudents] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await dashboardService.getTopStudents();
        setTopStudents(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error en useTopStudents:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { topStudents, isLoading, error };
}
