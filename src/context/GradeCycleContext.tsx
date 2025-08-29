// src/context/GradeCycleContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
  GradeCycle,
  GradeCycleWithSections,
  CycleStats,
  CycleSummary,
  CourseForCycle,
  CreateGradeCycleRequest,
  BulkCreateGradeCycleRequest,
  GradeCycleFilters
} from '@/types/gradeCycles';
import {
  createGradeCycle,
  bulkCreateGradeCycles,
  getGradeCyclesByCycle,
  getGradeCyclesByGrade,
  deleteGradeCycle,
  getAvailableGradesForEnrollment,
  getAvailableCoursesForCycle,
  getCycleStats,
  getCycleSummary
} from '@/services/gradeCycleService';

// Estado del contexto
interface GradeCycleState {
  // Data
  gradeCycles: GradeCycle[];
  currentGradeCycle: GradeCycle | null;
  availableGrades: GradeCycleWithSections[];
  availableCourses: CourseForCycle[];
  cycleStats: CycleStats[];
  cycleSummary: CycleSummary | null;
  
  // Estados de carga
  loading: boolean;
  submitting: boolean;
  loadingStats: boolean;
  loadingAvailableGrades: boolean;
  loadingAvailableCourses: boolean;
  
  // Estados de error
  error: string | null;
  
  // Filtros actuales
  filters: GradeCycleFilters;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | 'bulk' | null;
  editingCycleId: number | null;
  editingGradeId: number | null;
}

// Acciones
type GradeCycleAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_LOADING_STATS'; payload: boolean }
  | { type: 'SET_LOADING_AVAILABLE_GRADES'; payload: boolean }
  | { type: 'SET_LOADING_AVAILABLE_COURSES'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GRADE_CYCLES'; payload: GradeCycle[] }
  | { type: 'ADD_GRADE_CYCLE'; payload: GradeCycle }
  | { type: 'BULK_ADD_GRADE_CYCLES'; payload: GradeCycle[] }
  | { type: 'REMOVE_GRADE_CYCLE'; payload: { cycleId: number; gradeId: number } }
  | { type: 'SET_CURRENT_GRADE_CYCLE'; payload: GradeCycle | null }
  | { type: 'SET_AVAILABLE_GRADES'; payload: GradeCycleWithSections[] }
  | { type: 'SET_AVAILABLE_COURSES'; payload: CourseForCycle[] }
  | { type: 'SET_CYCLE_STATS'; payload: CycleStats[] }
  | { type: 'SET_CYCLE_SUMMARY'; payload: CycleSummary | null }
  | { type: 'SET_FILTERS'; payload: GradeCycleFilters }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | 'bulk' | null; editingCycleId?: number; editingGradeId?: number } }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: GradeCycleState = {
  gradeCycles: [],
  currentGradeCycle: null,
  availableGrades: [],
  availableCourses: [],
  cycleStats: [],
  cycleSummary: null,
  loading: false,
  submitting: false,
  loadingStats: false,
  loadingAvailableGrades: false,
  loadingAvailableCourses: false,
  error: null,
  filters: {},
  formMode: null,
  editingCycleId: null,
  editingGradeId: null
};

