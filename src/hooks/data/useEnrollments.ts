import { useState, useCallback, useEffect } from 'react';
import { enrollmentsService } from '@/services/enrollments.service';
import {
  EnrollmentResponse,
  EnrollmentsQuery,
  PaginatedEnrollments,
} from '@/types/enrollments.types';
import { toast } from 'sonner';

interface UseEnrollmentsReturn {
  enrollments: EnrollmentResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchEnrollments: (query?: EnrollmentsQuery) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useEnrollments = (): UseEnrollmentsReturn => {
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [currentQuery, setCurrentQuery] = useState<EnrollmentsQuery>({
    page: 1,
    limit: 20,
  });

  const fetchEnrollments = useCallback(
    async (query: EnrollmentsQuery = {}) => {
      // Validar que cycleId esté presente
      const finalQuery = { ...currentQuery, ...query };
      
      if (!finalQuery.cycleId) {
        setEnrollments([]);
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        setCurrentQuery(finalQuery);

        const result = await enrollmentsService.getEnrollments(finalQuery);

        setEnrollments(result.data);
        setPagination(result.meta);
      } catch (err: any) {
        const message = err.message || 'Error al cargar matrículas';
        setError(message);
        toast.error(message);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    },
    [currentQuery]
  );

  const refetch = useCallback(() => {
    return fetchEnrollments(currentQuery);
  }, [fetchEnrollments, currentQuery]);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return {
    enrollments,
    loading,
    error,
    pagination,
    fetchEnrollments,
    refetch,
  };
};
