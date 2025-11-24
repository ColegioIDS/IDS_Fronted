'use client';

import { useEffect, useState } from 'react';
import {
  attendanceReportsService,
  SectionOptionsResponse,
} from '@/services/attendance-reports.service';

export function useSectionOptions(
  gradeId: number | null,
  bimesterId: number | null
) {
  const [data, setData] = useState<SectionOptionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gradeId || !bimesterId) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await attendanceReportsService.getSectionOptions(
          gradeId,
          bimesterId
        );
        if (!cancelled) setData(response);
      } catch (err) {
        if (!cancelled) {
          const error = err instanceof Error ? err : new Error('Error desconocido');
          setError(error);
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [gradeId, bimesterId]);

  return { data, loading, error };
}
