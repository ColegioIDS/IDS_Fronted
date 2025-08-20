// src/contexts/GradeContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Grade,
  CreateGradeRequest,
  UpdateGradeRequest,
  GradeFilters,
  GradeResponse,
  GradeStats,
  GradeFormValues,
  GradeLevel
} from '@/types/grades';
import {
  getGrades,
  createGrade,
  updateGrade,
  getGradeById,
  deleteGrade,
  getGradesByLevel,
  getActiveGrades,
  getGradeStats
} from '@/services/gradeService';

// Estado del contexto
interface GradeState {
  // Data
  grades: Grade[];
  currentGrade: Grade | null;
  stats: GradeStats | null;
  
  // Meta información
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  
  // Estados de carga
  loading: boolean;
  submitting: boolean;
  loadingStats: boolean;
  
  // Estados de error
  error: string | null;
  
  // Filtros actuales
  filters: GradeFilters;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | null;
  editingId: number | null;
}

// Acciones
type GradeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_LOADING_STATS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GRADES'; payload: { data: Grade[]; meta: GradeState['meta'] } }
  | { type: 'ADD_GRADE'; payload: Grade }
  | { type: 'UPDATE_GRADE'; payload: { id: number; data: Grade } }
  | { type: 'REMOVE_GRADE'; payload: number }
  | { type: 'SET_CURRENT_GRADE'; payload: Grade | null }
  | { type: 'SET_STATS'; payload: GradeStats | null }
  | { type: 'SET_FILTERS'; payload: GradeFilters }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | null; editingId?: number } }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: GradeState = {
  grades: [],
  currentGrade: null,
  stats: null,
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  loading: false,
  submitting: false,
  loadingStats: false,
  error: null,
  filters: {},
  formMode: null,
  editingId: null
};

