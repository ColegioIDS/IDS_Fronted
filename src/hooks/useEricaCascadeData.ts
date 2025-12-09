// src/hooks/useEricaCascadeData.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ericaTopicsService, EricaCascadeError } from '@/services/erica-topics.service';
import { EricaCascadeDataResponse, EricaCascadeErrorCode } from '@/types/erica-topics.types';

interface UseEricaCascadeDataResult {
  data: EricaCascadeDataResponse | null;
  loading: boolean;
  error: string | null;
  errorCode: EricaCascadeErrorCode | null;
  refetch: () => Promise<void>;
}

export function useEricaCascadeData(): UseEricaCascadeDataResult {
  const [data, setData] = useState<EricaCascadeDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<EricaCascadeErrorCode | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorCode(null);
      
      const result = await ericaTopicsService.getCascadeData();
      setData(result);
    } catch (err) {
      if (err instanceof EricaCascadeError) {
        setError(err.message);
        setErrorCode(err.code);
      } else if (err instanceof Error) {
        setError(err.message);
        setErrorCode('UNKNOWN');
      } else {
        setError('Error desconocido al cargar datos');
        setErrorCode('UNKNOWN');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    errorCode,
    refetch: fetchData,
  };
}
