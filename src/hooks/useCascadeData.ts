// src/hooks/useCascadeData.ts
import { useEffect, useState, useCallback } from 'react';
import { cascadeDataService } from '@/services/cascade-data.service';
import { CascadeDataResponse } from '@/types/cascade-data.types';
import { CascadeDataError } from '@/utils/cascade-data-error';

interface UseCascadeDataResult {
  data: CascadeDataResponse | null;
  loading: boolean;
  error: string | null;
  errorCode: string | null;
  refetch: (includeInactive?: boolean) => Promise<void>;
}

export function useCascadeData(): UseCascadeDataResult {
  const [data, setData] = useState<CascadeDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const fetch = useCallback(async (includeInactive = false) => {
    try {
      setLoading(true);
      setError(null);
      setErrorCode(null);

      const result = await cascadeDataService.getAllCascadeData(includeInactive);
      setData(result);
    } catch (err) {
      let errorMessage = 'Error desconocido';
      let errorCodeValue = 'UNKNOWN';

      if (err instanceof CascadeDataError) {
        errorMessage = err.message;
        errorCodeValue = err.code;
      } else if (err instanceof Error) {
        errorMessage = err.message;
        // Intentar detectar el tipo de error
        const cascadeError = CascadeDataError.fromMessage(errorMessage);
        errorCodeValue = cascadeError.code;
      }

      setErrorCode(errorCodeValue);
      setError(errorMessage);
      setData(null);

      // Log para debugging
      console.error('[useCascadeData]', {
        errorCode: errorCodeValue,
        message: errorMessage,
        originalError: err,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, errorCode, refetch: fetch };
}