// Reducer
function gradeReducer(state: GradeState, action: GradeAction): GradeState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_LOADING_STATS':
      return { ...state, loadingStats: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_GRADES':
      return {
        ...state,
        grades: action.payload.data,
        meta: action.payload.meta,
        loading: false,
        error: null
      };
      
    case 'ADD_GRADE':
      return {
        ...state,
        grades: [action.payload, ...state.grades],
        meta: {
          ...state.meta,
          total: state.meta.total + 1
        }
      };
      
    case 'UPDATE_GRADE':
      return {
        ...state,
        grades: state.grades.map(grade =>
          grade.id === action.payload.id ? action.payload.data : grade
        ),
        currentGrade: state.currentGrade?.id === action.payload.id 
          ? action.payload.data 
          : state.currentGrade
      };
      
    case 'REMOVE_GRADE':
      return {
        ...state,
        grades: state.grades.filter(grade => grade.id !== action.payload),
        meta: {
          ...state.meta,
          total: Math.max(0, state.meta.total - 1)
        }
      };
      
    case 'SET_CURRENT_GRADE':
      return { ...state, currentGrade: action.payload };
      
    case 'SET_STATS':
      return { ...state, stats: action.payload, loadingStats: false };
      
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
      
    case 'SET_FORM_MODE':
      return {
        ...state,
        formMode: action.payload.mode,
        editingId: action.payload.editingId || null
      };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Tipos del contexto
interface GradeContextType {
  // Estado
  state: GradeState;
  
  // Acciones de datos
  fetchGrades: (filters?: GradeFilters) => Promise<void>;
  fetchGradeById: (id: number) => Promise<void>;
  fetchGradesByLevel: (level: GradeLevel, filters?: Omit<GradeFilters, 'level'>) => Promise<void>;
  fetchActiveGrades: (filters?: GradeFilters) => Promise<void>;
  fetchGradeStats: () => Promise<void>;
  
  // Acciones CRUD
  createGrade: (data: CreateGradeRequest) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateGrade: (id: number, data: UpdateGradeRequest) => Promise<{ success: boolean; message?: string }>;
  removeGrade: (id: number) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de UI
  setFilters: (filters: GradeFilters) => void;
  setFormMode: (mode: 'create' | 'edit' | null, editingId?: number) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshGrades: () => Promise<void>;
  getGradeById: (id: number) => Grade | undefined;
}

// Crear contexto
const GradeContext = createContext<GradeContextType | undefined>(undefined);

// Provider del contexto
interface GradeProviderProps {
  children: ReactNode;
}

export function GradeProvider({ children }: GradeProviderProps) {
  const [state, dispatch] = useReducer(gradeReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Función auxiliar para normalizar respuestas
  const normalizeResponse = useCallback((response: any) => {
    if (Array.isArray(response)) {
      return {
        data: response,
        meta: {
          total: response.length,
          page: 1,
          limit: response.length,
          totalPages: 1
        }
      };
    }
    return response;
  }, []);

  // Acciones de datos
  const fetchGrades = useCallback(async (filters?: GradeFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getGrades(filters);
      const normalizedResponse = normalizeResponse(response);
      
      dispatch({
        type: 'SET_GRADES',
        payload: normalizedResponse
      });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      handleError(error, 'Error al cargar los grados');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeResponse]);

  const fetchGradeById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const grade = await getGradeById(id);
      dispatch({ type: 'SET_CURRENT_GRADE', payload: grade });
    } catch (error) {
      handleError(error, 'Error al cargar el grado');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchGradesByLevel = useCallback(async (
    level: GradeLevel, 
    filters?: Omit<GradeFilters, 'level'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getGradesByLevel(level, filters);
      const normalizedResponse = normalizeResponse(response);
      
      dispatch({
        type: 'SET_GRADES',
        payload: normalizedResponse
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, level } });
    } catch (error) {
      handleError(error, 'Error al cargar los grados del nivel');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeResponse]);

  const fetchActiveGrades = useCallback(async (filters?: GradeFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getActiveGrades(filters);
      const normalizedResponse = normalizeResponse(response);
      
      dispatch({
        type: 'SET_GRADES',
        payload: normalizedResponse
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, isActive: true } });
    } catch (error) {
      handleError(error, 'Error al cargar los grados activos');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeResponse]);

  const fetchGradeStats = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING_STATS', payload: true });
      
      const stats = await getGradeStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      handleError(error, 'Error al cargar las estadísticas de grados');
    } finally {
      dispatch({ type: 'SET_LOADING_STATS', payload: false });
    }
  }, [handleError]);

  // Acciones CRUD
  const createGradeAction = useCallback(async (data: CreateGradeRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newGrade = await createGrade(data);
      dispatch({ type: 'ADD_GRADE', payload: newGrade });
      
      toast.success("Grado creado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al crear el grado');
      return {
        success: false,
        message,
        details: error.response?.data?.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateGradeAction = useCallback(async (id: number, data: UpdateGradeRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedGrade = await updateGrade(id, data);
      dispatch({
        type: 'UPDATE_GRADE',
        payload: { id, data: updatedGrade }
      });
      
      toast.success("Grado actualizado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar el grado');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeGrade = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteGrade(id);
      dispatch({ type: 'REMOVE_GRADE', payload: id });
      
      toast.success("Grado eliminado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar el grado');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Acciones de UI
  const setFilters = useCallback((filters: GradeFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setFormMode = useCallback((mode: 'create' | 'edit' | null, editingId?: number) => {
    dispatch({ type: 'SET_FORM_MODE', payload: { mode, editingId } });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Utilidades
  const refreshGrades = useCallback(async () => {
    await fetchGrades(state.filters);
  }, [fetchGrades, state.filters]);

  const getGradeByIdFromState = useCallback((id: number) => {
    return state.grades.find(grade => grade.id === id);
  }, [state.grades]);

  // Valor del contexto
  const contextValue: GradeContextType = {
    state,
    
    // Acciones de datos
    fetchGrades,
    fetchGradeById,
    fetchGradesByLevel,
    fetchActiveGrades,
    fetchGradeStats,
    
    // Acciones CRUD
    createGrade: createGradeAction,
    updateGrade: updateGradeAction,
    removeGrade,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    clearError,
    resetState,
    
    // Utilidades
    refreshGrades,
    getGradeById: getGradeByIdFromState
  };

  return (
    <GradeContext.Provider value={contextValue}>
      {children}
    </GradeContext.Provider>
  );
}

// Hook para usar el contexto
export function useGradeContext() {
  const context = useContext(GradeContext);
  if (context === undefined) {
    throw new Error('useGradeContext must be used within a GradeProvider');
  }
  return context;
}

// Hook especializado para formularios
export function useGradeForm() {
  const {
    state: { submitting, formMode, editingId, currentGrade },
    createGrade,
    updateGrade,
    setFormMode,
    fetchGradeById
  } = useGradeContext();

  const handleSubmit = useCallback(async (data: CreateGradeRequest) => {
    if (formMode === 'edit' && editingId) {
      return await updateGrade(editingId, data);
    } else {
      return await createGrade(data);
    }
  }, [formMode, editingId, createGrade, updateGrade]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id);
    await fetchGradeById(id);
  }, [setFormMode, fetchGradeById]);

  const startCreate = useCallback(() => {
    setFormMode('create');
  }, [setFormMode]);

  const cancelForm = useCallback(() => {
    setFormMode(null);
  }, [setFormMode]);

  return {
    submitting,
    formMode,
    editingId,
    currentGrade,
    handleSubmit,
    startEdit,
    startCreate,
    cancelForm
  };
}

// Hook especializado para listas
export function useGradeList() {
  const {
    state: { grades, meta, loading, error, filters },
    fetchGrades,
    setFilters,
    removeGrade
  } = useGradeContext();

  const handleFilterChange = useCallback(async (newFilters: GradeFilters) => {
    setFilters(newFilters);
    await fetchGrades(newFilters);
  }, [setFilters, fetchGrades]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este grado?')) {
      return await removeGrade(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeGrade]);

  return {
    grades,
    meta,
    loading,
    error,
    filters,
    handleFilterChange,
    handleDelete,
    refetch: () => fetchGrades(filters)
  };
}

// Hook especializado para estadísticas
export function useGradeStatsContext() {
  const {
    state: { stats, loadingStats },
    fetchGradeStats
  } = useGradeContext();

  return {
    stats,
    loading: loadingStats,
    fetchStats: fetchGradeStats
  };
}


// Agregar al final de tu GradeContext.tsx

// Hook especializado para opciones de grados (para selects y filtros)
// Reemplaza el hook useGradeOptions en tu GradeContext.tsx

// Hook especializado para opciones de grados (para selects y filtros)
export function useGradeOptions() {
  const {
    state: { grades, loading, error },
    fetchGrades
  } = useGradeContext();

  // Cargar grados automáticamente si no están cargados
  useEffect(() => {
    if (grades.length === 0 && !loading && !error) {
      fetchGrades();
    }
  }, [grades.length, loading, error, fetchGrades]);

  // Crear opciones para selects
  const gradeOptions = grades.map(grade => ({
    value: grade.id,
    label: grade.name,
    level: grade.level
  }));

  // Filtrar por nivel si es necesario
  const getGradesByLevel = (level: GradeLevel) => {
    return grades.filter(grade => grade.level === level);
  };

  // Obtener solo grados activos
  const activeGrades = grades.filter(grade => grade.isActive);

  return {
    grades,
    gradeOptions,
    activeGrades,
    loading,
    error,
    getGradesByLevel
  };
}