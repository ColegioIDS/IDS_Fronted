// src/contexts/TeacherContext.tsx - Con nombres corregidos
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { User } from '@/types/user';
import {
  getAllTeachers,
  fetchTeacherAvailabilityData,
  getTeacherStats,
  getTeacherWorkload,
  assignTeacherToSection,
  removeTeacherFromSection,
  TeacherAvailabilityResponse
} from '@/services/teacherService';

// Extender User para incluir propiedades específicas de profesores
interface Teacher extends User {
  guidedSections?: any[];
  assignedSchedules?: any[];
  currentAssignment?: {
    sectionId: number;
    sectionName: string;
    gradeName: string;
    gradeLevel: string;
  } | null;
}

interface TeacherFilters {
  available?: boolean;
  excludeSectionId?: number;
  gradeId?: number;
  hasSection?: boolean;
  isHomeroomTeacher?: boolean;
}

// Estado del contexto
interface TeacherState {
  // Data
  teachers: Teacher[];
  availabilityData: TeacherAvailabilityResponse | null;
  currentTeacher: Teacher | null;
  teacherWorkload: any | null;
  stats: any | null;
  
  // Estados de carga
  loading: boolean;
  loadingAvailability: boolean;
  loadingWorkload: boolean;
  loadingStats: boolean;
  submitting: boolean;
  
  // Estados de error
  error: string | null;
  
  // Filtros actuales
  filters: TeacherFilters;
  
  // Estado de formularios
  formMode: 'assign' | 'remove' | null;
  selectedTeacherId: number | null;
  selectedSectionId: number | null;
}

type TeacherAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_AVAILABILITY'; payload: boolean }
  | { type: 'SET_LOADING_WORKLOAD'; payload: boolean }
  | { type: 'SET_LOADING_STATS'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TEACHERS'; payload: Teacher[] }
  | { type: 'SET_AVAILABILITY_DATA'; payload: TeacherAvailabilityResponse }
  | { type: 'SET_CURRENT_TEACHER'; payload: Teacher | null }
  | { type: 'SET_TEACHER_WORKLOAD'; payload: any | null }
  | { type: 'SET_STATS'; payload: any | null }
  | { type: 'SET_FILTERS'; payload: TeacherFilters }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'assign' | 'remove' | null; teacherId?: number; sectionId?: number } }
  | { type: 'UPDATE_TEACHER_ASSIGNMENT'; payload: { teacherId: number; sectionId: number; action: 'assign' | 'remove' } }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: TeacherState = {
  teachers: [],
  availabilityData: null,
  currentTeacher: null,
  teacherWorkload: null,
  stats: null,
  loading: false,
  loadingAvailability: false,
  loadingWorkload: false,
  loadingStats: false,
  submitting: false,
  error: null,
  filters: {},
  formMode: null,
  selectedTeacherId: null,
  selectedSectionId: null
};

