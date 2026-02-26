import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboard.service';

/**
 * Hook para obtener cumpleaños de estudiantes (Para docentes titulares y especialistas)
 */
export function useBirthdays() {
  const [birthdays, setBirthdays] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('useBirthdays - iniciando petición...');
        const data = await dashboardService.getStudentBirthdays();
        console.log('useBirthdays - data recibida:', data);
        setBirthdays(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Error en useBirthdays - Error completo:', err);
        console.error('Error en useBirthdays - Mensaje:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { birthdays, isLoading, error };
}
