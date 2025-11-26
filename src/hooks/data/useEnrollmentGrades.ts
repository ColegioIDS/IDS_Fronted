import { useState, useEffect, useCallback } from 'react';
import { enrollmentsService } from '@/services/enrollments.service';

interface Grade {
  id: number;
  name: string;
  level?: string;
  cycleId?: number;
  cycleName?: string;
}

interface UseEnrollmentGradesReturn {
  grades: Grade[];
  loading: boolean;
  error: string | null;
  refetch: (cycleId?: number) => Promise<void>;
}

export const useEnrollmentGrades = (): UseEnrollmentGradesReturn => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = useCallback(async (cycleId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await enrollmentsService.getGrades(cycleId);
      setGrades(data);
    } catch (err: any) {
      const message = err.message || 'Error al cargar grados';
      setError(message);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    grades,
    loading,
    error,
    refetch: fetchGrades,
  };
};
