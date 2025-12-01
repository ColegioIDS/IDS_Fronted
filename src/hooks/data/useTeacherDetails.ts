// src/hooks/data/useTeacherDetails.ts
'use client';

import { useState, useCallback } from 'react';
import { TeacherDetails, UpdateTeacherDetailsDto } from '@/types/users.types';
import { toast } from 'sonner';

interface UseTeacherDetailsState {
  teacherDetails: TeacherDetails | null;
  isLoading: boolean;
  error: Error | null;
}

export function useTeacherDetails(userId?: number) {
  const [state, setState] = useState<UseTeacherDetailsState>({
    teacherDetails: null,
    isLoading: false,
    error: null,
  });

  // Fetch teacher details
  const fetchTeacherDetails = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`/api/users/${id}/teacher-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener detalles del docente');
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        teacherDetails: data,
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

  // Update teacher details
  const updateTeacherDetails = useCallback(
    async (id: number, data: UpdateTeacherDetailsDto): Promise<TeacherDetails | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await fetch(`/api/users/${id}/teacher-details`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Error al actualizar detalles del docente');
        }

        const updatedDetails = await response.json();
        setState((prev) => ({
          ...prev,
          teacherDetails: updatedDetails,
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
  if (userId && !state.teacherDetails && !state.isLoading) {
    fetchTeacherDetails(userId);
  }

  return {
    teacherDetails: state.teacherDetails,
    isLoading: state.isLoading,
    error: state.error,
    fetchTeacherDetails,
    updateTeacherDetails,
  };
}
