// hooks/data/erica-evaluations/useEricaEvaluationGrid.ts
import { useState, useCallback } from 'react';
import { ericaEvaluationsService } from '@/services/erica-evaluations.service';
import {
  EvaluationGridResponse,
  EvaluationGridData,
  EricaDimension,
  EricaState,
  SaveGridEvaluationItem,
  SaveGridResult,
  STATE_POINTS,
} from '@/types/erica-evaluations';

interface UseGridState {
  gridData: EvaluationGridResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveError: string | null;
}

interface PendingChange {
  enrollmentId: number;
  dimension: EricaDimension;
  state: EricaState;
  notes?: string | null;
}

interface UseEvaluationGridReturn extends UseGridState {
  // Load grid
  loadGrid: (topicId: number, includeEmpty?: boolean) => Promise<void>;
  
  // Local state management
  localGrid: EvaluationGridData[];
  pendingChanges: Map<string, PendingChange>;
  
  // Update local state
  updateCell: (enrollmentId: number, dimension: EricaDimension, state: EricaState, notes?: string | null) => void;
  clearCell: (enrollmentId: number, dimension: EricaDimension) => void;
  
  // Save
  saveGrid: (topicId: number, teacherId: number) => Promise<SaveGridResult | null>;
  
  // Utility
  hasUnsavedChanges: boolean;
  discardChanges: () => void;
  resetGrid: () => void;
}

export function useEricaEvaluationGrid(): UseEvaluationGridReturn {
  const [state, setState] = useState<UseGridState>({
    gridData: null,
    isLoading: false,
    isSaving: false,
    error: null,
    saveError: null,
  });

  const [localGrid, setLocalGrid] = useState<EvaluationGridData[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [originalGrid, setOriginalGrid] = useState<EvaluationGridData[]>([]);

  // Generate unique key for pending change
  const getChangeKey = (enrollmentId: number, dimension: EricaDimension): string => 
    `${enrollmentId}-${dimension}`;

  // Load grid from API
  const loadGrid = useCallback(async (topicId: number, includeEmpty = true) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await ericaEvaluationsService.getGridByTopic(topicId, includeEmpty);
      
      setState({
        gridData: data,
        isLoading: false,
        isSaving: false,
        error: null,
        saveError: null,
      });
      
      // Initialize local grid with API data (students array)
      const students = data.students || [];
      setLocalGrid(students);
      setOriginalGrid(JSON.parse(JSON.stringify(students)));
      setPendingChanges(new Map());
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error al cargar grid de evaluaciones',
      }));
    }
  }, []);

  // Update a single cell
  const updateCell = useCallback((
    enrollmentId: number,
    dimension: EricaDimension,
    state: EricaState,
    notes?: string | null
  ) => {
    const changeKey = getChangeKey(enrollmentId, dimension);
    
    // Update local grid
    setLocalGrid(prev => prev.map(row => {
      if (row.enrollmentId !== enrollmentId) return row;
      
      return {
        ...row,
        [dimension]: {
          id: row[dimension]?.id,
          state,
          points: STATE_POINTS[state],
          notes,
        },
      };
    }));
    
    // Track pending change
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.set(changeKey, { enrollmentId, dimension, state, notes });
      return newMap;
    });
  }, []);

  // Clear a cell
  const clearCell = useCallback((enrollmentId: number, dimension: EricaDimension) => {
    const changeKey = getChangeKey(enrollmentId, dimension);
    
    // Update local grid - set to null
    setLocalGrid(prev => prev.map(row => {
      if (row.enrollmentId !== enrollmentId) return row;
      
      return {
        ...row,
        [dimension]: null,
      };
    }));
    
    // Remove from pending changes if exists
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.delete(changeKey);
      return newMap;
    });
  }, []);

  // Save grid to API
  const saveGrid = useCallback(async (
    topicId: number,
    teacherId: number
  ): Promise<SaveGridResult | null> => {
    if (pendingChanges.size === 0) {
      return null;
    }
    
    setState(prev => ({ ...prev, isSaving: true, saveError: null }));
    
    try {
      // Convert pending changes to evaluations array
      const evaluations: SaveGridEvaluationItem[] = Array.from(pendingChanges.values()).map(change => ({
        enrollmentId: change.enrollmentId,
        dimension: change.dimension,
        state: change.state,
        notes: change.notes,
      }));
      
      const result = await ericaEvaluationsService.saveEvaluationGridByTopic(topicId, {
        topicId,
        teacherId,
        evaluations,
      });
      
      console.log('[saveGrid] Result from service:', result);
      
      setState(prev => ({ ...prev, isSaving: false }));
      
      // Clear pending changes after successful save
      setPendingChanges(new Map());
      
      // Reload grid from API to ensure data consistency
      // This will fetch the latest data from the server
      try {
        const reloadedData = await ericaEvaluationsService.getGridByTopic(topicId, true);
        
        if (reloadedData) {
          const students = reloadedData.students || [];
          setLocalGrid(students);
          setOriginalGrid(JSON.parse(JSON.stringify(students)));
          setState(prev => ({
            ...prev,
            gridData: reloadedData,
            error: null,
            saveError: null,
          }));
        }
      } catch (reloadErr) {
        // Don't fail the save if reload fails, but clear state
        setPendingChanges(new Map());
      }
      
      return result;
    } catch (err) {
      let errorMessage = 'Error al guardar evaluaciones';
      let errorDetails = '';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // Si el error tiene detalles del servidor
        if ('response' in err && (err as any).response?.data?.details) {
          errorDetails = (err as any).response.data.details.join(', ');
        }
      }
      
      const fullErrorMessage = errorDetails 
        ? `${errorMessage}: ${errorDetails}`
        : errorMessage;
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError: fullErrorMessage,
      }));
      return null;
    }
  }, [pendingChanges]);

  // Discard changes and revert to original
  const discardChanges = useCallback(() => {
    setLocalGrid(JSON.parse(JSON.stringify(originalGrid)));
    setPendingChanges(new Map());
  }, [originalGrid]);

  // Reset entire grid state
  const resetGrid = useCallback(() => {
    setState({
      gridData: null,
      isLoading: false,
      isSaving: false,
      error: null,
      saveError: null,
    });
    setLocalGrid([]);
    setOriginalGrid([]);
    setPendingChanges(new Map());
  }, []);

  return {
    // State
    gridData: state.gridData,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    error: state.error,
    saveError: state.saveError,
    
    // Load
    loadGrid,
    
    // Local state
    localGrid,
    pendingChanges,
    
    // Update
    updateCell,
    clearCell,
    
    // Save
    saveGrid,
    
    // Utility
    hasUnsavedChanges: pendingChanges.size > 0,
    discardChanges,
    resetGrid,
  };
}

export default useEricaEvaluationGrid;
