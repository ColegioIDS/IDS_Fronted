import { useState, useCallback } from 'react';
import { enrollmentsService } from '@/services/enrollments.service';
import { EnrollmentStatistics } from '@/types/enrollments.types';
import { toast } from 'sonner';

interface UseEnrollmentStatisticsReturn {
  statistics: EnrollmentStatistics | null;
  loading: boolean;
  error: string | null;
  fetchStatistics: (cycleId?: number) => Promise<void>;
}

export const useEnrollmentStatistics = (): UseEnrollmentStatisticsReturn => {
  const [statistics, setStatistics] = useState<EnrollmentStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async (cycleId?: number) => {
    try {
      setLoading(true);
      setError(null);

      const result = await enrollmentsService.getStatistics(cycleId);
      setStatistics(result);
    } catch (err: any) {
      const message = err.message || 'Error al cargar estadísticas';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    statistics,
    loading,
    error,
    fetchStatistics,
  };
};
