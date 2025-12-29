'use client';

import { useState, useCallback } from 'react';
import { exportsService } from '@/services/exports.service';
import { ExportsStudentFilterRequest, ExportsStudentFilterResponse } from '@/types/exports.types';

interface UseFilteredStudentsState {
  loading: boolean;
  error: string | null;
  data: ExportsStudentFilterResponse | null;
  isLoading: boolean;
}

export function useFilteredStudents() {
  const [state, setState] = useState<UseFilteredStudentsState>({
    loading: false,
    error: null,
    data: null,
    isLoading: false,
  });

  const fetchStudents = useCallback(async (filters: ExportsStudentFilterRequest) => {
    setState({ loading: true, error: null, data: null, isLoading: true });

    try {
      const response = await exportsService.getStudentsByFilter(filters);
      setState({ loading: false, error: null, data: response, isLoading: false });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener estudiantes';
      setState({ loading: false, error: errorMessage, data: null, isLoading: false });
      throw error;
    }
  }, []);

  return {
    ...state,
    fetchStudents,
  };
}
