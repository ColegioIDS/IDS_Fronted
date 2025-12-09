// hooks/data/erica-evaluations/useEricaEvaluations.ts
import { useState, useCallback } from 'react';
import { ericaEvaluationsService } from '@/services/erica-evaluations.service';
import {
  EricaEvaluationWithRelations,
  CreateEricaEvaluationRequest,
  UpdateEricaEvaluationRequest,
  EvaluationFilters,
  EricaEvaluation,
} from '@/types/erica-evaluations';

interface UseEvaluationsState {
  evaluations: EricaEvaluationWithRelations[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  mutationError: string | null;
}

interface UseEvaluationsReturn extends UseEvaluationsState {
  // Load operations
  loadByEnrollmentAndCourse: (enrollmentId: number, courseId: number, filters?: EvaluationFilters) => Promise<void>;
  loadBySectionAndWeek: (sectionId: number, weekId: number) => Promise<void>;
  
  // CRUD operations
  createEvaluation: (data: CreateEricaEvaluationRequest) => Promise<EricaEvaluation | null>;
  updateEvaluation: (id: number, data: UpdateEricaEvaluationRequest) => Promise<EricaEvaluation | null>;
  deleteEvaluation: (id: number) => Promise<boolean>;
  
  // Utility
  clearEvaluations: () => void;
  clearError: () => void;
}

export function useEricaEvaluations(): UseEvaluationsReturn {
  const [state, setState] = useState<UseEvaluationsState>({
    evaluations: [],
    isLoading: false,
    error: null,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    mutationError: null,
  });

  // Load evaluations by enrollment and course
  const loadByEnrollmentAndCourse = useCallback(async (
    enrollmentId: number,
    courseId: number,
    filters?: Pick<EvaluationFilters, 'dimension' | 'startWeek' | 'endWeek'>
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await ericaEvaluationsService.getEvaluationsByEnrollmentAndCourse(
        enrollmentId,
        courseId,
        filters
      );
      
      setState(prev => ({
        ...prev,
        evaluations: data,
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error al cargar evaluaciones',
      }));
    }
  }, []);

  // Load evaluations by section and week
  const loadBySectionAndWeek = useCallback(async (sectionId: number, weekId: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await ericaEvaluationsService.getEvaluationsBySectionAndWeek(sectionId, weekId);
      
      setState(prev => ({
        ...prev,
        evaluations: data,
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error al cargar evaluaciones de sección',
      }));
    }
  }, []);

  // Create evaluation
  const createEvaluation = useCallback(async (
    data: CreateEricaEvaluationRequest
  ): Promise<EricaEvaluation | null> => {
    setState(prev => ({ ...prev, isCreating: true, mutationError: null }));
    
    try {
      const result = await ericaEvaluationsService.createEvaluation(data);
      
      setState(prev => ({ ...prev, isCreating: false }));
      
      return result;
    } catch (err) {
      setState(prev => ({
        ...prev,
        isCreating: false,
        mutationError: err instanceof Error ? err.message : 'Error al crear evaluación',
      }));
      return null;
    }
  }, []);

  // Update evaluation
  const updateEvaluation = useCallback(async (
    id: number,
    data: UpdateEricaEvaluationRequest
  ): Promise<EricaEvaluation | null> => {
    setState(prev => ({ ...prev, isUpdating: true, mutationError: null }));
    
    try {
      const result = await ericaEvaluationsService.updateEvaluation(id, data);
      
      // Update in local state
      setState(prev => ({
        ...prev,
        isUpdating: false,
        evaluations: prev.evaluations.map(ev => 
          ev.id === id ? { ...ev, ...result } : ev
        ),
      }));
      
      return result;
    } catch (err) {
      setState(prev => ({
        ...prev,
        isUpdating: false,
        mutationError: err instanceof Error ? err.message : 'Error al actualizar evaluación',
      }));
      return null;
    }
  }, []);

  // Delete evaluation
  const deleteEvaluation = useCallback(async (id: number): Promise<boolean> => {
    setState(prev => ({ ...prev, isDeleting: true, mutationError: null }));
    
    try {
      await ericaEvaluationsService.deleteEvaluation(id);
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        isDeleting: false,
        evaluations: prev.evaluations.filter(ev => ev.id !== id),
      }));
      
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        isDeleting: false,
        mutationError: err instanceof Error ? err.message : 'Error al eliminar evaluación',
      }));
      return false;
    }
  }, []);

  // Clear evaluations
  const clearEvaluations = useCallback(() => {
    setState(prev => ({
      ...prev,
      evaluations: [],
      error: null,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      mutationError: null,
    }));
  }, []);

  return {
    // State
    evaluations: state.evaluations,
    isLoading: state.isLoading,
    error: state.error,
    isCreating: state.isCreating,
    isUpdating: state.isUpdating,
    isDeleting: state.isDeleting,
    mutationError: state.mutationError,
    
    // Load operations
    loadByEnrollmentAndCourse,
    loadBySectionAndWeek,
    
    // CRUD operations
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    
    // Utility
    clearEvaluations,
    clearError,
  };
}

export default useEricaEvaluations;
