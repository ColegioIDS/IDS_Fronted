//src\context\ScheduleConfigContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { Grade, GradeFormValues } from '@/types/grades';
import { ScheduleConfig, CreateScheduleConfigDto, UpdateScheduleConfigDto } from '@/types/schedule-config';
import {
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  getScheduleConfigs,
  getScheduleConfigById,
  getScheduleConfigBySection,
  createScheduleConfig,
  updateScheduleConfig,
  deleteScheduleConfig
} from '@/services/ScheduleConfig';

// Estado del contexto
interface GradeScheduleConfigState {
  // Data - Grades
  grades: Grade[];
  currentGrade: Grade | null;
  
  // Data - Schedule Configs
  scheduleConfigs: ScheduleConfig[];
  currentScheduleConfig: ScheduleConfig | null;
  
  // Meta información
  meta: {
    grades: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    scheduleConfigs: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  
  // Estados de carga
  loading: {
    grades: boolean;
    scheduleConfigs: boolean;
    general: boolean;
  };
  submitting: boolean;
  
  // Estados de error
  error: string | null;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | null;
  editingId: number | null;
  activeSection: 'grades' | 'scheduleConfigs' | null;
  
  // Para manejo por sección
  selectedSection: number | null;
}

// Acciones
type GradeScheduleConfigAction =
  | { type: 'SET_LOADING'; payload: { section: 'grades' | 'scheduleConfigs' | 'general'; loading: boolean } }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GRADES'; payload: Grade[] }
  | { type: 'ADD_GRADE'; payload: Grade }
  | { type: 'UPDATE_GRADE'; payload: { id: number; data: Grade } }
  | { type: 'SET_CURRENT_GRADE'; payload: Grade | null }
  | { type: 'SET_SCHEDULE_CONFIGS'; payload: ScheduleConfig[] }
  | { type: 'ADD_SCHEDULE_CONFIG'; payload: ScheduleConfig }
  | { type: 'UPDATE_SCHEDULE_CONFIG'; payload: { id: number; data: ScheduleConfig } }
  | { type: 'REMOVE_SCHEDULE_CONFIG'; payload: number }
  | { type: 'SET_CURRENT_SCHEDULE_CONFIG'; payload: ScheduleConfig | null }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | null; editingId?: number; activeSection?: 'grades' | 'scheduleConfigs' } }
  | { type: 'SET_ACTIVE_SECTION'; payload: 'grades' | 'scheduleConfigs' | null }
  | { type: 'SET_SELECTED_SECTION'; payload: number | null }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: GradeScheduleConfigState = {
  grades: [],
  currentGrade: null,
  scheduleConfigs: [],
  currentScheduleConfig: null,
  meta: {
    grades: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    },
    scheduleConfigs: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  },
  loading: {
    grades: false,
    scheduleConfigs: false,
    general: false
  },
  submitting: false,
  error: null,
  formMode: null,
  editingId: null,
  activeSection: null,
  selectedSection: null
};

