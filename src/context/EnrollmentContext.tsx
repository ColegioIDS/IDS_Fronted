// src/contexts/EnrollmentContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
    EnrollmentStatus ,
  EnrollmentResponse,
  EnrollmentDetailResponse,
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
  EnrollmentFilterDto,
  EnrollmentStatsResponse,
  EnrollmentQueryParams
} from '@/types/enrollment.types';
import {
  getEnrollments,
  getEnrollmentById,
  getEnrollmentsByStudent,
  getEnrollmentsByCycle,
  getEnrollmentsBySection,
  getActiveEnrollments,
  getEnrollmentStats,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  graduateEnrollment,
  transferEnrollment,
  reactivateEnrollment,
  bulkUpdateEnrollments,
  bulkGraduateEnrollments,
  bulkTransferEnrollments
} from '@/services/enrollment.service';

// Estado del contexto
interface EnrollmentState {
  // Data
  enrollments: EnrollmentResponse[];
  currentEnrollment: EnrollmentDetailResponse | null;
  stats: EnrollmentStatsResponse | null;
  
  // Estados de carga
  loading: boolean;
  submitting: boolean;
  loadingStats: boolean;
  
  // Estados de error
  error: string | null;
  
  // Filtros actuales
  filters: EnrollmentFilterDto;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | null;
  editingId: number | null;
  
  // Selección múltiple para operaciones en lote
  selectedIds: number[];
}

// Acciones
type EnrollmentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_LOADING_STATS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ENROLLMENTS'; payload: EnrollmentResponse[] }
  | { type: 'ADD_ENROLLMENT'; payload: EnrollmentResponse }
  | { type: 'ADD_BULK_ENROLLMENTS'; payload: EnrollmentResponse[] }
  | { type: 'UPDATE_ENROLLMENT'; payload: { id: number; data: EnrollmentResponse } }
  | { type: 'REMOVE_ENROLLMENT'; payload: number }
  | { type: 'SET_CURRENT_ENROLLMENT'; payload: EnrollmentDetailResponse | null }
  | { type: 'SET_STATS'; payload: EnrollmentStatsResponse | null }
  | { type: 'SET_FILTERS'; payload: EnrollmentFilterDto }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | null; editingId?: number } }
  | { type: 'SET_SELECTED_IDS'; payload: number[] }
  | { type: 'TOGGLE_SELECTED_ID'; payload: number }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: EnrollmentState = {
  enrollments: [],
  currentEnrollment: null,
  stats: null,
  loading: false,
  submitting: false,
  loadingStats: false,
  error: null,
  filters: {},
  formMode: null,
  editingId: null,
  selectedIds: []
};

// Reducer
function enrollmentReducer(state: EnrollmentState, action: EnrollmentAction): EnrollmentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_LOADING_STATS':
      return { ...state, loadingStats: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_ENROLLMENTS':
      return {
        ...state,
        enrollments: action.payload,
        loading: false,
        error: null
      };
      
    case 'ADD_ENROLLMENT':
      return {
        ...state,
        enrollments: [action.payload, ...state.enrollments]
      };
      
    case 'ADD_BULK_ENROLLMENTS':
      return {
        ...state,
        enrollments: [...action.payload, ...state.enrollments]
      };
      
    case 'UPDATE_ENROLLMENT':
      return {
        ...state,
        enrollments: state.enrollments.map(enrollment =>
          enrollment.id === action.payload.id ? action.payload.data : enrollment
        ),
        currentEnrollment: state.currentEnrollment?.id === action.payload.id 
          ? { ...state.currentEnrollment, ...action.payload.data } as EnrollmentDetailResponse
          : state.currentEnrollment
      };
      
    case 'REMOVE_ENROLLMENT':
      return {
        ...state,
        enrollments: state.enrollments.filter(enrollment => enrollment.id !== action.payload),
        selectedIds: state.selectedIds.filter(id => id !== action.payload)
      };
      
    case 'SET_CURRENT_ENROLLMENT':
      return { ...state, currentEnrollment: action.payload };
      
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
      
    case 'SET_SELECTED_IDS':
      return { ...state, selectedIds: action.payload };
      
    case 'TOGGLE_SELECTED_ID':
      const isSelected = state.selectedIds.includes(action.payload);
      return {
        ...state,
        selectedIds: isSelected
          ? state.selectedIds.filter(id => id !== action.payload)
          : [...state.selectedIds, action.payload]
      };
      
    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: [] };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Tipos del contexto
interface EnrollmentContextType {
  // Estado
  state: EnrollmentState;
  