// Reducer
function teacherReducer(state: TeacherState, action: TeacherAction): TeacherState {
  
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_LOADING_AVAILABILITY':
      return { ...state, loadingAvailability: action.payload };
      
    case 'SET_LOADING_WORKLOAD':
      return { ...state, loadingWorkload: action.payload };
      
    case 'SET_LOADING_STATS':
      return { ...state, loadingStats: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_TEACHERS':
      return {
        ...state,
        teachers: action.payload,
        loading: false,
        error: null
      };
      
    case 'SET_AVAILABILITY_DATA':
      console.log('📊 Setting availability data:', action.payload);
      return {
        ...state,
        availabilityData: action.payload,
        loadingAvailability: false,
        error: null
      };
      
    case 'SET_CURRENT_TEACHER':
      return { ...state, currentTeacher: action.payload };
      
    case 'SET_TEACHER_WORKLOAD':
      return { ...state, teacherWorkload: action.payload, loadingWorkload: false };
      
    case 'SET_STATS':
      return { ...state, stats: action.payload, loadingStats: false };
      
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
      
    case 'SET_FORM_MODE':
      return {
        ...state,
        formMode: action.payload.mode,
        selectedTeacherId: action.payload.teacherId || null,
        selectedSectionId: action.payload.sectionId || null
      };
      
    case 'UPDATE_TEACHER_ASSIGNMENT':
      const { teacherId, sectionId, action: assignmentAction } = action.payload;
      return {
        ...state,
        teachers: state.teachers.map(teacher => {
          if (teacher.id === teacherId) {
            if (assignmentAction === 'assign') {
              return { ...teacher };
            } else {
              return { ...teacher };
            }
          }
          return teacher;
        })
      };
      
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
  fetchAllTeachers: () => Promise<void>;
  fetchTeacherAvailability: (excludeSectionId?: number) => Promise<void>;
  fetchTeacherWorkload: (teacherId: number) => Promise<void>;
  fetchTeacherStats: () => Promise<void>;
  
  // Acciones de asignación
  assignTeacher: (teacherId: number, sectionId: number) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  removeTeacher: (sectionId: number) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de UI
  setFilters: (filters: TeacherFilters) => void;
  setFormMode: (mode: 'assign' | 'remove' | null, teacherId?: number, sectionId?: number) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshTeachers: () => Promise<void>;
  refreshAvailability: (excludeSectionId?: number) => Promise<void>;
  getTeacherById: (id: number) => Teacher | undefined;
  getAvailableTeachersList: () => Teacher[];
  getAssignedTeachersList: () => Teacher[];
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
    console.error('❌ TeacherContext Error:', error);
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // CORREGIDO: Renombrado para evitar confusión
  const fetchAllTeachers = useCallback(async () => {
    console.log('🚀 fetchAllTeachers called');
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await getAllTeachers();
      console.log('📥 getAllTeachers response:', data);
      
      // Convertir User[] a Teacher[]
      const teachers: Teacher[] = data.map(user => ({
        ...user,
        guidedSections: (user as any).guidedSections || [],
        assignedSchedules: (user as any).assignedSchedules || []
      }));
      
      dispatch({ type: 'SET_TEACHERS', payload: teachers });
    } catch (error) {
      handleError(error, 'Error al cargar los profesores');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  // CORREGIDO: Usar la función con nombre único
  const fetchTeacherAvailability = useCallback(async (excludeSectionId?: number) => {
    console.log('🚀 fetchTeacherAvailability called with excludeSectionId:', excludeSectionId);
    try {
      dispatch({ type: 'SET_LOADING_AVAILABILITY', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      console.log('📞 Calling fetchTeacherAvailabilityData...');
      const availabilityData = await fetchTeacherAvailabilityData(excludeSectionId);
      console.log('📥 fetchTeacherAvailabilityData response:', availabilityData);
      
      console.log('✅ Availability data validation passed, dispatching...');
      dispatch({ type: 'SET_AVAILABILITY_DATA', payload: availabilityData });
      
    } catch (error) {
      console.error('💥 fetchTeacherAvailability error:', error);
      handleError(error, 'Error al cargar profesores disponibles');
    } finally {
      dispatch({ type: 'SET_LOADING_AVAILABILITY', payload: false });
    }
  }, [handleError]);

  const fetchTeacherWorkloadAction = useCallback(async (teacherId: number) => {
    try {
      dispatch({ type: 'SET_LOADING_WORKLOAD', payload: true });
      
      const workloadData = await getTeacherWorkload(teacherId);
      dispatch({ type: 'SET_TEACHER_WORKLOAD', payload: workloadData });
    } catch (error) {
      handleError(error, 'Error al cargar la carga de trabajo del profesor');
    } finally {
      dispatch({ type: 'SET_LOADING_WORKLOAD', payload: false });
    }
  }, [handleError]);

  const fetchTeacherStatsAction = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING_STATS', payload: true });
      
      const statsData = await getTeacherStats();
      dispatch({ type: 'SET_STATS', payload: statsData });
    } catch (error) {
      handleError(error, 'Error al cargar las estadísticas de profesores');
    } finally {
      dispatch({ type: 'SET_LOADING_STATS', payload: false });
    }
  }, [handleError]);

  // Acciones de asignación
  const assignTeacherAction = useCallback(async (teacherId: number, sectionId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await assignTeacherToSection(teacherId, sectionId);
      
      dispatch({ 
        type: 'UPDATE_TEACHER_ASSIGNMENT', 
        payload: { teacherId, sectionId, action: 'assign' } 
      });
      
      toast.success("Profesor asignado correctamente");
      
      await fetchAllTeachers();
      if (state.availabilityData) {
        await fetchTeacherAvailability();
      }
      
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al asignar el profesor');
      return {
        success: false,
        message,
        details: error.response?.data?.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, fetchAllTeachers, fetchTeacherAvailability, state.availabilityData]);

  const removeTeacherAction = useCallback(async (sectionId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await removeTeacherFromSection(sectionId);
      
      toast.success("Profesor removido correctamente");
      
      await fetchAllTeachers();
      if (state.availabilityData) {
        await fetchTeacherAvailability();
      }
      
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al remover el profesor');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, fetchAllTeachers, fetchTeacherAvailability, state.availabilityData]);

  // Acciones de UI
  const setFilters = useCallback((filters: TeacherFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setFormMode = useCallback((mode: 'assign' | 'remove' | null, teacherId?: number, sectionId?: number) => {
    dispatch({ type: 'SET_FORM_MODE', payload: { mode, teacherId, sectionId } });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Utilidades - CORREGIDO: nombres únicos para evitar confusión
  const refreshTeachers = useCallback(async () => {
    await fetchAllTeachers();
  }, [fetchAllTeachers]);

  const refreshAvailability = useCallback(async (excludeSectionId?: number) => {
    await fetchTeacherAvailability(excludeSectionId);
  }, [fetchTeacherAvailability]);

  const getTeacherById = useCallback((id: number) => {
    return state.teachers.find(teacher => teacher.id === id);
  }, [state.teachers]);

  // CORREGIDO: nombres únicos para las utilidades
  const getAvailableTeachersList = useCallback(() => {
    const available = state.availabilityData?.available || [];
    console.log('🎯 getAvailableTeachersList returning:', available);
    return available;
  }, [state.availabilityData]);

  const getAssignedTeachersList = useCallback(() => {
    const assigned = state.availabilityData?.assigned || [];
    console.log('🎯 getAssignedTeachersList returning:', assigned);
    return assigned;
  }, [state.availabilityData]);

  // Valor del contexto
  const contextValue: TeacherContextType = {
    state,
    
    // Acciones de datos - CORREGIDO: nombres únicos
    fetchAllTeachers,
    fetchTeacherAvailability,
    fetchTeacherWorkload: fetchTeacherWorkloadAction,
    fetchTeacherStats: fetchTeacherStatsAction,
    
    // Acciones de asignación
    assignTeacher: assignTeacherAction,
    removeTeacher: removeTeacherAction,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    clearError,
    resetState,
    
    // Utilidades - CORREGIDO: nombres únicos
    refreshTeachers,
    refreshAvailability,
    getTeacherById,
    getAvailableTeachersList,
    getAssignedTeachersList
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

// Hook especializado para disponibilidad de profesores
export function useTeacherAvailabilityContext() {
  const {
    state: { availabilityData, loadingAvailability, error },
    fetchTeacherAvailability,
    getAvailableTeachersList,
    getAssignedTeachersList
  } = useTeacherContext();

  console.log('🎭 useTeacherAvailabilityContext hook state:', {
    availabilityData,
    loadingAvailability,
    error,
    available: getAvailableTeachersList(),
    assigned: getAssignedTeachersList()
  });

  return {
    availabilityData,
    loading: loadingAvailability,
    error,
    availableTeachers: getAvailableTeachersList(),
    assignedTeachers: getAssignedTeachersList(),
    fetchAvailability: fetchTeacherAvailability
  };
}

// Otros hooks especializados...
export function useTeacherAssignment() {
  const {
    state: { submitting, formMode, selectedTeacherId, selectedSectionId },
    assignTeacher,
    removeTeacher,
    setFormMode
  } = useTeacherContext();

  const handleAssign = useCallback(async (teacherId: number, sectionId: number) => {
    return await assignTeacher(teacherId, sectionId);
  }, [assignTeacher]);

  const handleRemove = useCallback(async (sectionId: number) => {
    return await removeTeacher(sectionId);
  }, [removeTeacher]);

  const startAssignment = useCallback((teacherId: number, sectionId: number) => {
    setFormMode('assign', teacherId, sectionId);
  }, [setFormMode]);

  const startRemoval = useCallback((sectionId: number) => {
    setFormMode('remove', undefined, sectionId);
  }, [setFormMode]);

  const cancelOperation = useCallback(() => {
    setFormMode(null);
  }, [setFormMode]);

  return {
    submitting,
    formMode,
    selectedTeacherId,
    selectedSectionId,
    handleAssign,
    handleRemove,
    startAssignment,
    startRemoval,
    cancelOperation
  };
}