// Reducer
function gradeScheduleConfigReducer(
  state: GradeScheduleConfigState, 
  action: GradeScheduleConfigAction
): GradeScheduleConfigState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.section]: action.payload.loading
        }
      };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_GRADES':
      return {
        ...state,
        grades: action.payload,
        meta: {
          ...state.meta,
          grades: {
            total: action.payload.length,
            page: 1,
            limit: action.payload.length,
            totalPages: 1
          }
        },
        loading: {
          ...state.loading,
          grades: false
        },
        error: null
      };
      
    case 'ADD_GRADE':
      return {
        ...state,
        grades: [action.payload, ...state.grades],
        meta: {
          ...state.meta,
          grades: {
            ...state.meta.grades,
            total: state.meta.grades.total + 1
          }
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
      
    case 'SET_CURRENT_GRADE':
      return { ...state, currentGrade: action.payload };
      
    case 'SET_SCHEDULE_CONFIGS':
      return {
        ...state,
        scheduleConfigs: action.payload,
        meta: {
          ...state.meta,
          scheduleConfigs: {
            total: action.payload.length,
            page: 1,
            limit: action.payload.length,
            totalPages: 1
          }
        },
        loading: {
          ...state.loading,
          scheduleConfigs: false
        },
        error: null
      };
      
    case 'ADD_SCHEDULE_CONFIG':
      return {
        ...state,
        scheduleConfigs: [action.payload, ...state.scheduleConfigs],
        meta: {
          ...state.meta,
          scheduleConfigs: {
            ...state.meta.scheduleConfigs,
            total: state.meta.scheduleConfigs.total + 1
          }
        }
      };
      
    case 'UPDATE_SCHEDULE_CONFIG':
      return {
        ...state,
        scheduleConfigs: state.scheduleConfigs.map(config =>
          config.id === action.payload.id ? action.payload.data : config
        ),
        currentScheduleConfig: state.currentScheduleConfig?.id === action.payload.id 
          ? action.payload.data 
          : state.currentScheduleConfig
      };
      
    case 'REMOVE_SCHEDULE_CONFIG':
      return {
        ...state,
        scheduleConfigs: state.scheduleConfigs.filter(config => config.id !== action.payload),
        meta: {
          ...state.meta,
          scheduleConfigs: {
            ...state.meta.scheduleConfigs,
            total: Math.max(0, state.meta.scheduleConfigs.total - 1)
          }
        }
      };
      
    case 'SET_CURRENT_SCHEDULE_CONFIG':
      return { ...state, currentScheduleConfig: action.payload };
      
    case 'SET_FORM_MODE':
      return {
        ...state,
        formMode: action.payload.mode,
        editingId: action.payload.editingId || null,
        activeSection: action.payload.activeSection || state.activeSection
      };
      
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
      
    case 'SET_SELECTED_SECTION':
      return { ...state, selectedSection: action.payload };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Tipos del contexto
interface GradeScheduleConfigContextType {
  // Estado
  state: GradeScheduleConfigState;
  
  // Acciones de datos - Grades
  fetchGrades: () => Promise<void>;
  fetchGradeById: (id: number) => Promise<void>;
  
  // Acciones CRUD - Grades
  createGrade: (data: GradeFormValues) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateGrade: (id: number, data: Partial<GradeFormValues>) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de datos - Schedule Configs
  fetchScheduleConfigs: () => Promise<void>;
  fetchScheduleConfigById: (id: number) => Promise<void>;
  fetchScheduleConfigBySection: (sectionId: number) => Promise<void>;
  
  // Acciones CRUD - Schedule Configs
  createScheduleConfig: (data: CreateScheduleConfigDto) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateScheduleConfig: (id: number, data: UpdateScheduleConfigDto) => Promise<{ success: boolean; message?: string }>;
  removeScheduleConfig: (id: number) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de UI
  setFormMode: (mode: 'create' | 'edit' | null, editingId?: number, activeSection?: 'grades' | 'scheduleConfigs') => void;
  setActiveSection: (section: 'grades' | 'scheduleConfigs' | null) => void;
  setSelectedSection: (sectionId: number | null) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshGrades: () => Promise<void>;
  refreshScheduleConfigs: () => Promise<void>;
  getGradeById: (id: number) => Grade | undefined;
  getScheduleConfigById: (id: number) => ScheduleConfig | undefined;
}

// Crear contexto
const GradeScheduleConfigContext = createContext<GradeScheduleConfigContextType | undefined>(undefined);

// Provider del contexto
interface GradeScheduleConfigProviderProps {
  children: ReactNode;
}

export function GradeScheduleConfigProvider({ children }: GradeScheduleConfigProviderProps) {
  const [state, dispatch] = useReducer(gradeScheduleConfigReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Acciones de datos - Grades
  const fetchGrades = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { section: 'grades', loading: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const grades = await getGrades();
      dispatch({ type: 'SET_GRADES', payload: grades });
    } catch (error) {
      handleError(error, 'Error al cargar los grados');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { section: 'grades', loading: false } });
    }
  }, [handleError]);

  const fetchGradeById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { section: 'general', loading: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const grade = await getGradeById(id);
      dispatch({ type: 'SET_CURRENT_GRADE', payload: grade });
    } catch (error) {
      handleError(error, 'Error al cargar el grado');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { section: 'general', loading: false } });
    }
  }, [handleError]);

  // Acciones CRUD - Grades
  const createGradeAction = useCallback(async (data: GradeFormValues) => {
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
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateGradeAction = useCallback(async (id: number, data: Partial<GradeFormValues>) => {
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

  // Acciones de datos - Schedule Configs
  const fetchScheduleConfigs = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { section: 'scheduleConfigs', loading: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const configs = await getScheduleConfigs();
      dispatch({ type: 'SET_SCHEDULE_CONFIGS', payload: configs });
    } catch (error) {
      handleError(error, 'Error al cargar las configuraciones de horario');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { section: 'scheduleConfigs', loading: false } });
    }
  }, [handleError]);

  const fetchScheduleConfigById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { section: 'general', loading: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const config = await getScheduleConfigById(id);
      dispatch({ type: 'SET_CURRENT_SCHEDULE_CONFIG', payload: config });
    } catch (error) {
      handleError(error, 'Error al cargar la configuración de horario');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { section: 'general', loading: false } });
    }
  }, [handleError]);

  const fetchScheduleConfigBySection = useCallback(async (sectionId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { section: 'general', loading: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_SELECTED_SECTION', payload: sectionId });
      
      const config = await getScheduleConfigBySection(sectionId);
      dispatch({ type: 'SET_CURRENT_SCHEDULE_CONFIG', payload: config });
    } catch (error) {
      handleError(error, 'Error al cargar la configuración de horario por sección');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { section: 'general', loading: false } });
    }
  }, [handleError]);

  // Acciones CRUD - Schedule Configs
  const createScheduleConfigAction = useCallback(async (data: CreateScheduleConfigDto) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newConfig = await createScheduleConfig(data);
      dispatch({ type: 'ADD_SCHEDULE_CONFIG', payload: newConfig });
      
      toast.success("Configuración de horario creada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al crear la configuración de horario');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateScheduleConfigAction = useCallback(async (id: number, data: UpdateScheduleConfigDto) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedConfig = await updateScheduleConfig(id, data);
      dispatch({
        type: 'UPDATE_SCHEDULE_CONFIG',
        payload: { id, data: updatedConfig }
      });
      
      toast.success("Configuración de horario actualizada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar la configuración de horario');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeScheduleConfig = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteScheduleConfig(id);
      dispatch({ type: 'REMOVE_SCHEDULE_CONFIG', payload: id });
      
      toast.success("Configuración de horario eliminada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar la configuración de horario');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Acciones de UI
  const setFormMode = useCallback((
    mode: 'create' | 'edit' | null, 
    editingId?: number, 
    activeSection?: 'grades' | 'scheduleConfigs'
  ) => {
    dispatch({ type: 'SET_FORM_MODE', payload: { mode, editingId, activeSection } });
  }, []);

  const setActiveSection = useCallback((section: 'grades' | 'scheduleConfigs' | null) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
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
  const refreshGrades = useCallback(async () => {
    await fetchGrades();
  }, [fetchGrades]);

  const refreshScheduleConfigs = useCallback(async () => {
    await fetchScheduleConfigs();
  }, [fetchScheduleConfigs]);

  const getGradeByIdFromState = useCallback((id: number) => {
    return state.grades.find(grade => grade.id === id);
  }, [state.grades]);

  const getScheduleConfigByIdFromState = useCallback((id: number) => {
    return state.scheduleConfigs.find(config => config.id === id);
  }, [state.scheduleConfigs]);

  // Valor del contexto
  const contextValue: GradeScheduleConfigContextType = {
    state,
    
    // Acciones de datos - Grades
    fetchGrades,
    fetchGradeById,
    
    // Acciones CRUD - Grades
    createGrade: createGradeAction,
    updateGrade: updateGradeAction,
    
    // Acciones de datos - Schedule Configs
    fetchScheduleConfigs,
    fetchScheduleConfigById,
    fetchScheduleConfigBySection,
    
    // Acciones CRUD - Schedule Configs
    createScheduleConfig: createScheduleConfigAction,
    updateScheduleConfig: updateScheduleConfigAction,
    removeScheduleConfig,
    
    // Acciones de UI
    setFormMode,
    setActiveSection,
    setSelectedSection,
    clearError,
    resetState,
    
    // Utilidades
    refreshGrades,
    refreshScheduleConfigs,
    getGradeById: getGradeByIdFromState,
    getScheduleConfigById: getScheduleConfigByIdFromState
  };

  return (
    <GradeScheduleConfigContext.Provider value={contextValue}>
      {children}
    </GradeScheduleConfigContext.Provider>
  );
}

// Hook para usar el contexto
export function useGradeScheduleConfigContext() {
  const context = useContext(GradeScheduleConfigContext);
  if (context === undefined) {
    throw new Error('useGradeScheduleConfigContext must be used within a GradeScheduleConfigProvider');
  }
  return context;
}

// Hook especializado para formularios de grados
export function useGradeForm() {
  const {
    state: { submitting, formMode, editingId, currentGrade, activeSection },
    createGrade,
    updateGrade,
    setFormMode,
    fetchGradeById
  } = useGradeScheduleConfigContext();

  const handleSubmit = useCallback(async (data: GradeFormValues) => {
    if (formMode === 'edit' && editingId && activeSection === 'grades') {
      return await updateGrade(editingId, data);
    } else {
      return await createGrade(data);
    }
  }, [formMode, editingId, activeSection, createGrade, updateGrade]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id, 'grades');
    await fetchGradeById(id);
  }, [setFormMode, fetchGradeById]);

  const startCreate = useCallback(() => {
    setFormMode('create', undefined, 'grades');
  }, [setFormMode]);

  const cancelForm = useCallback(() => {
    setFormMode(null);
  }, [setFormMode]);

  return {
    submitting: submitting && activeSection === 'grades',
    formMode: activeSection === 'grades' ? formMode : null,
    editingId: activeSection === 'grades' ? editingId : null,
    currentGrade,
    handleSubmit,
    startEdit,
    startCreate,
    cancelForm
  };
}

// Hook especializado para formularios de configuración de horario
export function useScheduleConfigForm() {
  const {
    state: { submitting, formMode, editingId, currentScheduleConfig, activeSection },
    createScheduleConfig,
    updateScheduleConfig,
    setFormMode,
    fetchScheduleConfigById
  } = useGradeScheduleConfigContext();

  const handleSubmit = useCallback(async (data: CreateScheduleConfigDto | UpdateScheduleConfigDto) => {
    if (formMode === 'edit' && editingId && activeSection === 'scheduleConfigs') {
      return await updateScheduleConfig(editingId, data as UpdateScheduleConfigDto);
    } else {
      return await createScheduleConfig(data as CreateScheduleConfigDto);
    }
  }, [formMode, editingId, activeSection, createScheduleConfig, updateScheduleConfig]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id, 'scheduleConfigs');
    await fetchScheduleConfigById(id);
  }, [setFormMode, fetchScheduleConfigById]);

  const startCreate = useCallback(() => {
    setFormMode('create', undefined, 'scheduleConfigs');
  }, [setFormMode]);

  const cancelForm = useCallback(() => {
    setFormMode(null);
  }, [setFormMode]);

  return {
    submitting: submitting && activeSection === 'scheduleConfigs',
    formMode: activeSection === 'scheduleConfigs' ? formMode : null,
    editingId: activeSection === 'scheduleConfigs' ? editingId : null,
    currentScheduleConfig,
    handleSubmit,
    startEdit,
    startCreate,
    cancelForm
  };
}

