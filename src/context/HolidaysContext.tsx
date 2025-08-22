// src/contexts/HolidayContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Holiday,
  CreateHolidayPayload,
  UpdateHolidayPayload
} from '@/types/holiday';
import {
  getAllHolidays,
  filterHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
} from '@/services/useHoliday';

// Estado del contexto
interface HolidayState {
  // Data
  holidays: Holiday[];
  currentHoliday: Holiday | null;
  
  // Filtros actuales
  filters: {
    cycleId?: number;
    bimesterId?: number;
  };
  
  // Estados de carga
  loading: boolean;
  submitting: boolean;
  
  // Estados de error
  error: string | null;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | null;
  editingId: number | null;
}

// Acciones
type HolidayAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_HOLIDAYS'; payload: Holiday[] }
  | { type: 'ADD_HOLIDAY'; payload: Holiday }
  | { type: 'UPDATE_HOLIDAY'; payload: { id: number; data: Holiday } }
  | { type: 'REMOVE_HOLIDAY'; payload: number }
  | { type: 'SET_CURRENT_HOLIDAY'; payload: Holiday | null }
  | { type: 'SET_FILTERS'; payload: { cycleId?: number; bimesterId?: number } }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | null; editingId?: number } }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: HolidayState = {
  holidays: [],
  currentHoliday: null,
  filters: {},
  loading: false,
  submitting: false,
  error: null,
  formMode: null,
  editingId: null
};

// Reducer
function holidayReducer(state: HolidayState, action: HolidayAction): HolidayState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_HOLIDAYS':
      return {
        ...state,
        holidays: action.payload,
        loading: false,
        error: null
      };
      
    case 'ADD_HOLIDAY':
      return {
        ...state,
        holidays: [action.payload, ...state.holidays]
      };
      
    case 'UPDATE_HOLIDAY':
      return {
        ...state,
        holidays: state.holidays.map(holiday =>
          holiday.id === action.payload.id ? action.payload.data : holiday
        ),
        currentHoliday: state.currentHoliday?.id === action.payload.id 
          ? action.payload.data 
          : state.currentHoliday
      };
      
    case 'REMOVE_HOLIDAY':
      return {
        ...state,
        holidays: state.holidays.filter(holiday => holiday.id !== action.payload)
      };
      
    case 'SET_CURRENT_HOLIDAY':
      return { ...state, currentHoliday: action.payload };
      
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
interface HolidayContextType {
  // Estado
  state: HolidayState;
  
  // Acciones de datos
  fetchAllHolidays: () => Promise<void>;
  fetchFilteredHolidays: (filters: { cycleId?: number; bimesterId?: number }) => Promise<void>;
  
  // Acciones CRUD
  createHoliday: (data: CreateHolidayPayload) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateHoliday: (id: number, data: UpdateHolidayPayload) => Promise<{ success: boolean; message?: string }>;
  removeHoliday: (id: number) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de UI
  setFilters: (filters: { cycleId?: number; bimesterId?: number }) => void;
  setFormMode: (mode: 'create' | 'edit' | null, editingId?: number) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshHolidays: () => Promise<void>;
  getHolidayById: (id: number) => Holiday | undefined;
}

// Crear contexto
const HolidayContext = createContext<HolidayContextType | undefined>(undefined);

// Provider del contexto
interface HolidayProviderProps {
  children: ReactNode;
}