  // Acciones de datos
  fetchEnrollments: (params?: EnrollmentQueryParams) => Promise<void>;
  fetchEnrollmentById: (id: number, includeRelations?: boolean) => Promise<void>;
  fetchEnrollmentsByStudent: (studentId: number) => Promise<void>;
  fetchEnrollmentsByCycle: (cycleId: number) => Promise<void>;
  fetchEnrollmentsBySection: (sectionId: number) => Promise<void>;
  fetchActiveEnrollments: (cycleId?: number) => Promise<void>;
  fetchEnrollmentStats: (cycleId?: number) => Promise<void>;
  
  // Acciones CRUD
  createEnrollment: (data: CreateEnrollmentDto) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateEnrollment: (id: number, data: UpdateEnrollmentDto) => Promise<{ success: boolean; message?: string }>;
  removeEnrollment: (id: number) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de estado
  graduateEnrollment: (id: number) => Promise<{ success: boolean; message?: string }>;
  transferEnrollment: (id: number) => Promise<{ success: boolean; message?: string }>;
  reactivateEnrollment: (id: number) => Promise<{ success: boolean; message?: string }>;
  
  // Operaciones en lote
  bulkUpdateEnrollments: (ids: number[], data: UpdateEnrollmentDto) => Promise<{ success: boolean; message?: string }>;
  bulkGraduateEnrollments: (ids: number[]) => Promise<{ success: boolean; message?: string }>;
  bulkTransferEnrollments: (ids: number[]) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de UI
  setFilters: (filters: EnrollmentFilterDto) => void;
  setFormMode: (mode: 'create' | 'edit' | null, editingId?: number) => void;
  setSelectedIds: (ids: number[]) => void;
  toggleSelectedId: (id: number) => void;
  clearSelection: () => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshEnrollments: () => Promise<void>;
  getEnrollmentById: (id: number) => EnrollmentResponse | undefined;
}

// Crear contexto
const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

// Provider del contexto
interface EnrollmentProviderProps {
  children: ReactNode;
}

