// src/hooks/data/useParentDetails.ts
'use client';

import { useState, useCallback } from 'react';
import { ParentDetails, UpdateParentDetailsDto } from '@/types/users.types';
import { toast } from 'sonner';

interface UseParentDetailsState {
  parentDetails: ParentDetails | null;
  isLoading: boolean;
  error: Error | null;
}

export function useParentDetails(userId?: number) {
  const [state, setState] = useState<UseParentDetailsState>({
    parentDetails: null,
    isLoading: false,
    error: null,
  });

  // Fetch parent details
  const fetchParentDetails = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`/api/users/${id}/parent-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener detalles del padre');
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        parentDetails: data,
        isLoading: false,
      }));
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setState((prev) => ({
        ...prev,
        error: err,
        isLoading: false,
      }));
      toast.error(err.message);
      return null;
    }
  }, []);

  // Update parent details
  const updateParentDetails = useCallback(
    async (id: number, data: UpdateParentDetailsDto): Promise<ParentDetails | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await fetch(`/api/users/${id}/parent-details`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Error al actualizar detalles del padre');
        }

        const updatedDetails = await response.json();
        setState((prev) => ({
          ...prev,
          parentDetails: updatedDetails,
          isLoading: false,
        }));
        return updatedDetails;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error desconocido');
        setState((prev) => ({
          ...prev,
          error: err,
          isLoading: false,
        }));
        toast.error(err.message);
        return null;
      }
    },
    []
  );

  // Auto-fetch if userId is provided
  if (userId && !state.parentDetails && !state.isLoading) {
    fetchParentDetails(userId);
  }

  return {
    parentDetails: state.parentDetails,
    isLoading: state.isLoading,
    error: state.error,
    fetchParentDetails,
    updateParentDetails,
  };
}
