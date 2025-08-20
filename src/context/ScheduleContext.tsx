// src/contexts/ScheduleContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { Schedule, ScheduleFormValues } from '@/types/schedules';
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  getScheduleById,
  deleteSchedule,
  getSchedulesBySection,
  getSchedulesByTeacher,
  batchSaveSchedules,
  deleteSchedulesBySection
} from '@/services/schedule';

// Tipos para filtros de horarios
interface ScheduleFilters {
  sectionId?: number;
  courseId?: number;
  teacherId?: number;
  dayOfWeek?: number;
}

// Estado del contexto
interface ScheduleState {
  // Data
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  
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
  
  // Estados de error
  error: string | null;
  
  // Filtros actuales
  filters: ScheduleFilters;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | 'batch' | null;
  editingId: number | null;
  
  // Para manejo de horarios por sección
  selectedSection: number | null;
  sectionSchedules: Schedule[];
}

// Acciones
type ScheduleAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SCHEDULES'; payload: { data: Schedule[]; meta?: ScheduleState['meta'] } }
  | { type: 'ADD_SCHEDULE'; payload: Schedule }
  | { type: 'ADD_BATCH_SCHEDULES'; payload: Schedule[] }
  | { type: 'UPDATE_SCHEDULE'; payload: { id: number; data: Schedule } }
  | { type: 'REMOVE_SCHEDULE'; payload: number }
  | { type: 'SET_CURRENT_SCHEDULE'; payload: Schedule | null }
  | { type: 'SET_FILTERS'; payload: ScheduleFilters }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | 'batch' | null; editingId?: number } }
  | { type: 'SET_SELECTED_SECTION'; payload: number | null }
  | { type: 'SET_SECTION_SCHEDULES'; payload: Schedule[] }
  | { type: 'CLEAR_SECTION_SCHEDULES' }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: ScheduleState = {
  schedules: [],
  currentSchedule: null,
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  loading: false,
  submitting: false,
  error: null,
  filters: {},
  formMode: null,
  editingId: null,
  selectedSection: null,
  sectionSchedules: []
};

// Reducer
function scheduleReducer(state: ScheduleState, action: ScheduleAction): ScheduleState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_SCHEDULES':
      return {
        ...state,
        schedules: action.payload.data,
        meta: action.payload.meta || state.meta,
        loading: false,
        error: null
      };
      
    case 'ADD_SCHEDULE':
      return {
        ...state,
        schedules: [action.payload, ...state.schedules],
        sectionSchedules: state.selectedSection === action.payload.sectionId 
          ? [action.payload, ...state.sectionSchedules]
          : state.sectionSchedules,
        meta: {
          ...state.meta,
          total: state.meta.total + 1
        }
      };
      
    case 'ADD_BATCH_SCHEDULES':
      return {
        ...state,
        schedules: [...action.payload, ...state.schedules],
        sectionSchedules: state.selectedSection 
          ? action.payload.filter(s => s.sectionId === state.selectedSection)
          : state.sectionSchedules,
        meta: {
          ...state.meta,
          total: state.meta.total + action.payload.length
        }
      };
      
    case 'UPDATE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.map(schedule =>
          schedule.id === action.payload.id ? action.payload.data : schedule
        ),
        sectionSchedules: state.sectionSchedules.map(schedule =>
          schedule.id === action.payload.id ? action.payload.data : schedule
        ),
        currentSchedule: state.currentSchedule?.id === action.payload.id 
          ? action.payload.data 
          : state.currentSchedule
      };
      
    case 'REMOVE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.filter(schedule => schedule.id !== action.payload),
        sectionSchedules: state.sectionSchedules.filter(schedule => schedule.id !== action.payload),
        meta: {
          ...state.meta,
          total: Math.max(0, state.meta.total - 1)
        }
      };
      
    case 'SET_CURRENT_SCHEDULE':
      return { ...state, currentSchedule: action.payload };
      
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
      
    case 'SET_FORM_MODE':
      return {
        ...state,
        formMode: action.payload.mode,
        editingId: action.payload.editingId || null
      };
      
    case 'SET_SELECTED_SECTION':
      return { 
        ...state, 
        selectedSection: action.payload,
        sectionSchedules: []
      };
      
    case 'SET_SECTION_SCHEDULES':
      return { 
        ...state, 
        sectionSchedules: action.payload,
        loading: false,
        error: null
      };
      
    case 'CLEAR_SECTION_SCHEDULES':
      return { 
        ...state, 
        sectionSchedules: [],
        selectedSection: null
      };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Tipos del contexto
interface ScheduleContextType {
  // Estado
  state: ScheduleState;
  
