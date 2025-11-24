'use client';

import { useEffect, useState } from 'react';
import {
  attendanceReportsService,
  BimesterOptionsResponse,
} from '@/services/attendance-reports.service';

export function useBimesterOptions(cycleId: number | null) {
  const [data, setData] = useState<BimesterOptionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!cycleId) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await attendanceReportsService.getBimesterOptions(cycleId);
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
  }, [cycleId]);

  return { data, loading, error };
}
