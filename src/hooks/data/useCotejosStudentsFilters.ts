/**
 * Hook para obtener estudiantes filtrados para el módulo de cotejos
 */

import { useState, useCallback } from 'react';
import {
  CotejosStudentsFiltersQuery,
  CotejosStudentsFiltersResponse,
} from '@/types/cotejos.types';
import { getStudentsByFilters } from '@/services/cotejos.service';
import { CotejosError } from '@/utils/cotejos-error.utils';

interface UseCotejosStudentsFiltersState {
  data: CotejosStudentsFiltersResponse['data'] | null;
  loading: boolean;
  error: CotejosError | null;
}

export const useCotejosStudentsFilters = () => {
  const [state, setState] = useState<UseCotejosStudentsFiltersState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetch = useCallback(async (query: CotejosStudentsFiltersQuery) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await getStudentsByFilters(query);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const cotejosError = error instanceof CotejosError ? error : new CotejosError('UNKNOWN_ERROR', 'UNKNOWN', 'Error desconocido');
      setState({ data: null, loading: false, error: cotejosError });
      throw cotejosError;
    }
  }, []);

  return {
    ...state,
    fetch,
  };
};
