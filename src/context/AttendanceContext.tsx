// src/contexts/AttendanceContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
  Attendance,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  AttendanceFilters,
  AttendanceResponse,
  AttendanceStats,
  AttendanceFormData,
  UpdateAttendanceFormData
} from '@/types/attendance.types';
import {
  getAttendances,
  createAttendance,
  updateAttendance,
  getAttendanceById,
  deleteAttendance,
  createBulkAttendance,
  getAttendancesByStudent,
  getAttendancesByEnrollment,
  getAttendancesByBimester,
  getAttendanceStats
} from '@/services/attendanceService';

// Estado del contexto
interface AttendanceState {
  // Data
  attendances: Attendance[];
  currentAttendance: Attendance | null;
  stats: AttendanceStats | null;
  
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
  filters: AttendanceFilters;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | null;
  editingId: number | null;
}

// Acciones
type AttendanceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_LOADING_STATS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ATTENDANCES'; payload: { data: Attendance[]; meta: AttendanceState['meta'] } }
  | { type: 'ADD_ATTENDANCE'; payload: Attendance }
  | { type: 'ADD_BULK_ATTENDANCES'; payload: Attendance[] }
  | { type: 'UPDATE_ATTENDANCE'; payload: { id: number; data: Attendance } }
  | { type: 'REMOVE_ATTENDANCE'; payload: number }
  | { type: 'SET_CURRENT_ATTENDANCE'; payload: Attendance | null }
  | { type: 'SET_STATS'; payload: AttendanceStats | null }
  | { type: 'SET_FILTERS'; payload: AttendanceFilters }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | null; editingId?: number } }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: AttendanceState = {
  attendances: [],
  currentAttendance: null,
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
function attendanceReducer(state: AttendanceState, action: AttendanceAction): AttendanceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_LOADING_STATS':
      return { ...state, loadingStats: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_ATTENDANCES':
      return {
        ...state,
        attendances: action.payload.data,
        meta: action.payload.meta,
        loading: false,
        error: null
      };
      
    case 'ADD_ATTENDANCE':
      return {
        ...state,
        attendances: [action.payload, ...state.attendances],
        meta: {
          ...state.meta,
          total: state.meta.total + 1
        }
      };
      
    case 'ADD_BULK_ATTENDANCES':
      return {
        ...state,
        attendances: [...action.payload, ...state.attendances],
        meta: {
          ...state.meta,
          total: state.meta.total + action.payload.length
        }
      };
      
    case 'UPDATE_ATTENDANCE':
      return {
        ...state,
        attendances: state.attendances.map(attendance =>
          attendance.id === action.payload.id ? action.payload.data : attendance
        ),
        currentAttendance: state.currentAttendance?.id === action.payload.id 
          ? action.payload.data 
          : state.currentAttendance
      };
      
    case 'REMOVE_ATTENDANCE':
      return {
        ...state,
        attendances: state.attendances.filter(attendance => attendance.id !== action.payload),
        meta: {
          ...state.meta,
          total: Math.max(0, state.meta.total - 1)
        }
      };
      
    case 'SET_CURRENT_ATTENDANCE':
      return { ...state, currentAttendance: action.payload };
      
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
interface AttendanceContextType {
  // Estado
  state: AttendanceState;
  
  // Acciones de datos
  fetchAttendances: (filters?: AttendanceFilters) => Promise<void>;
  fetchAttendanceById: (id: number) => Promise<void>;
  fetchAttendancesByStudent: (studentId: number, filters?: Omit<AttendanceFilters, 'studentId'>) => Promise<void>;
  fetchAttendancesByEnrollment: (enrollmentId: number, filters?: Omit<AttendanceFilters, 'enrollmentId'>) => Promise<void>;
  fetchAttendancesByBimester: (bimesterId: number, filters?: Omit<AttendanceFilters, 'bimesterId'>) => Promise<void>;
  fetchAttendanceStats: (enrollmentId: number, bimesterId?: number) => Promise<void>;
  
  // Acciones CRUD
  createAttendance: (data: CreateAttendanceRequest) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  createBulkAttendance: (data: CreateAttendanceRequest[]) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateAttendance: (id: number, data: UpdateAttendanceRequest) => Promise<{ success: boolean; message?: string }>;
  removeAttendance: (id: number) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de UI
  setFilters: (filters: AttendanceFilters) => void;
  setFormMode: (mode: 'create' | 'edit' | null, editingId?: number) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshAttendances: () => Promise<void>;
  getAttendanceById: (id: number) => Attendance | undefined;
}

// Crear contexto
const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// Provider del contexto
interface AttendanceProviderProps {
  children: ReactNode;
}

export function AttendanceProvider({ children }: AttendanceProviderProps) {
  const [state, dispatch] = useReducer(attendanceReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Validación de datos de formulario
  const validateFormData = useCallback((data: any) => {
    const enrollmentId = parseInt(data.enrollmentId);
    const bimesterId = parseInt(data.bimesterId);
    
    if (isNaN(enrollmentId) || enrollmentId <= 0) {
      toast.error("Matrícula inválida");
      return { success: false, message: "Matrícula inválida" };
    }
    
    if (isNaN(bimesterId) || bimesterId <= 0) {
      toast.error("Bimestre inválido");
      return { success: false, message: "Bimestre inválido" };
    }
    
    return { success: true, enrollmentId, bimesterId };
  }, []);

  // Acciones de datos
  const fetchAttendances = useCallback(async (filters?: AttendanceFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getAttendances(filters);
      dispatch({
        type: 'SET_ATTENDANCES',
        payload: {
          data: response.data,
          meta: response.meta
        }
      });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      handleError(error, 'Error al cargar las asistencias');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchAttendanceById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const attendance = await getAttendanceById(id);
      dispatch({ type: 'SET_CURRENT_ATTENDANCE', payload: attendance });
    } catch (error) {
      handleError(error, 'Error al cargar la asistencia');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchAttendancesByStudent = useCallback(async (
    studentId: number, 
    filters?: Omit<AttendanceFilters, 'studentId'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getAttendancesByStudent(studentId, filters);
      dispatch({
        type: 'SET_ATTENDANCES',
        payload: {
          data: response.data,
          meta: response.meta
        }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, studentId } });
    } catch (error) {
      handleError(error, 'Error al cargar las asistencias del estudiante');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchAttendancesByEnrollment = useCallback(async (
    enrollmentId: number,
    filters?: Omit<AttendanceFilters, 'enrollmentId'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getAttendancesByEnrollment(enrollmentId, filters);
      dispatch({
        type: 'SET_ATTENDANCES',
        payload: {
          data: response.data,
          meta: response.meta
        }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, enrollmentId } });
    } catch (error) {
      handleError(error, 'Error al cargar las asistencias de la matrícula');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchAttendancesByBimester = useCallback(async (
    bimesterId: number,
    filters?: Omit<AttendanceFilters, 'bimesterId'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getAttendancesByBimester(bimesterId, filters);
      dispatch({
        type: 'SET_ATTENDANCES',
        payload: {
          data: response.data,
          meta: response.meta
        }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, bimesterId } });
    } catch (error) {
      handleError(error, 'Error al cargar las asistencias del bimestre');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchAttendanceStats = useCallback(async (enrollmentId: number, bimesterId?: number) => {
    try {
      dispatch({ type: 'SET_LOADING_STATS', payload: true });
      
      const stats = await getAttendanceStats(enrollmentId, bimesterId);
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      handleError(error, 'Error al cargar las estadísticas de asistencia');
    } finally {
      dispatch({ type: 'SET_LOADING_STATS', payload: false });
    }
  }, [handleError]);

  // Acciones CRUD
  const createAttendanceAction = useCallback(async (data: CreateAttendanceRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newAttendance = await createAttendance(data);
      dispatch({ type: 'ADD_ATTENDANCE', payload: newAttendance });
      
      toast.success("Asistencia registrada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al registrar la asistencia');
      return {
        success: false,
        message,
        details: error.response?.data?.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const createBulkAttendanceAction = useCallback(async (data: CreateAttendanceRequest[]) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newAttendances = await createBulkAttendance(data);
      dispatch({ type: 'ADD_BULK_ATTENDANCES', payload: newAttendances });
      
      toast.success(`${newAttendances.length} registros de asistencia creados correctamente`);
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al crear las asistencias');
      return {
        success: false,
        message,
        details: error.response?.data?.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateAttendanceAction = useCallback(async (id: number, data: UpdateAttendanceRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedAttendance = await updateAttendance(id, data);
      dispatch({
        type: 'UPDATE_ATTENDANCE',
        payload: { id, data: updatedAttendance }
      });
      
      toast.success("Asistencia actualizada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar la asistencia');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeAttendance = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteAttendance(id);
      dispatch({ type: 'REMOVE_ATTENDANCE', payload: id });
      
      toast.success("Asistencia eliminada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar la asistencia');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Acciones de UI
  const setFilters = useCallback((filters: AttendanceFilters) => {
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
  const refreshAttendances = useCallback(async () => {
    await fetchAttendances(state.filters);
  }, [fetchAttendances, state.filters]);

  const getAttendanceByIdFromState = useCallback((id: number) => {
    return state.attendances.find(attendance => attendance.id === id);
  }, [state.attendances]);

  // Valor del contexto
  const contextValue: AttendanceContextType = {
    state,
    
    // Acciones de datos
    fetchAttendances,
    fetchAttendanceById,
    fetchAttendancesByStudent,
    fetchAttendancesByEnrollment,
    fetchAttendancesByBimester,
    fetchAttendanceStats,
    
    // Acciones CRUD
    createAttendance: createAttendanceAction,
    createBulkAttendance: createBulkAttendanceAction,
    updateAttendance: updateAttendanceAction,
    removeAttendance,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    clearError,
    resetState,
    
    // Utilidades
    refreshAttendances,
    getAttendanceById: getAttendanceByIdFromState
  };

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
    </AttendanceContext.Provider>
  );
}

// Hook para usar el contexto
export function useAttendanceContext() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendanceContext must be used within an AttendanceProvider');
  }
  return context;
}

// Hook especializado para formularios
export function useAttendanceForm() {
  const {
    state: { submitting, formMode, editingId, currentAttendance },
    createAttendance,
    updateAttendance,
    setFormMode,
    fetchAttendanceById
  } = useAttendanceContext();

  const handleSubmit = useCallback(async (data: CreateAttendanceRequest) => {
    if (formMode === 'edit' && editingId) {
      return await updateAttendance(editingId, data);
    } else {
      return await createAttendance(data);
    }
  }, [formMode, editingId, createAttendance, updateAttendance]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id);
    await fetchAttendanceById(id);
  }, [setFormMode, fetchAttendanceById]);

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
    currentAttendance,
    handleSubmit,
    startEdit,
    startCreate,
    cancelForm
  };
}

// Hook especializado para listas
export function useAttendanceList() {
  const {
    state: { attendances, meta, loading, error, filters },
    fetchAttendances,
    setFilters,
    removeAttendance
  } = useAttendanceContext();

  const handleFilterChange = useCallback(async (newFilters: AttendanceFilters) => {
    setFilters(newFilters);
    await fetchAttendances(newFilters);
  }, [setFilters, fetchAttendances]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de asistencia?')) {
      return await removeAttendance(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeAttendance]);

  return {
    attendances,
    meta,
    loading,
    error,
    filters,
    handleFilterChange,
    handleDelete,
    refetch: () => fetchAttendances(filters)
  };
}

// Hook especializado para estadísticas
export function useAttendanceStatsContext() {
  const {
    state: { stats, loadingStats },
    fetchAttendanceStats
  } = useAttendanceContext();

  return {
    stats,
    loading: loadingStats,
    fetchStats: fetchAttendanceStats
  };
}