export function HolidayProvider({ children }: HolidayProviderProps) {
  const [state, dispatch] = useReducer(holidayReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Acciones de datos
  const fetchAllHolidays = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const holidays = await getAllHolidays();
      dispatch({ type: 'SET_HOLIDAYS', payload: holidays });
    } catch (error) {
      handleError(error, 'Error al cargar los días festivos');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchFilteredHolidays = useCallback(async (
    filters: { cycleId?: number; bimesterId?: number }
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const holidays = await filterHolidays(filters);
      dispatch({ type: 'SET_HOLIDAYS', payload: holidays });
      dispatch({ type: 'SET_FILTERS', payload: filters });
    } catch (error) {
      handleError(error, 'Error al filtrar los días festivos');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  // Acciones CRUD
  const createHolidayAction = useCallback(async (data: CreateHolidayPayload) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newHoliday = await createHoliday(data);
      dispatch({ type: 'ADD_HOLIDAY', payload: newHoliday });
      
      toast.success("Día festivo creado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al crear el día festivo');
      return {
        success: false,
        message,
        details: error.response?.data?.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateHolidayAction = useCallback(async (id: number, data: UpdateHolidayPayload) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedHoliday = await updateHoliday(id, data);
      dispatch({
        type: 'UPDATE_HOLIDAY',
        payload: { id, data: updatedHoliday }
      });
      
      toast.success("Día festivo actualizado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar el día festivo');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeHoliday = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteHoliday(id);
      dispatch({ type: 'REMOVE_HOLIDAY', payload: id });
      
      toast.success("Día festivo eliminado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar el día festivo');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Acciones de UI
  const setFilters = useCallback((filters: { cycleId?: number; bimesterId?: number }) => {
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
  const refreshHolidays = useCallback(async () => {
    if (Object.keys(state.filters).length > 0) {
      await fetchFilteredHolidays(state.filters);
    } else {
      await fetchAllHolidays();
    }
  }, [fetchFilteredHolidays, fetchAllHolidays, state.filters]);

  const getHolidayByIdFromState = useCallback((id: number) => {
    return state.holidays.find(holiday => holiday.id === id);
  }, [state.holidays]);

   useEffect(() => {
    // Cargar holidays automáticamente al montar el componente
    if (state.holidays.length === 0 && !state.loading && !state.error) {
      fetchAllHolidays();
    }
  }, [state.holidays.length, state.loading, state.error]);

  // Valor del contexto
  const contextValue: HolidayContextType = {
    state,
    
    // Acciones de datos
    fetchAllHolidays,
    fetchFilteredHolidays,
    
    // Acciones CRUD
    createHoliday: createHolidayAction,
    updateHoliday: updateHolidayAction,
    removeHoliday,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    clearError,
    resetState,
    
    // Utilidades
    refreshHolidays,
    getHolidayById: getHolidayByIdFromState
  };

  return (
    <HolidayContext.Provider value={contextValue}>
      {children}
    </HolidayContext.Provider>
  );
}

// Hook para usar el contexto
export function useHolidayContext() {
  const context = useContext(HolidayContext);
  if (context === undefined) {
    throw new Error('useHolidayContext must be used within a HolidayProvider');
  }
  return context;
}

// Hook especializado para formularios
export function useHolidayForm() {
  const {
    state: { submitting, formMode, editingId, currentHoliday },
    createHoliday,
    updateHoliday,
    setFormMode,
    getHolidayById
  } = useHolidayContext();

  const handleSubmit = useCallback(async (data: CreateHolidayPayload) => {
    if (formMode === 'edit' && editingId) {
      return await updateHoliday(editingId, data);
    } else {
      return await createHoliday(data);
    }
  }, [formMode, editingId, createHoliday, updateHoliday]);

  const startEdit = useCallback((id: number) => {
    const holiday = getHolidayById(id);
    if (holiday) {
      setFormMode('edit', id);
     
    }
  }, [setFormMode, getHolidayById]);

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
    currentHoliday,
    handleSubmit,
    startEdit,
    startCreate,
    cancelForm
  };
}

// Hook especializado para listas
export function useHolidayList() {
  const {
    state: { holidays, loading, error, filters },
    fetchAllHolidays,
    fetchFilteredHolidays,
    setFilters,
    removeHoliday
  } = useHolidayContext();

  const handleFilterChange = useCallback(async (newFilters: { cycleId?: number; bimesterId?: number }) => {
    setFilters(newFilters);
    if (Object.keys(newFilters).length > 0) {
      await fetchFilteredHolidays(newFilters);
    } else {
      await fetchAllHolidays();
    }
  }, [setFilters, fetchFilteredHolidays, fetchAllHolidays]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este día festivo?')) {
      return await removeHoliday(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeHoliday]);

  return {
    holidays,
    loading,
    error,
    filters,
    handleFilterChange,
    handleDelete,
    refetch: () => {
      if (Object.keys(filters).length > 0) {
        return fetchFilteredHolidays(filters);
      } else {
        return fetchAllHolidays();
      }
    }
  };
}