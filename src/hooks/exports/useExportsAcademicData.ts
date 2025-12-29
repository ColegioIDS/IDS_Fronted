/**
 * Hook para obtener datos académicos del módulo de exports
 */

import { useState, useEffect } from 'react';
import { exportsService } from '@/services/exports.service';
import { ExportAcademicDataResponse } from '@/types/exports.types';

interface UseExportsAcademicDataState {
  data: ExportAcademicDataResponse['data'] | null;
  loading: boolean;
  error: Error | null;
}

export const useExportsAcademicData = () => {
  const [state, setState] = useState<UseExportsAcademicDataState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      setState({ data: null, loading: true, error: null });
      try {
        const result = await exportsService.getAcademicData();
        setState({ data: result, loading: false, error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al obtener datos';
        setState({ data: null, loading: false, error: new Error(errorMessage) });
      }
    };

    fetchData();
  }, []);

  return state;
};
