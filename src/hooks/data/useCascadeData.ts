/**
 * Hook para obtener datos en cascada del módulo de Cotejos
 */

import { useState, useEffect } from 'react';
import { CascadeResponse } from '@/types/cotejos.types';
import { getCascadeData } from '@/services/cotejos.service';
import { CotejosError } from '@/utils/cotejos-error.utils';

interface UseCascadeDataState {
  data: CascadeResponse | null;
  loading: boolean;
  error: CotejosError | null;
}

export const useCascadeData = (includeInactive: boolean = false) => {
  const [state, setState] = useState<UseCascadeDataState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      setState({ data: null, loading: true, error: null });
      try {
        const result = await getCascadeData(includeInactive);
        setState({ data: result, loading: false, error: null });
      } catch (error) {
        const cotejosError =
          error instanceof CotejosError ? error : new CotejosError('UNKNOWN_ERROR', 'UNKNOWN', 'Error desconocido');
        setState({ data: null, loading: false, error: cotejosError });
      }
    };

    fetchData();
  }, [includeInactive]);

  return state;
};
