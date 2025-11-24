'use client';

import { useEffect, useState } from 'react';
import {
  attendanceReportsService,
  GradeOptionsResponse,
} from '@/services/attendance-reports.service';

export function useGradeOptions(bimesterId: number | null) {
  const [data, setData] = useState<GradeOptionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!bimesterId) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await attendanceReportsService.getGradeOptions(bimesterId);
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
  }, [bimesterId]);

  return { data, loading, error };
}
