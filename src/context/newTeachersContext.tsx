// src/contexts/TeacherContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { User } from '@/types/user';
import {
  fetchTeacherAvailabilityData,
  getAllTeachers,
  getTeachersBySection,
  getTeacherStats,
  getTeacherWorkload,
  assignTeacherToSection,
  removeTeacherFromSection,
  TeacherAvailabilityResponse
} from '@/services/teacherService';

// Tipos adicionales para filtros y stats
export interface TeacherFilters {
  isActive?: boolean;
  gradeId?: number;
  sectionId?: number;
  availability?: 'available' | 'assigned' | 'all';
  search?: string;
}

export interface TeacherStats {
  total: number;
  available: number;
  assigned: number;
  byGrade?: { [gradeId: number]: number };
  workloadDistribution?: {
    light: number;
    medium: number;
    heavy: number;
  };
}

export interface TeacherWorkload {
  teacherId: number;
  sections: any[];
  totalHours: number;
  gradeDistribution: { [grade: string]: number };
  status: 'light' | 'medium' | 'heavy';
}

// Interfaces para datos categorizados por sección
export interface TeachersBySectionResponse {
  titular: User | null;
  all: User[];
  otherTitular: User[];
  specialists: User[];
}

export interface TeacherOption {
  value: number;
  label: string;
  email: string | undefined;
  type: 'titular' | 'otherTitular' | 'specialist';
  teacher: User;
  sections: any[];
}

// Estado del contexto
interface TeacherState {
  // Data
  teachers: User[];
  availabilityData: TeacherAvailabilityResponse | null;
  currentTeacher: User | null;
  currentWorkload: TeacherWorkload | null;
  stats: TeacherStats | null;
  
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
  loadingWorkload: boolean;
  loadingAvailability: boolean;
  
  // Estados de error
  error: string | null;
  
  // Filtros actuales
  filters: TeacherFilters;
  
  // Estado de formularios/acciones
  actionMode: 'assign' | 'remove' | null;
  selectedSectionId: number | null;
}