// Reducer
function gradeCycleReducer(state: GradeCycleState, action: GradeCycleAction): GradeCycleState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_LOADING_STATS':
      return { ...state, loadingStats: action.payload };
      
    case 'SET_LOADING_AVAILABLE_GRADES':
      return { ...state, loadingAvailableGrades: action.payload };
      
    case 'SET_LOADING_AVAILABLE_COURSES':
      return { ...state, loadingAvailableCourses: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_GRADE_CYCLES':
      return {
        ...state,
        gradeCycles: action.payload,
        loading: false,
        error: null
      };
      
    case 'ADD_GRADE_CYCLE':
      return {
        ...state,
        gradeCycles: [action.payload, ...state.gradeCycles]
      };
      
    case 'BULK_ADD_GRADE_CYCLES':
      return {
        ...state,
        gradeCycles: action.payload
      };
      
    case 'REMOVE_GRADE_CYCLE':
      return {
        ...state,
        gradeCycles: state.gradeCycles.filter(gc => 
          !(gc.cycleId === action.payload.cycleId && gc.gradeId === action.payload.gradeId)
        )
      };
      
    case 'SET_CURRENT_GRADE_CYCLE':
      return { ...state, currentGradeCycle: action.payload };
      
    case 'SET_AVAILABLE_GRADES':
      return { ...state, availableGrades: action.payload, loadingAvailableGrades: false };
      
    case 'SET_AVAILABLE_COURSES':
      return { ...state, availableCourses: action.payload, loadingAvailableCourses: false };
      
    case 'SET_CYCLE_STATS':
      return { ...state, cycleStats: action.payload, loadingStats: false };
      
    case 'SET_CYCLE_SUMMARY':
      return { ...state, cycleSummary: action.payload };
      
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
      
    case 'SET_FORM_MODE':
      return {
        ...state,
        formMode: action.payload.mode,
        editingCycleId: action.payload.editingCycleId || null,
        editingGradeId: action.payload.editingGradeId || null
      };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Tipos del contexto
interface GradeCycleContextType {
  // Estado
  state: GradeCycleState;
  
  // Acciones de datos
  fetchGradeCyclesByCycle: (cycleId: number) => Promise<void>;
  fetchGradeCyclesByGrade: (gradeId: number) => Promise<void>;
  fetchAvailableGradesForEnrollment: (cycleId: number) => Promise<void>;
  fetchAvailableCoursesForCycle: (cycleId: number) => Promise<void>;
  fetchCycleStats: (cycleId: number) => Promise<void>;
  fetchCycleSummary: (cycleId: number) => Promise<void>;
  
  // Acciones CRUD
  createGradeCycle: (data: CreateGradeCycleRequest) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  bulkCreateGradeCycles: (data: BulkCreateGradeCycleRequest) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  removeGradeCycle: (cycleId: number, gradeId: number) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de UI
  setFilters: (filters: GradeCycleFilters) => void;
  setFormMode: (mode: 'create' | 'edit' | 'bulk' | null, editingCycleId?: number, editingGradeId?: number) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshGradeCycles: () => Promise<void>;
  getGradeCycleById: (cycleId: number, gradeId: number) => GradeCycle | undefined;
}

// Crear contexto
const GradeCycleContext = createContext<GradeCycleContextType | undefined>(undefined);

// Provider del contexto
interface GradeCycleProviderProps {
  children: ReactNode;
}

export function GradeCycleProvider({ children }: GradeCycleProviderProps) {
  const [state, dispatch] = useReducer(gradeCycleReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Acciones de datos
  const fetchGradeCyclesByCycle = useCallback(async (cycleId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const gradeCycles = await getGradeCyclesByCycle(cycleId);
      dispatch({ type: 'SET_GRADE_CYCLES', payload: gradeCycles });
      
      dispatch({ type: 'SET_FILTERS', payload: { cycleId } });
    } catch (error) {
      handleError(error, 'Error al cargar los grados del ciclo');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchGradeCyclesByGrade = useCallback(async (gradeId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const gradeCycles = await getGradeCyclesByGrade(gradeId);
      dispatch({ type: 'SET_GRADE_CYCLES', payload: gradeCycles });
      
      dispatch({ type: 'SET_FILTERS', payload: { gradeId } });
    } catch (error) {
      handleError(error, 'Error al cargar el historial del grado');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchAvailableGradesForEnrollment = useCallback(async (cycleId: number) => {
    try {
      dispatch({ type: 'SET_LOADING_AVAILABLE_GRADES', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const availableGrades = await getAvailableGradesForEnrollment(cycleId);
      dispatch({ type: 'SET_AVAILABLE_GRADES', payload: availableGrades });
    } catch (error) {
      handleError(error, 'Error al cargar grados disponibles para matrícula');
    } finally {
      dispatch({ type: 'SET_LOADING_AVAILABLE_GRADES', payload: false });
    }
  }, [handleError]);

  const fetchAvailableCoursesForCycle = useCallback(async (cycleId: number) => {
    try {
      dispatch({ type: 'SET_LOADING_AVAILABLE_COURSES', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const availableCourses = await getAvailableCoursesForCycle(cycleId);
      dispatch({ type: 'SET_AVAILABLE_COURSES', payload: availableCourses });
    } catch (error) {
      handleError(error, 'Error al cargar cursos disponibles del ciclo');
    } finally {
      dispatch({ type: 'SET_LOADING_AVAILABLE_COURSES', payload: false });
    }
  }, [handleError]);

  const fetchCycleStats = useCallback(async (cycleId: number) => {
    try {
      dispatch({ type: 'SET_LOADING_STATS', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const stats = await getCycleStats(cycleId);
      dispatch({ type: 'SET_CYCLE_STATS', payload: stats });
    } catch (error) {
      handleError(error, 'Error al cargar estadísticas del ciclo');
    } finally {
      dispatch({ type: 'SET_LOADING_STATS', payload: false });
    }
  }, [handleError]);

  const fetchCycleSummary = useCallback(async (cycleId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const summary = await getCycleSummary(cycleId);
      dispatch({ type: 'SET_CYCLE_SUMMARY', payload: summary });
    } catch (error) {
      handleError(error, 'Error al cargar resumen del ciclo');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  // Acciones CRUD
  const createGradeCycleAction = useCallback(async (data: CreateGradeCycleRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newGradeCycle = await createGradeCycle(data);
      dispatch({ type: 'ADD_GRADE_CYCLE', payload: newGradeCycle });
      
      toast.success("Grado agregado al ciclo correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al agregar grado al ciclo');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const bulkCreateGradeCyclesAction = useCallback(async (data: BulkCreateGradeCycleRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newGradeCycles = await bulkCreateGradeCycles(data);
      dispatch({ type: 'BULK_ADD_GRADE_CYCLES', payload: newGradeCycles });
      
      toast.success("Configuración de grados actualizada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al configurar grados del ciclo');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeGradeCycle = useCallback(async (cycleId: number, gradeId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteGradeCycle(cycleId, gradeId);
      dispatch({ type: 'REMOVE_GRADE_CYCLE', payload: { cycleId, gradeId } });
      
      toast.success("Grado removido del ciclo correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al remover grado del ciclo');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Acciones de UI
  const setFilters = useCallback((filters: GradeCycleFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setFormMode = useCallback((
    mode: 'create' | 'edit' | 'bulk' | null, 
    editingCycleId?: number, 
    editingGradeId?: number
  ) => {
    dispatch({ type: 'SET_FORM_MODE', payload: { mode, editingCycleId, editingGradeId } });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Utilidades
  const refreshGradeCycles = useCallback(async () => {
    if (state.filters.cycleId) {
      await fetchGradeCyclesByCycle(state.filters.cycleId);
    } else if (state.filters.gradeId) {
      await fetchGradeCyclesByGrade(state.filters.gradeId);
    }
  }, [fetchGradeCyclesByCycle, fetchGradeCyclesByGrade, state.filters]);

  const getGradeCycleById = useCallback((cycleId: number, gradeId: number) => {
    return state.gradeCycles.find(gc => gc.cycleId === cycleId && gc.gradeId === gradeId);
  }, [state.gradeCycles]);

  // Valor del contexto
  const contextValue: GradeCycleContextType = {
    state,
    
    // Acciones de datos
    fetchGradeCyclesByCycle,
    fetchGradeCyclesByGrade,
    fetchAvailableGradesForEnrollment,
    fetchAvailableCoursesForCycle,
    fetchCycleStats,
    fetchCycleSummary,
    
    // Acciones CRUD
    createGradeCycle: createGradeCycleAction,
    bulkCreateGradeCycles: bulkCreateGradeCyclesAction,
    removeGradeCycle,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    clearError,
    resetState,
    
    // Utilidades
    refreshGradeCycles,
    getGradeCycleById
  };

  return (
    <GradeCycleContext.Provider value={contextValue}>
      {children}
    </GradeCycleContext.Provider>
  );
}

// Hook para usar el contexto
export function useGradeCycleContext() {
  const context = useContext(GradeCycleContext);
  if (context === undefined) {
    throw new Error('useGradeCycleContext must be used within a GradeCycleProvider');
  }
  return context;
}

// Hook especializado para configuración de ciclo (formulario bulk)
export function useGradeCycleBulkForm() {
  const {
    state: { submitting, formMode, editingCycleId },
    bulkCreateGradeCycles,
    setFormMode,
    fetchCycleSummary
  } = useGradeCycleContext();

  const handleBulkSubmit = useCallback(async (data: BulkCreateGradeCycleRequest) => {
    return await bulkCreateGradeCycles(data);
  }, [bulkCreateGradeCycles]);

  const startBulkConfig = useCallback((cycleId: number) => {
    setFormMode('bulk', cycleId);
  }, [setFormMode]);

  const cancelForm = useCallback(() => {
    setFormMode(null);
  }, [setFormMode]);

  return {
    submitting,
    formMode,
    editingCycleId,
    handleBulkSubmit,
    startBulkConfig,
    cancelForm
  };
}

// Hook especializado para formularios de matrícula
export function useGradeCycleEnrollment() {
  const {
    state: { availableGrades, loadingAvailableGrades, error },
    fetchAvailableGradesForEnrollment
  } = useGradeCycleContext();

  const getAvailableGrades = useCallback(async (cycleId: number) => {
    await fetchAvailableGradesForEnrollment(cycleId);
  }, [fetchAvailableGradesForEnrollment]);

  return {
    availableGrades,
    loading: loadingAvailableGrades,
    error,
    getAvailableGrades
  };
}

// Hook especializado para asignación de profesores
export function useGradeCycleCourses() {
  const {
    state: { availableCourses, loadingAvailableCourses, error },
    fetchAvailableCoursesForCycle
  } = useGradeCycleContext();

  const getAvailableCourses = useCallback(async (cycleId: number) => {
    await fetchAvailableCoursesForCycle(cycleId);
  }, [fetchAvailableCoursesForCycle]);

  return {
    availableCourses,
    loading: loadingAvailableCourses,
    error,
    getAvailableCourses
  };
}

// Hook especializado para estadísticas
export function useGradeCycleStats() {
  const {
    state: { cycleStats, cycleSummary, loadingStats },
    fetchCycleStats,
    fetchCycleSummary
  } = useGradeCycleContext();

  return {
    cycleStats,
    cycleSummary,
    loading: loadingStats,
    fetchStats: fetchCycleStats,
    fetchSummary: fetchCycleSummary
  };
}

// Hook especializado para listas de grados por ciclo
export function useGradeCycleList() {
  const {
    state: { gradeCycles, loading, error, filters },
    fetchGradeCyclesByCycle,
    setFilters,
    removeGradeCycle
  } = useGradeCycleContext();

  const handleFilterChange = useCallback(async (newFilters: GradeCycleFilters) => {
    setFilters(newFilters);
    if (newFilters.cycleId) {
      await fetchGradeCyclesByCycle(newFilters.cycleId);
    }
  }, [setFilters, fetchGradeCyclesByCycle]);

  const handleDelete = useCallback(async (cycleId: number, gradeId: number) => {
    if (window.confirm('¿Estás seguro de que deseas remover este grado del ciclo?')) {
      return await removeGradeCycle(cycleId, gradeId);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeGradeCycle]);

  return {
    gradeCycles,
    loading,
    error,
    filters,
    handleFilterChange,
    handleDelete,
    refetch: () => {
      if (filters.cycleId) {
        return fetchGradeCyclesByCycle(filters.cycleId);
      }
    }
  };
}