export function EnrollmentProvider({ children }: EnrollmentProviderProps) {
  const [state, dispatch] = useReducer(enrollmentReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Acciones de datos
  const fetchEnrollments = useCallback(async (params?: EnrollmentQueryParams) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const enrollments = await getEnrollments(params);
      dispatch({ type: 'SET_ENROLLMENTS', payload: enrollments });
      
      if (params) {
        const filters: EnrollmentFilterDto = {
          ...(params.studentId && { studentId: parseInt(params.studentId) }),
          ...(params.cycleId && { cycleId: parseInt(params.cycleId) }),
          ...(params.gradeId && { gradeId: parseInt(params.gradeId) }),
          ...(params.sectionId && { sectionId: parseInt(params.sectionId) }),
          ...(params.status && { status: params.status })
        };
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      handleError(error, 'Error al cargar las matrículas');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchEnrollmentById = useCallback(async (id: number, includeRelations: boolean = true) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const enrollment = await getEnrollmentById(id, includeRelations);
      dispatch({ type: 'SET_CURRENT_ENROLLMENT', payload: enrollment });
    } catch (error) {
      handleError(error, 'Error al cargar la matrícula');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchEnrollmentsByStudent = useCallback(async (studentId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const enrollments = await getEnrollmentsByStudent(studentId);
      dispatch({ type: 'SET_ENROLLMENTS', payload: enrollments });
      dispatch({ type: 'SET_FILTERS', payload: { studentId } });
    } catch (error) {
      handleError(error, 'Error al cargar las matrículas del estudiante');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchEnrollmentsByCycle = useCallback(async (cycleId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const enrollments = await getEnrollmentsByCycle(cycleId);
      dispatch({ type: 'SET_ENROLLMENTS', payload: enrollments });
      dispatch({ type: 'SET_FILTERS', payload: { cycleId } });
    } catch (error) {
      handleError(error, 'Error al cargar las matrículas del ciclo');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchEnrollmentsBySection = useCallback(async (sectionId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const enrollments = await getEnrollmentsBySection(sectionId);
      dispatch({ type: 'SET_ENROLLMENTS', payload: enrollments });
      dispatch({ type: 'SET_FILTERS', payload: { sectionId } });
    } catch (error) {
      handleError(error, 'Error al cargar las matrículas de la sección');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

const fetchActiveEnrollments = useCallback(async (cycleId?: number) => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    const enrollments = await getActiveEnrollments(cycleId);
    dispatch({ type: 'SET_ENROLLMENTS', payload: enrollments });
    dispatch({ type: 'SET_FILTERS', payload: { status: EnrollmentStatus.ACTIVE, ...(cycleId && { cycleId }) } });
  } catch (error) {
    handleError(error, 'Error al cargar las matrículas activas');
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
}, [handleError]);

const fetchEnrollmentStats = useCallback(async (cycleId?: number) => {
  try {
    dispatch({ type: 'SET_LOADING_STATS', payload: true });
    
    const stats = await getEnrollmentStats(cycleId ? { cycleId: cycleId.toString() } : undefined);
    dispatch({ type: 'SET_STATS', payload: stats });
  } catch (error) {
    handleError(error, 'Error al cargar las estadísticas de matrícula');
  } finally {
    dispatch({ type: 'SET_LOADING_STATS', payload: false });
  }
}, [handleError]);

  // Acciones CRUD
  const createEnrollmentAction = useCallback(async (data: CreateEnrollmentDto) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newEnrollment = await createEnrollment(data);
      dispatch({ type: 'ADD_ENROLLMENT', payload: newEnrollment });
      
      toast.success("Matrícula registrada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al registrar la matrícula');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateEnrollmentAction = useCallback(async (id: number, data: UpdateEnrollmentDto) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedEnrollment = await updateEnrollment(id, data);
      dispatch({
        type: 'UPDATE_ENROLLMENT',
        payload: { id, data: updatedEnrollment }
      });
      
      toast.success("Matrícula actualizada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar la matrícula');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeEnrollment = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteEnrollment(id);
      dispatch({ type: 'REMOVE_ENROLLMENT', payload: id });
      
      toast.success("Matrícula eliminada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar la matrícula');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Acciones de estado
  const graduateEnrollmentAction = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedEnrollment = await graduateEnrollment(id);
      dispatch({
        type: 'UPDATE_ENROLLMENT',
        payload: { id, data: updatedEnrollment }
      });
      
      toast.success("Estudiante graduado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al graduar al estudiante');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const transferEnrollmentAction = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedEnrollment = await transferEnrollment(id);
      dispatch({
        type: 'UPDATE_ENROLLMENT',
        payload: { id, data: updatedEnrollment }
      });
      
      toast.success("Estudiante transferido correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al transferir al estudiante');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const reactivateEnrollmentAction = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedEnrollment = await reactivateEnrollment(id);
      dispatch({
        type: 'UPDATE_ENROLLMENT',
        payload: { id, data: updatedEnrollment }
      });
      
      toast.success("Matrícula reactivada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al reactivar la matrícula');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Operaciones en lote
  const bulkUpdateEnrollmentsAction = useCallback(async (ids: number[], data: UpdateEnrollmentDto) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedEnrollments = await bulkUpdateEnrollments(ids, data);
      
      updatedEnrollments.forEach(enrollment => {
        dispatch({
          type: 'UPDATE_ENROLLMENT',
          payload: { id: enrollment.id, data: enrollment }
        });
      });
      
      toast.success(`${updatedEnrollments.length} matrículas actualizadas correctamente`);
      dispatch({ type: 'CLEAR_SELECTION' });
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error en la actualización masiva');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const bulkGraduateEnrollmentsAction = useCallback(async (ids: number[]) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const graduatedEnrollments = await bulkGraduateEnrollments(ids);
      
      graduatedEnrollments.forEach(enrollment => {
        dispatch({
          type: 'UPDATE_ENROLLMENT',
          payload: { id: enrollment.id, data: enrollment }
        });
      });
      
      toast.success(`${graduatedEnrollments.length} estudiantes graduados correctamente`);
      dispatch({ type: 'CLEAR_SELECTION' });
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error en la graduación masiva');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const bulkTransferEnrollmentsAction = useCallback(async (ids: number[]) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const transferredEnrollments = await bulkTransferEnrollments(ids);
      
      transferredEnrollments.forEach(enrollment => {
        dispatch({
          type: 'UPDATE_ENROLLMENT',
          payload: { id: enrollment.id, data: enrollment }
        });
      });
      
      toast.success(`${transferredEnrollments.length} estudiantes transferidos correctamente`);
      dispatch({ type: 'CLEAR_SELECTION' });
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error en la transferencia masiva');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Acciones de UI
  const setFilters = useCallback((filters: EnrollmentFilterDto) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setFormMode = useCallback((mode: 'create' | 'edit' | null, editingId?: number) => {
    dispatch({ type: 'SET_FORM_MODE', payload: { mode, editingId } });
  }, []);

  const setSelectedIds = useCallback((ids: number[]) => {
    dispatch({ type: 'SET_SELECTED_IDS', payload: ids });
  }, []);

  const toggleSelectedId = useCallback((id: number) => {
    dispatch({ type: 'TOGGLE_SELECTED_ID', payload: id });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Utilidades
  const refreshEnrollments = useCallback(async () => {
    const params: EnrollmentQueryParams = {};
    if (state.filters.studentId) params.studentId = state.filters.studentId.toString();
    if (state.filters.cycleId) params.cycleId = state.filters.cycleId.toString();
    if (state.filters.gradeId) params.gradeId = state.filters.gradeId.toString();
    if (state.filters.sectionId) params.sectionId = state.filters.sectionId.toString();
    if (state.filters.status) params.status = state.filters.status;
    
    await fetchEnrollments(params);
  }, [fetchEnrollments, state.filters]);

  const getEnrollmentByIdFromState = useCallback((id: number) => {
    return state.enrollments.find(enrollment => enrollment.id === id);
  }, [state.enrollments]);

  // Valor del contexto
  const contextValue: EnrollmentContextType = {
    state,
    
    // Acciones de datos
    fetchEnrollments,
    fetchEnrollmentById,
    fetchEnrollmentsByStudent,
    fetchEnrollmentsByCycle,
    fetchEnrollmentsBySection,
    fetchActiveEnrollments,
    fetchEnrollmentStats,
    
    // Acciones CRUD
    createEnrollment: createEnrollmentAction,
    updateEnrollment: updateEnrollmentAction,
    removeEnrollment,
    
    // Acciones de estado
    graduateEnrollment: graduateEnrollmentAction,
    transferEnrollment: transferEnrollmentAction,
    reactivateEnrollment: reactivateEnrollmentAction,
    
    // Operaciones en lote
    bulkUpdateEnrollments: bulkUpdateEnrollmentsAction,
    bulkGraduateEnrollments: bulkGraduateEnrollmentsAction,
    bulkTransferEnrollments: bulkTransferEnrollmentsAction,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    setSelectedIds,
    toggleSelectedId,
    clearSelection,
    clearError,
    resetState,
    
    // Utilidades
    refreshEnrollments,
    getEnrollmentById: getEnrollmentByIdFromState
  };

  return (
    <EnrollmentContext.Provider value={contextValue}>
      {children}
    </EnrollmentContext.Provider>
  );
}

// Hook para usar el contexto
export function useEnrollmentContext() {
  const context = useContext(EnrollmentContext);
  if (context === undefined) {
    throw new Error('useEnrollmentContext must be used within an EnrollmentProvider');
  }
  return context;
}

// Hook especializado para formularios
export function useEnrollmentForm() {
  const {
    state: { submitting, formMode, editingId, currentEnrollment },
    createEnrollment,
    updateEnrollment,
    setFormMode,
    fetchEnrollmentById
  } = useEnrollmentContext();

  const handleSubmit = useCallback(async (data: CreateEnrollmentDto) => {
    if (formMode === 'edit' && editingId) {
      return await updateEnrollment(editingId, data);
    } else {
      return await createEnrollment(data);
    }
  }, [formMode, editingId, createEnrollment, updateEnrollment]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id);
    await fetchEnrollmentById(id);
  }, [setFormMode, fetchEnrollmentById]);

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
    currentEnrollment,
    handleSubmit,
    startEdit,
    startCreate,
    cancelForm
  };
}

// Hook especializado para listas
export function useEnrollmentList() {
  const {
    state: { enrollments, loading, error, filters, selectedIds },
    fetchEnrollments,
    setFilters,
    removeEnrollment,
    setSelectedIds,
    toggleSelectedId,
    clearSelection
  } = useEnrollmentContext();

  const handleFilterChange = useCallback(async (newFilters: EnrollmentFilterDto) => {
    setFilters(newFilters);
    
    const params: EnrollmentQueryParams = {};
    if (newFilters.studentId) params.studentId = newFilters.studentId.toString();
    if (newFilters.cycleId) params.cycleId = newFilters.cycleId.toString();
    if (newFilters.gradeId) params.gradeId = newFilters.gradeId.toString();
    if (newFilters.sectionId) params.sectionId = newFilters.sectionId.toString();
    if (newFilters.status) params.status = newFilters.status;
    
    await fetchEnrollments(params);
  }, [setFilters, fetchEnrollments]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta matrícula?')) {
      return await removeEnrollment(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeEnrollment]);

  const handleSelectAll = useCallback(() => {
    const allIds = enrollments.map(enrollment => enrollment.id);
    setSelectedIds(selectedIds.length === allIds.length ? [] : allIds);
  }, [enrollments, selectedIds, setSelectedIds]);

  return {
    enrollments,
    loading,
    error,
    filters,
    selectedIds,
    handleFilterChange,
    handleDelete,
    handleSelectAll,
    toggleSelectedId,
    clearSelection,
    refetch: () => {
      const params: EnrollmentQueryParams = {};
      if (filters.studentId) params.studentId = filters.studentId.toString();
      if (filters.cycleId) params.cycleId = filters.cycleId.toString();
      if (filters.gradeId) params.gradeId = filters.gradeId.toString();
      if (filters.sectionId) params.sectionId = filters.sectionId.toString();
      if (filters.status) params.status = filters.status;
      return fetchEnrollments(params);
    }
  };
}

// Hook especializado para estadísticas
export function useEnrollmentStatsContext() {
  const {
    state: { stats, loadingStats },
    fetchEnrollmentStats
  } = useEnrollmentContext();

  return {
    stats,
    loading: loadingStats,
    fetchStats: fetchEnrollmentStats
  };
}

// Hook especializado para operaciones en lote
export function useEnrollmentBulkOperations() {
  const {
    state: { selectedIds, submitting },
    bulkUpdateEnrollments,
    bulkGraduateEnrollments,
    bulkTransferEnrollments,
    clearSelection
  } = useEnrollmentContext();

  const hasSelection = selectedIds.length > 0;

  const handleBulkUpdate = useCallback(async (data: UpdateEnrollmentDto) => {
    if (!hasSelection) {
      toast.warning('Selecciona al menos una matrícula');
      return { success: false, message: 'No hay matrículas seleccionadas' };
    }
    return await bulkUpdateEnrollments(selectedIds, data);
  }, [selectedIds, hasSelection, bulkUpdateEnrollments]);

  const handleBulkGraduate = useCallback(async () => {
    if (!hasSelection) {
      toast.warning('Selecciona al menos una matrícula');
      return { success: false, message: 'No hay matrículas seleccionadas' };
    }
    
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas graduar ${selectedIds.length} estudiante(s)?`
    );
    
    if (!confirmed) {
      return { success: false, message: 'Operación cancelada' };
    }
    
    return await bulkGraduateEnrollments(selectedIds);
  }, [selectedIds, hasSelection, bulkGraduateEnrollments]);

  const handleBulkTransfer = useCallback(async () => {
    if (!hasSelection) {
      toast.warning('Selecciona al menos una matrícula');
      return { success: false, message: 'No hay matrículas seleccionadas' };
    }
    
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas transferir ${selectedIds.length} estudiante(s)?`
    );
    
    if (!confirmed) {
      return { success: false, message: 'Operación cancelada' };
    }
    
    return await bulkTransferEnrollments(selectedIds);
  }, [selectedIds, hasSelection, bulkTransferEnrollments]);

  return {
    selectedIds,
    hasSelection,
    submitting,
    handleBulkUpdate,
    handleBulkGraduate,
    handleBulkTransfer,
    clearSelection
  };
}

// Hook especializado para acciones de estado individual
export function useEnrollmentStatus() {
  const {
    graduateEnrollment,
    transferEnrollment,
    reactivateEnrollment
  } = useEnrollmentContext();

  const handleGraduate = useCallback(async (id: number, studentName?: string) => {
    const name = studentName ? ` a ${studentName}` : '';
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas graduar${name}?`
    );
    
    if (!confirmed) {
      return { success: false, message: 'Operación cancelada' };
    }
    
    return await graduateEnrollment(id);
  }, [graduateEnrollment]);

  const handleTransfer = useCallback(async (id: number, studentName?: string) => {
    const name = studentName ? ` a ${studentName}` : '';
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas transferir${name}?`
    );
    
    if (!confirmed) {
      return { success: false, message: 'Operación cancelada' };
    }
    
    return await transferEnrollment(id);
  }, [transferEnrollment]);

  const handleReactivate = useCallback(async (id: number, studentName?: string) => {
    const name = studentName ? ` de ${studentName}` : '';
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas reactivar la matrícula${name}?`
    );
    
    if (!confirmed) {
      return { success: false, message: 'Operación cancelada' };
    }
    
    return await reactivateEnrollment(id);
  }, [reactivateEnrollment]);

  return {
    handleGraduate,
    handleTransfer,
    handleReactivate
  };
}