// Hook especializado para listas de grados
export function useGradeList() {
  const {
    state: { grades, meta, loading, error },
    fetchGrades
  } = useGradeScheduleConfigContext();

  return {
    grades,
    meta: meta.grades,
    loading: loading.grades,
    error,
    refetch: fetchGrades
  };
}

// Hook especializado para listas de configuraciones
export function useScheduleConfigList() {
  const {
    state: { scheduleConfigs, meta, loading, error },
    fetchScheduleConfigs,
    removeScheduleConfig
  } = useGradeScheduleConfigContext();

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta configuración de horario?')) {
      return await removeScheduleConfig(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeScheduleConfig]);

  return {
    scheduleConfigs,
    meta: meta.scheduleConfigs,
    loading: loading.scheduleConfigs,
    error,
    handleDelete,
    refetch: fetchScheduleConfigs
  };
}

// Hook especializado para configuración por sección
export function useScheduleConfigBySection() {
  const {
    state: { currentScheduleConfig, selectedSection, loading },
    fetchScheduleConfigBySection,
    setSelectedSection
  } = useGradeScheduleConfigContext();

  const loadConfigBySection = useCallback(async (sectionId: number) => {
    setSelectedSection(sectionId);
    await fetchScheduleConfigBySection(sectionId);
  }, [setSelectedSection, fetchScheduleConfigBySection]);

  return {
    scheduleConfig: currentScheduleConfig,
    selectedSection,
    loading: loading.general,
    loadConfigBySection
  };
}