// Acciones
type TeacherAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_LOADING_STATS'; payload: boolean }
  | { type: 'SET_LOADING_WORKLOAD'; payload: boolean }
  | { type: 'SET_LOADING_AVAILABILITY'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TEACHERS'; payload: { data: User[]; meta: TeacherState['meta'] } }
  | { type: 'SET_AVAILABILITY_DATA'; payload: TeacherAvailabilityResponse }
  | { type: 'SET_CURRENT_TEACHER'; payload: User | null }
  | { type: 'SET_CURRENT_WORKLOAD'; payload: TeacherWorkload | null }
  | { type: 'SET_STATS'; payload: TeacherStats | null }
  | { type: 'SET_FILTERS'; payload: TeacherFilters }
  | { type: 'SET_ACTION_MODE'; payload: { mode: 'assign' | 'remove' | null; sectionId?: number } }
  | { type: 'UPDATE_TEACHER_ASSIGNMENT'; payload: { teacherId: number; sectionId: number; action: 'assign' | 'remove' } }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: TeacherState = {
  teachers: [],
  availabilityData: null,
  currentTeacher: null,
  currentWorkload: null,
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
  loadingWorkload: false,
  loadingAvailability: false,
  error: null,
  filters: {},
  actionMode: null,
  selectedSectionId: null
};

// Reducer
function teacherReducer(state: TeacherState, action: TeacherAction): TeacherState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_LOADING_STATS':
      return { ...state, loadingStats: action.payload };
      
    case 'SET_LOADING_WORKLOAD':
      return { ...state, loadingWorkload: action.payload };
      
    case 'SET_LOADING_AVAILABILITY':
      return { ...state, loadingAvailability: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_TEACHERS':
      return {
        ...state,
        teachers: action.payload.data,
        meta: action.payload.meta,
        loading: false,
        error: null
      };
      
    case 'SET_AVAILABILITY_DATA':
      return {
        ...state,
        availabilityData: action.payload,
        loadingAvailability: false,
        error: null
      };
      
    case 'SET_CURRENT_TEACHER':
      return { ...state, currentTeacher: action.payload };
      
    case 'SET_CURRENT_WORKLOAD':
      return { ...state, currentWorkload: action.payload, loadingWorkload: false };
      
    case 'SET_STATS':
      return { ...state, stats: action.payload, loadingStats: false };
      
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
      
    case 'SET_ACTION_MODE':
      return {
        ...state,
        actionMode: action.payload.mode,
        selectedSectionId: action.payload.sectionId || null
      };
      
    case 'UPDATE_TEACHER_ASSIGNMENT':
      // Actualizar datos de availability si existen
      if (state.availabilityData) {
        const { teacherId, action: assignAction } = action.payload;
        const teacher = [...state.availabilityData.available, ...state.availabilityData.assigned]
          .find(t => t.id === teacherId);
        
        if (teacher) {
          const newAvailabilityData = { ...state.availabilityData };
          
          if (assignAction === 'assign') {
            newAvailabilityData.available = newAvailabilityData.available.filter(t => t.id !== teacherId);
            newAvailabilityData.assigned = [...newAvailabilityData.assigned, teacher];
            newAvailabilityData.stats.available--;
            newAvailabilityData.stats.assigned++;
          } else {
            newAvailabilityData.assigned = newAvailabilityData.assigned.filter(t => t.id !== teacherId);
            newAvailabilityData.available = [...newAvailabilityData.available, teacher];
            newAvailabilityData.stats.available++;
            newAvailabilityData.stats.assigned--;
          }
          
          return { ...state, availabilityData: newAvailabilityData };
        }
      }
      return state;
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Tipos del contexto
interface TeacherContextType {
  // Estado
  state: TeacherState;
  
  // Acciones de datos
  fetchTeachers: (filters?: TeacherFilters) => Promise<void>;
  fetchTeacherAvailability: (excludeSectionId?: number) => Promise<void>;
  fetchTeachersBySection: (sectionId: number | string) => Promise<TeachersBySectionResponse | null>;
  fetchTeacherStats: () => Promise<void>;
  fetchTeacherWorkload: (teacherId: number) => Promise<void>;
  
  // Acciones CRUD/Asignación
  assignTeacher: (teacherId: number, sectionId: number) => Promise<{ success: boolean; message?: string }>;
  removeTeacher: (sectionId: number) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de UI
  setFilters: (filters: TeacherFilters) => void;
  setActionMode: (mode: 'assign' | 'remove' | null, sectionId?: number) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshTeachers: () => Promise<void>;
  refreshAvailability: () => Promise<void>;
  getTeacherById: (id: number) => User | undefined;
}

// Crear contexto
const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

// Provider del contexto
interface TeacherProviderProps {
  children: ReactNode;
}

export function TeacherProvider({ children }: TeacherProviderProps) {
  const [state, dispatch] = useReducer(teacherReducer, initialState);

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
  const fetchTeachers = useCallback(async (filters?: TeacherFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getAllTeachers();
      const normalizedResponse = normalizeResponse(response);
      
      dispatch({
        type: 'SET_TEACHERS',
        payload: normalizedResponse
      });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      handleError(error, 'Error al cargar los profesores');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeResponse]);

  const fetchTeacherAvailability = useCallback(async (excludeSectionId?: number) => {
    try {
      dispatch({ type: 'SET_LOADING_AVAILABILITY', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const availabilityData = await fetchTeacherAvailabilityData(excludeSectionId);
      dispatch({ type: 'SET_AVAILABILITY_DATA', payload: availabilityData });
    } catch (error) {
      handleError(error, 'Error al cargar la disponibilidad de profesores');
    } finally {
      dispatch({ type: 'SET_LOADING_AVAILABILITY', payload: false });
    }
  }, [handleError]);

  const fetchTeachersBySectionAction = useCallback(async (sectionId: number | string): Promise<TeachersBySectionResponse | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // getTeachersBySection devuelve la estructura categorizada completa
      const sectionData = await getTeachersBySection(sectionId);
      
      // Extraer el array 'all' para mantener compatibilidad con el estado
      const allTeachers = sectionData.all || [];
      const normalizedResponse = normalizeResponse(allTeachers);
      
      dispatch({
        type: 'SET_TEACHERS',
        payload: normalizedResponse
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { sectionId: Number(sectionId) } });
      
      // Retornar la estructura completa para uso directo en hooks
      return sectionData;
    } catch (error) {
      handleError(error, 'Error al cargar los profesores de la sección');
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeResponse]);

  const fetchTeacherStatsAction = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING_STATS', payload: true });
      
      const stats = await getTeacherStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      handleError(error, 'Error al cargar las estadísticas de profesores');
    } finally {
      dispatch({ type: 'SET_LOADING_STATS', payload: false });
    }
  }, [handleError]);

  const fetchTeacherWorkloadAction = useCallback(async (teacherId: number) => {
    try {
      dispatch({ type: 'SET_LOADING_WORKLOAD', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const workload = await getTeacherWorkload(teacherId);
      dispatch({ type: 'SET_CURRENT_WORKLOAD', payload: workload });
    } catch (error) {
      handleError(error, 'Error al cargar la carga de trabajo del profesor');
    } finally {
      dispatch({ type: 'SET_LOADING_WORKLOAD', payload: false });
    }
  }, [handleError]);

  // Acciones CRUD/Asignación
  const assignTeacher = useCallback(async (teacherId: number, sectionId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await assignTeacherToSection(teacherId, sectionId);
      
      // Actualizar estado local
      dispatch({
        type: 'UPDATE_TEACHER_ASSIGNMENT',
        payload: { teacherId, sectionId, action: 'assign' }
      });
      
      toast.success("Profesor asignado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al asignar profesor');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeTeacher = useCallback(async (sectionId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await removeTeacherFromSection(sectionId);
      
      toast.success("Profesor removido correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al remover profesor');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Acciones de UI
  const setFilters = useCallback((filters: TeacherFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setActionMode = useCallback((mode: 'assign' | 'remove' | null, sectionId?: number) => {
    dispatch({ type: 'SET_ACTION_MODE', payload: { mode, sectionId } });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Utilidades
  const refreshTeachers = useCallback(async () => {
    await fetchTeachers(state.filters);
  }, [fetchTeachers, state.filters]);

  const refreshAvailability = useCallback(async () => {
    await fetchTeacherAvailability(state.selectedSectionId || undefined);
  }, [fetchTeacherAvailability, state.selectedSectionId]);

  const getTeacherById = useCallback((id: number) => {
    return state.teachers.find(teacher => teacher.id === id) ||
           state.availabilityData?.available.find(teacher => teacher.id === id) ||
           state.availabilityData?.assigned.find(teacher => teacher.id === id);
  }, [state.teachers, state.availabilityData]);

  // Valor del contexto
  const contextValue: TeacherContextType = {
    state,
    
    // Acciones de datos
    fetchTeachers,
    fetchTeacherAvailability,
    fetchTeachersBySection: fetchTeachersBySectionAction,
    fetchTeacherStats: fetchTeacherStatsAction,
    fetchTeacherWorkload: fetchTeacherWorkloadAction,
    
    // Acciones CRUD/Asignación
    assignTeacher,
    removeTeacher,
    
    // Acciones de UI
    setFilters,
    setActionMode,
    clearError,
    resetState,
    
    // Utilidades
    refreshTeachers,
    refreshAvailability,
    getTeacherById
  };

  return (
    <TeacherContext.Provider value={contextValue}>
      {children}
    </TeacherContext.Provider>
  );
}

// Hook para usar el contexto
export function useTeacherContext() {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error('useTeacherContext must be used within a TeacherProvider');
  }
  return context;
}

// Hook especializado para asignación de profesores
export function useTeacherAssignment() {
  const {
    state: { submitting, actionMode, selectedSectionId, availabilityData, loadingAvailability },
    assignTeacher,
    removeTeacher,
    setActionMode,
    fetchTeacherAvailability
  } = useTeacherContext();

  const startAssignment = useCallback((sectionId: number) => {
    setActionMode('assign', sectionId);
    fetchTeacherAvailability(sectionId);
  }, [setActionMode, fetchTeacherAvailability]);

  const startRemoval = useCallback((sectionId: number) => {
    setActionMode('remove', sectionId);
  }, [setActionMode]);

  const cancelAction = useCallback(() => {
    setActionMode(null);
  }, [setActionMode]);

  const handleAssign = useCallback(async (teacherId: number) => {
    if (selectedSectionId) {
      return await assignTeacher(teacherId, selectedSectionId);
    }
    return { success: false, message: 'No hay sección seleccionada' };
  }, [assignTeacher, selectedSectionId]);

  const handleRemove = useCallback(async () => {
    if (selectedSectionId) {
      return await removeTeacher(selectedSectionId);
    }
    return { success: false, message: 'No hay sección seleccionada' };
  }, [removeTeacher, selectedSectionId]);

  return {
    submitting,
    actionMode,
    selectedSectionId,
    availabilityData,
    loadingAvailability,
    startAssignment,
    startRemoval,
    cancelAction,
    handleAssign,
    handleRemove
  };
}

// Hook especializado para listas de profesores
export function useTeacherList() {
  const {
    state: { teachers, meta, loading, error, filters },
    fetchTeachers,
    setFilters
  } = useTeacherContext();

  const handleFilterChange = useCallback(async (newFilters: TeacherFilters) => {
    setFilters(newFilters);
    await fetchTeachers(newFilters);
  }, [setFilters, fetchTeachers]);

  return {
    teachers,
    meta,
    loading,
    error,
    filters,
    handleFilterChange,
    refetch: () => fetchTeachers(filters)
  };
}

// Hook especializado para estadísticas de profesores
export function useTeacherStats() {
  const {
    state: { stats, loadingStats },
    fetchTeacherStats
  } = useTeacherContext();

  return {
    stats,
    loading: loadingStats,
    fetchStats: fetchTeacherStats
  };
}

// Hook especializado para opciones de profesores (para selects básicos)
export function useTeacherOptions() {
  const {
    state: { teachers, availabilityData, loading, error },
    fetchTeachers,
    fetchTeacherAvailability
  } = useTeacherContext();

  // Cargar profesores automáticamente si no están cargados
  useEffect(() => {
    if (teachers.length === 0 && !loading && !error) {
      fetchTeachers();
    }
  }, [teachers.length, loading, error, fetchTeachers]);

  // Crear opciones para selects
  const teacherOptions = teachers.map(teacher => ({
    value: teacher.id,
    label: `${teacher.givenNames} ${teacher.lastNames}`,
    email: teacher.email || '',
    isActive: teacher.isActive
  }));

  // Opciones de profesores disponibles
  const availableTeacherOptions = availabilityData?.available.map(teacher => ({
    value: teacher.id,
    label: `${teacher.givenNames} ${teacher.lastNames}`,
    email: teacher.email || ''
  })) || [];

  // Obtener solo profesores activos
  const activeTeachers = teachers.filter(teacher => teacher.isActive);

  return {
    teachers,
    teacherOptions,
    availableTeacherOptions,
    activeTeachers,
    availabilityData,
    loading,
    error,
    loadAvailability: fetchTeacherAvailability
  };
}

// Hook especializado para profesores por sección con datos categorizados
export function useTeachersBySection(sectionId?: number) {
  const [categorizedTeachers, setCategorizedTeachers] = useState<TeachersBySectionResponse>({
    titular: null,
    all: [],
    otherTitular: [],
    specialists: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar profesores de la sección cuando cambie sectionId
  useEffect(() => {
    if (sectionId) {
      const loadTeachers = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const sectionData = await getTeachersBySection(sectionId);
          
          setCategorizedTeachers({
            titular: sectionData.titular || null,
            all: sectionData.all || [],
            otherTitular: sectionData.otherTitular || [],
            specialists: sectionData.specialists || []
          });
        } catch (err: any) {
          setError(err.message || 'Error al cargar profesores');
        } finally {
          setLoading(false);
        }
      };

      loadTeachers();
    }
  }, [sectionId]);

  // Crear opciones categorizadas para el select
  const categorizedOptions = useMemo(() => {
    const createTeacherOption = (teacher: User, type: 'titular' | 'otherTitular' | 'specialist'): TeacherOption => ({
      value: teacher.id,
      label: `${teacher.givenNames} ${teacher.lastNames}`,
      email: teacher.email,
      type,
      teacher,
      sections: (teacher as any).guidedSections || []
    });

    return {
      titular: categorizedTeachers.titular ? [createTeacherOption(categorizedTeachers.titular, 'titular')] : [],
      otherTitular: categorizedTeachers.otherTitular.map(teacher => createTeacherOption(teacher, 'otherTitular')),
      specialists: categorizedTeachers.specialists.map(teacher => createTeacherOption(teacher, 'specialist'))
    };
  }, [categorizedTeachers]);

  // Función para obtener un profesor por ID de cualquier categoría
  const getTeacherById = useCallback((teacherId: number) => {
    return categorizedTeachers.all.find(teacher => teacher.id === teacherId);
  }, [categorizedTeachers.all]);

  // Obtener el maestro titular por defecto
  const defaultTeacher = categorizedTeachers.titular;

  const refetch = useCallback(() => {
    if (sectionId) {
      // Re-trigger the effect by resetting state
      setCategorizedTeachers({
        titular: null,
        all: [],
        otherTitular: [],
        specialists: []
      });
    }
  }, [sectionId]);

  return {
    categorized: categorizedOptions,
    raw: categorizedTeachers,
    loading,
    error,
    getTeacherById,
    defaultTeacher,
    refetch
  };
}

// Hook especializado para carga de trabajo
export function useTeacherWorkload() {
  const {
    state: { currentWorkload, loadingWorkload, currentTeacher },
    fetchTeacherWorkload
  } = useTeacherContext();

  const loadWorkload = useCallback(async (teacherId: number) => {
    await fetchTeacherWorkload(teacherId);
  }, [fetchTeacherWorkload]);

  return {
    workload: currentWorkload,
    loading: loadingWorkload,
    teacher: currentTeacher,
    loadWorkload
  };
}