  // Acciones de datos
  fetchSchedules: (filters?: ScheduleFilters) => Promise<void>;
  fetchScheduleById: (id: number) => Promise<void>;
  fetchSchedulesBySection: (sectionId: number) => Promise<void>;
  fetchSchedulesByTeacher: (teacherId: number) => Promise<void>;
  
  // Acciones CRUD
  createSchedule: (data: ScheduleFormValues) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  createBatchSchedules: (data: ScheduleFormValues[]) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateSchedule: (id: number, data: Partial<ScheduleFormValues>) => Promise<{ success: boolean; message?: string }>;
  removeSchedule: (id: number) => Promise<{ success: boolean; message?: string }>;
  clearSectionSchedules: (sectionId: number, keepIds?: number[]) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de UI
  setFilters: (filters: ScheduleFilters) => void;
  setFormMode: (mode: 'create' | 'edit' | 'batch' | null, editingId?: number) => void;
  setSelectedSection: (sectionId: number | null) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshSchedules: () => Promise<void>;
  refreshSectionSchedules: () => Promise<void>;
  getScheduleById: (id: number) => Schedule | undefined;
}

// Crear contexto
const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Provider del contexto
interface ScheduleProviderProps {
  children: ReactNode;
}

export function ScheduleProvider({ children }: ScheduleProviderProps) {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Acciones de datos
  const fetchSchedules = useCallback(async (filters?: ScheduleFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const schedules = await getSchedules(filters);
      dispatch({
        type: 'SET_SCHEDULES',
        payload: {
          data: schedules,
          meta: {
            total: schedules.length,
            page: 1,
            limit: schedules.length,
            totalPages: 1
          }
        }
      });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      handleError(error, 'Error al cargar los horarios');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchScheduleById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const schedule = await getScheduleById(id);
      dispatch({ type: 'SET_CURRENT_SCHEDULE', payload: schedule });
    } catch (error) {
      handleError(error, 'Error al cargar el horario');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchSchedulesBySection = useCallback(async (sectionId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_SELECTED_SECTION', payload: sectionId });
      
      const schedules = await getSchedulesBySection(sectionId);
      dispatch({ type: 'SET_SECTION_SCHEDULES', payload: schedules });
    } catch (error) {
      handleError(error, 'Error al cargar los horarios de la sección');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchSchedulesByTeacher = useCallback(async (teacherId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const schedules = await getSchedulesByTeacher(teacherId);
      dispatch({
        type: 'SET_SCHEDULES',
        payload: {
          data: schedules,
          meta: {
            total: schedules.length,
            page: 1,
            limit: schedules.length,
            totalPages: 1
          }
        }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { teacherId } });
    } catch (error) {
      handleError(error, 'Error al cargar los horarios del profesor');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  // Acciones CRUD
  const createScheduleAction = useCallback(async (data: ScheduleFormValues) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newSchedule = await createSchedule(data);
      dispatch({ type: 'ADD_SCHEDULE', payload: newSchedule });
      
      toast.success("Horario creado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al crear el horario');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const createBatchSchedulesAction = useCallback(async (data: ScheduleFormValues[]) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newSchedules = await batchSaveSchedules(data);
      dispatch({ type: 'ADD_BATCH_SCHEDULES', payload: newSchedules });
      
      toast.success(`${newSchedules.length} horarios guardados correctamente`);
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al guardar los horarios');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateScheduleAction = useCallback(async (id: number, data: Partial<ScheduleFormValues>) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedSchedule = await updateSchedule(id, data);
      dispatch({
        type: 'UPDATE_SCHEDULE',
        payload: { id, data: updatedSchedule }
      });
      
      toast.success("Horario actualizado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar el horario');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeSchedule = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteSchedule(id);
      dispatch({ type: 'REMOVE_SCHEDULE', payload: id });
      
      toast.success("Horario eliminado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar el horario');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const clearSectionSchedules = useCallback(async (sectionId: number, keepIds: number[] = []) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteSchedulesBySection(sectionId, keepIds);
      
      // Actualizar el estado local removiendo los horarios eliminados
      if (state.selectedSection === sectionId) {
        const filteredSchedules = state.sectionSchedules.filter(s => keepIds.includes(s.id));
        dispatch({ type: 'SET_SECTION_SCHEDULES', payload: filteredSchedules });
      }
      
      // También actualizar la lista general
      const filteredGeneralSchedules = state.schedules.filter(s => 
        s.sectionId !== sectionId || keepIds.includes(s.id)
      );
      dispatch({ type: 'SET_SCHEDULES', payload: { data: filteredGeneralSchedules } });
      
      toast.success("Horarios de la sección limpiados correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al limpiar los horarios de la sección');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, state.selectedSection, state.sectionSchedules, state.schedules]);

  // Acciones de UI
  const setFilters = useCallback((filters: ScheduleFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setFormMode = useCallback((mode: 'create' | 'edit' | 'batch' | null, editingId?: number) => {
    dispatch({ type: 'SET_FORM_MODE', payload: { mode, editingId } });
  }, []);

  const setSelectedSection = useCallback((sectionId: number | null) => {
    dispatch({ type: 'SET_SELECTED_SECTION', payload: sectionId });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Utilidades
  const refreshSchedules = useCallback(async () => {
    await fetchSchedules(state.filters);
  }, [fetchSchedules, state.filters]);

  const refreshSectionSchedules = useCallback(async () => {
    if (state.selectedSection) {
      await fetchSchedulesBySection(state.selectedSection);
    }
  }, [fetchSchedulesBySection, state.selectedSection]);

  const getScheduleByIdFromState = useCallback((id: number) => {
    return state.schedules.find(schedule => schedule.id === id) ||
           state.sectionSchedules.find(schedule => schedule.id === id);
  }, [state.schedules, state.sectionSchedules]);

  // Valor del contexto
  const contextValue: ScheduleContextType = {
    state,
    
    // Acciones de datos
    fetchSchedules,
    fetchScheduleById,
    fetchSchedulesBySection,
    fetchSchedulesByTeacher,
    
    // Acciones CRUD
    createSchedule: createScheduleAction,
    createBatchSchedules: createBatchSchedulesAction,
    updateSchedule: updateScheduleAction,
    removeSchedule,
    clearSectionSchedules,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    setSelectedSection,
    clearError,
    resetState,
    
    // Utilidades
    refreshSchedules,
    refreshSectionSchedules,
    getScheduleById: getScheduleByIdFromState
  };

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
}

// Hook para usar el contexto
export function useScheduleContext() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useScheduleContext must be used within a ScheduleProvider');
  }
  return context;
}

// Hook especializado para formularios
export function useScheduleForm() {
  const {
    state: { submitting, formMode, editingId, currentSchedule },
    createSchedule,
    updateSchedule,
    setFormMode,
    fetchScheduleById
  } = useScheduleContext();

  const handleSubmit = useCallback(async (data: ScheduleFormValues) => {
    if (formMode === 'edit' && editingId) {
      return await updateSchedule(editingId, data);
    } else {
      return await createSchedule(data);
    }
  }, [formMode, editingId, createSchedule, updateSchedule]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id);
    await fetchScheduleById(id);
  }, [setFormMode, fetchScheduleById]);

  const startCreate = useCallback(() => {
    setFormMode('create');
  }, [setFormMode]);

  const startBatch = useCallback(() => {
    setFormMode('batch');
  }, [setFormMode]);

  const cancelForm = useCallback(() => {
    setFormMode(null);
  }, [setFormMode]);

  return {
    submitting,
    formMode,
    editingId,
    currentSchedule,
    handleSubmit,
    startEdit,
    startCreate,
    startBatch,
    cancelForm
  };
}

// Hook especializado para listas
export function useScheduleList() {
  const {
    state: { schedules, meta, loading, error, filters },
    fetchSchedules,
    setFilters,
    removeSchedule
  } = useScheduleContext();

  const handleFilterChange = useCallback(async (newFilters: ScheduleFilters) => {
    setFilters(newFilters);
    await fetchSchedules(newFilters);
  }, [setFilters, fetchSchedules]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      return await removeSchedule(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeSchedule]);

  return {
    schedules,
    meta,
    loading,
    error,
    filters,
    handleFilterChange,
    handleDelete,
    refetch: () => fetchSchedules(filters)
  };
}

// Hook especializado para horarios por sección
export function useScheduleSection() {
  const {
    state: { sectionSchedules, selectedSection, loading, submitting },
    fetchSchedulesBySection,
    createBatchSchedules,
    clearSectionSchedules,
    setSelectedSection
  } = useScheduleContext();

  const loadSectionSchedules = useCallback(async (sectionId: number) => {
    setSelectedSection(sectionId);
    await fetchSchedulesBySection(sectionId);
  }, [setSelectedSection, fetchSchedulesBySection]);

  const saveSectionSchedules = useCallback(async (schedules: ScheduleFormValues[]) => {
    return await createBatchSchedules(schedules);
  }, [createBatchSchedules]);

  const clearSchedules = useCallback(async (keepIds: number[] = []) => {
    if (selectedSection) {
      return await clearSectionSchedules(selectedSection, keepIds);
    }
    return { success: false, message: 'No hay sección seleccionada' };
  }, [selectedSection, clearSectionSchedules]);

  return {
    sectionSchedules,
    selectedSection,
    loading,
    submitting,
    loadSectionSchedules,
    saveSectionSchedules,
    clearSchedules
  };
}