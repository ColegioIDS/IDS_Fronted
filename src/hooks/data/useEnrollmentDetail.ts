import { useState, useCallback } from 'react';
import { enrollmentsService } from '@/services/enrollments.service';
import { EnrollmentDetailResponse } from '@/types/enrollments.types';
import { toast } from 'sonner';

interface UseEnrollmentDetailReturn {
  enrollment: EnrollmentDetailResponse | null;
  loading: boolean;
  error: string | null;
  fetchDetail: (enrollmentId: number) => Promise<void>;
}

export const useEnrollmentDetail = (): UseEnrollmentDetailReturn => {
  const [enrollment, setEnrollment] = useState<EnrollmentDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (enrollmentId: number) => {
    try {
      setLoading(true);
      setError(null);

      const result = await enrollmentsService.getEnrollmentDetail(enrollmentId);
      setEnrollment(result);
    } catch (err: any) {
      const message = err.message || 'Error al cargar detalle';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    enrollment,
    loading,
    error,
    fetchDetail,
  };
};
