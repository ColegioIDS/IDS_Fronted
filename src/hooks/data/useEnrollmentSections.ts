import { useState, useEffect, useCallback } from 'react';
import { enrollmentsService } from '@/services/enrollments.service';

interface Section {
  id: number;
  name: string;
  capacity: number;
  gradeId?: number;
  gradeName?: string;
  cycleId?: number;
  cycleName?: string;
}

interface UseEnrollmentSectionsReturn {
  sections: Section[];
  loading: boolean;
  error: string | null;
  refetch: (cycleId?: number, gradeId?: number) => Promise<void>;
}

export const useEnrollmentSections = (): UseEnrollmentSectionsReturn => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async (cycleId?: number, gradeId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await enrollmentsService.getSections(cycleId, gradeId);
      setSections(data);
    } catch (err: any) {
      const message = err.message || 'Error al cargar secciones';
      setError(message);
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sections,
    loading,
    error,
    refetch: fetchSections,
  };
};
