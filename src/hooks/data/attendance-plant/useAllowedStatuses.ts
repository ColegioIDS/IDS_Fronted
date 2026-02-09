/**
 * ====================================================================
 * useAllowedStatuses - Hook para estados permitidos
 * ====================================================================
 */

import { useState, useEffect } from 'react';
import { getAllowedStatuses } from '@/services/attendance-plant.service';
import type { AllowedStatusesResponse } from '@/types/attendance-plant.types';

interface AllowedStatusesState {
  data: AllowedStatusesResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useAllowedStatuses() {
  const [state, setState] = useState<AllowedStatusesState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const statusesData = await getAllowedStatuses();
        setState({
          data: statusesData,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error loading allowed statuses:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Error al cargar estados permitidos',
        }));
      }
    };

    loadStatuses();
  }, []);

  return state;
}
