// src/contexts/QnaContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  EricaConfig,
  CalculatedResult,
  QnaGrid,
  CreateEricaConfigRequest,
  UpdateEricaConfigRequest,
  GetQnaGridRequest,
  RecalculateQnaRequest,
  StudentResultsResponse,
  BimesterCourseSummaryResponse,
  BimesterSectionStatsResponse,
  TeacherAnalyticsResponse,
  BimesterHealthResponse,
  ConfigFilters
} from '@/types/qna';
import {
  getEricaConfigs,
  createEricaConfig,
  updateEricaConfig,
  getEricaConfigByKey,
  deleteEricaConfig,
  getQnaGrid,
  recalculateQnaResults,
  recalculateBimesterCourse,
  getStudentResults,
  getBimesterCourseSummary,
  getBimesterSectionStats,
  getTeacherAnalytics,
  setupDefaultConfigs,
  checkBimesterHealth
} from '@/services/qnaService';

// Estado del contexto
interface QnaState {
  // Configuraciones
  configs: EricaConfig[];
  currentConfig: EricaConfig | null;
  
  // Grid QNA
  qnaGrid: QnaGrid | null;
  
  // Resultados
  studentResults: StudentResultsResponse | null;
  bimesterSummary: BimesterCourseSummaryResponse | null;
  sectionStats: BimesterSectionStatsResponse | null;
  teacherAnalytics: TeacherAnalyticsResponse | null;
  bimesterHealth: BimesterHealthResponse | null;
  
  // Estados de carga
  loading: boolean;
  loadingGrid: boolean;
  loadingConfigs: boolean;
  loadingResults: boolean;
  loadingStats: boolean;
  submitting: boolean;
  calculating: boolean;
  
  // Estados de error
  error: string | null;
  gridError: string | null;
  
  // Filtros y contexto actual
  gridFilters: GetQnaGridRequest | null;
  configFilters: ConfigFilters;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | null;
  editingConfigId: number | null;
}

// Acciones
type QnaAction =
  // Estados de carga
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_GRID'; payload: boolean }
  | { type: 'SET_LOADING_CONFIGS'; payload: boolean }
  | { type: 'SET_LOADING_RESULTS'; payload: boolean }
  | { type: 'SET_LOADING_STATS'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_CALCULATING'; payload: boolean }
  
  // Estados de error
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GRID_ERROR'; payload: string | null }
  
  // Datos
  | { type: 'SET_CONFIGS'; payload: EricaConfig[] }
  | { type: 'ADD_CONFIG'; payload: EricaConfig }
  | { type: 'UPDATE_CONFIG'; payload: { id: number; data: EricaConfig } }
  | { type: 'REMOVE_CONFIG'; payload: number }
  | { type: 'SET_CURRENT_CONFIG'; payload: EricaConfig | null }
  
  // Grid y resultados
  | { type: 'SET_QNA_GRID'; payload: QnaGrid | null }
  | { type: 'SET_STUDENT_RESULTS'; payload: StudentResultsResponse | null }
  | { type: 'SET_BIMESTER_SUMMARY'; payload: BimesterCourseSummaryResponse | null }
  | { type: 'SET_SECTION_STATS'; payload: BimesterSectionStatsResponse | null }
  | { type: 'SET_TEACHER_ANALYTICS'; payload: TeacherAnalyticsResponse | null }
  | { type: 'SET_BIMESTER_HEALTH'; payload: BimesterHealthResponse | null }
  
  // Filtros
  | { type: 'SET_GRID_FILTERS'; payload: GetQnaGridRequest | null }
  | { type: 'SET_CONFIG_FILTERS'; payload: ConfigFilters }
  
  // Formulario
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | null; editingId?: number } }
  
  // Reset
  | { type: 'RESET_STATE' }
  | { type: 'RESET_GRID' }
  | { type: 'RESET_RESULTS' };

// Estado inicial
const initialState: QnaState = {
  configs: [],
  currentConfig: null,
  qnaGrid: null,
  studentResults: null,
  bimesterSummary: null,
  sectionStats: null,
  teacherAnalytics: null,
  bimesterHealth: null,
  loading: false,
  loadingGrid: false,
  loadingConfigs: false,
  loadingResults: false,
  loadingStats: false,
  submitting: false,
  calculating: false,
  error: null,
  gridError: null,
  gridFilters: null,
  configFilters: {},
  formMode: null,
  editingConfigId: null
};

// Reducer
function qnaReducer(state: QnaState, action: QnaAction): QnaState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_LOADING_GRID':
      return { ...state, loadingGrid: action.payload };
      
    case 'SET_LOADING_CONFIGS':
      return { ...state, loadingConfigs: action.payload };
      
    case 'SET_LOADING_RESULTS':
      return { ...state, loadingResults: action.payload };
      
    case 'SET_LOADING_STATS':
      return { ...state, loadingStats: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_CALCULATING':
      return { ...state, calculating: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_GRID_ERROR':
      return { ...state, gridError: action.payload };
      
    case 'SET_CONFIGS':
      return { ...state, configs: action.payload, loadingConfigs: false, error: null };
      
    case 'ADD_CONFIG':
      return { ...state, configs: [action.payload, ...state.configs] };
      
    case 'UPDATE_CONFIG':
      return {
        ...state,
        configs: state.configs.map(config =>
          config.id === action.payload.id ? action.payload.data : config
        ),
        currentConfig: state.currentConfig?.id === action.payload.id 
          ? action.payload.data 
          : state.currentConfig
      };
      
    case 'REMOVE_CONFIG':
      return {
        ...state,
        configs: state.configs.filter(config => config.id !== action.payload)
      };
      
    case 'SET_CURRENT_CONFIG':
      return { ...state, currentConfig: action.payload };
      
    case 'SET_QNA_GRID':
      return { ...state, qnaGrid: action.payload, loadingGrid: false, gridError: null };
      
    case 'SET_STUDENT_RESULTS':
      return { ...state, studentResults: action.payload, loadingResults: false };
      
    case 'SET_BIMESTER_SUMMARY':
      return { ...state, bimesterSummary: action.payload, loadingResults: false };
      
    case 'SET_SECTION_STATS':
      return { ...state, sectionStats: action.payload, loadingStats: false };
      
    case 'SET_TEACHER_ANALYTICS':
      return { ...state, teacherAnalytics: action.payload, loadingStats: false };
      
    case 'SET_BIMESTER_HEALTH':
      return { ...state, bimesterHealth: action.payload, loading: false };
      
    case 'SET_GRID_FILTERS':
      return { ...state, gridFilters: action.payload };
      
    case 'SET_CONFIG_FILTERS':
      return { ...state, configFilters: action.payload };
      
    case 'SET_FORM_MODE':
      return {
        ...state,
        formMode: action.payload.mode,
        editingConfigId: action.payload.editingId || null
      };
      
    case 'RESET_STATE':
      return initialState;
      
    case 'RESET_GRID':
      return {
        ...state,
        qnaGrid: null,
        gridError: null,
        loadingGrid: false,
        gridFilters: null
      };
      
    case 'RESET_RESULTS':
      return {
        ...state,
        studentResults: null,
        bimesterSummary: null,
        sectionStats: null,
        teacherAnalytics: null,
        bimesterHealth: null,
        loadingResults: false,
        loadingStats: false
      };
      
    default:
      return state;
  }
}

// Tipos del contexto
interface QnaContextType {
  // Estado
  state: QnaState;
  
  // Configuraciones ERICA
  fetchConfigs: (filters?: ConfigFilters) => Promise<void>;
  fetchConfigByKey: (configType: string, configKey: string) => Promise<void>;
  createConfig: (data: CreateEricaConfigRequest) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateConfig: (id: number, data: UpdateEricaConfigRequest) => Promise<{ success: boolean; message?: string }>;
  removeConfig: (id: number) => Promise<{ success: boolean; message?: string }>;
  setupDefaults: () => Promise<{ success: boolean; message?: string }>;
  
  // Grid QNA
  fetchQnaGrid: (params: GetQnaGridRequest) => Promise<void>;
  refreshGrid: () => Promise<void>;
  clearGrid: () => void;
  
  // Cálculos
  recalculate: (data: RecalculateQnaRequest) => Promise<{ success: boolean; message?: string }>;
  recalculateBimester: (bimesterId: number, courseId: number, sectionId?: number) => Promise<{ success: boolean; message?: string }>;
  
  // Resultados y estadísticas
  fetchStudentResults: (enrollmentId: number, bimesterId: number, courseId: number, calculationType?: string) => Promise<void>;
  fetchBimesterSummary: (bimesterId: number, courseId: number, sectionId?: number) => Promise<void>;
  fetchSectionStats: (bimesterId: number, sectionId: number, courseId?: number) => Promise<void>;
  fetchTeacherAnalytics: (teacherId: number, bimesterId: number, courseId?: number, sectionId?: number) => Promise<void>;
  fetchBimesterHealth: (bimesterId: number) => Promise<void>;
  
  // Acciones de UI
  setConfigFilters: (filters: ConfigFilters) => void;
  setGridFilters: (filters: GetQnaGridRequest) => void;
  setFormMode: (mode: 'create' | 'edit' | null, editingId?: number) => void;
  clearError: () => void;
  clearGridError: () => void;
  resetState: () => void;
  resetResults: () => void;
  
  // Utilidades
  getConfigById: (id: number) => EricaConfig | undefined;
}

// Crear contexto
const QnaContext = createContext<QnaContextType | undefined>(undefined);

// Provider del contexto
interface QnaProviderProps {
  children: ReactNode;
}

export function QnaProvider({ children }: QnaProviderProps) {
  const [state, dispatch] = useReducer(qnaReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  const handleGridError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_GRID_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // ==================== CONFIGURACIONES ERICA ====================
  
  const fetchConfigs = useCallback(async (filters?: ConfigFilters) => {
    try {
      dispatch({ type: 'SET_LOADING_CONFIGS', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const configs = await getEricaConfigs(filters);
      dispatch({ type: 'SET_CONFIGS', payload: configs });
      
      if (filters) {
        dispatch({ type: 'SET_CONFIG_FILTERS', payload: filters });
      }
    } catch (error) {
      handleError(error, 'Error al cargar las configuraciones');
    } finally {
      dispatch({ type: 'SET_LOADING_CONFIGS', payload: false });
    }
  }, [handleError]);

  const fetchConfigByKey = useCallback(async (configType: string, configKey: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const config = await getEricaConfigByKey(configType, configKey);
      dispatch({ type: 'SET_CURRENT_CONFIG', payload: config });
    } catch (error) {
      handleError(error, 'Error al cargar la configuración');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const createConfigAction = useCallback(async (data: CreateEricaConfigRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newConfig = await createEricaConfig(data);
      dispatch({ type: 'ADD_CONFIG', payload: newConfig });
      
      toast.success("Configuración creada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al crear la configuración');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateConfigAction = useCallback(async (id: number, data: UpdateEricaConfigRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedConfig = await updateEricaConfig(id, data);
      dispatch({
        type: 'UPDATE_CONFIG',
        payload: { id, data: updatedConfig }
      });
      
      toast.success("Configuración actualizada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar la configuración');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeConfig = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteEricaConfig(id);
      dispatch({ type: 'REMOVE_CONFIG', payload: id });
      
      toast.success("Configuración eliminada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar la configuración');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const setupDefaults = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await setupDefaultConfigs();
      
      // Refrescar configs después de configurar defaults
      await fetchConfigs();
      
      toast.success(result.message);
      return { success: true, message: result.message };
    } catch (error: any) {
      const message = handleError(error, 'Error al configurar valores por defecto');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, fetchConfigs]);

  // ==================== GRID QNA ====================
  
  const fetchQnaGrid = useCallback(async (params: GetQnaGridRequest) => {
    try {
      dispatch({ type: 'SET_LOADING_GRID', payload: true });
      dispatch({ type: 'SET_GRID_ERROR', payload: null });
      
      const gridData = await getQnaGrid(params);
      dispatch({ type: 'SET_QNA_GRID', payload: gridData });
      dispatch({ type: 'SET_GRID_FILTERS', payload: params });
    } catch (error) {
      handleGridError(error, 'Error al cargar el grid QNA');
    } finally {
      dispatch({ type: 'SET_LOADING_GRID', payload: false });
    }
  }, [handleGridError]);

  const refreshGrid = useCallback(async () => {
    if (state.gridFilters) {
      await fetchQnaGrid(state.gridFilters);
    }
  }, [fetchQnaGrid, state.gridFilters]);

  const clearGrid = useCallback(() => {
    dispatch({ type: 'RESET_GRID' });
  }, []);

  // ==================== CÁLCULOS ====================
  
  const recalculate = useCallback(async (data: RecalculateQnaRequest) => {
    try {
      dispatch({ type: 'SET_CALCULATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await recalculateQnaResults(data);
      
      toast.success(result.message);
      
      // Refrescar grid si está disponible
      if (state.gridFilters) {
        await fetchQnaGrid(state.gridFilters);
      }
      
      return { success: true, message: result.message };
    } catch (error: any) {
      const message = handleError(error, 'Error al recalcular resultados');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_CALCULATING', payload: false });
    }
  }, [handleError, fetchQnaGrid, state.gridFilters]);

  const recalculateBimester = useCallback(async (
    bimesterId: number, 
    courseId: number, 
    sectionId?: number
  ) => {
    try {
      dispatch({ type: 'SET_CALCULATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await recalculateBimesterCourse(bimesterId, courseId, sectionId);
      
      toast.success(result.message);
      
      // Refrescar datos relevantes
      if (state.gridFilters) {
        await fetchQnaGrid(state.gridFilters);
      }
      
      return { success: true, message: result.message };
    } catch (error: any) {
      const message = handleError(error, 'Error al recalcular bimestre');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_CALCULATING', payload: false });
    }
  }, [handleError, fetchQnaGrid, state.gridFilters]);

  // ==================== RESULTADOS Y ESTADÍSTICAS ====================
  
  const fetchStudentResults = useCallback(async (
    enrollmentId: number,
    bimesterId: number,
    courseId: number,
    calculationType?: string
  ) => {
    try {
      dispatch({ type: 'SET_LOADING_RESULTS', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const results = await getStudentResults(enrollmentId, bimesterId, courseId, calculationType);
      dispatch({ type: 'SET_STUDENT_RESULTS', payload: results });
    } catch (error) {
      handleError(error, 'Error al cargar resultados del estudiante');
    } finally {
      dispatch({ type: 'SET_LOADING_RESULTS', payload: false });
    }
  }, [handleError]);

  const fetchBimesterSummary = useCallback(async (
    bimesterId: number,
    courseId: number,
    sectionId?: number
  ) => {
    try {
      dispatch({ type: 'SET_LOADING_RESULTS', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const summary = await getBimesterCourseSummary(bimesterId, courseId, sectionId);
      dispatch({ type: 'SET_BIMESTER_SUMMARY', payload: summary });
    } catch (error) {
      handleError(error, 'Error al cargar resumen del bimestre');
    } finally {
      dispatch({ type: 'SET_LOADING_RESULTS', payload: false });
    }
  }, [handleError]);

  const fetchSectionStats = useCallback(async (
    bimesterId: number,
    sectionId: number,
    courseId?: number
  ) => {
    try {
      dispatch({ type: 'SET_LOADING_STATS', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const stats = await getBimesterSectionStats(bimesterId, sectionId, courseId);
      dispatch({ type: 'SET_SECTION_STATS', payload: stats });
    } catch (error) {
      handleError(error, 'Error al cargar estadísticas de la sección');
    } finally {
      dispatch({ type: 'SET_LOADING_STATS', payload: false });
    }
  }, [handleError]);

  const fetchTeacherAnalytics = useCallback(async (
    teacherId: number,
    bimesterId: number,
    courseId?: number,
    sectionId?: number
  ) => {
    try {
      dispatch({ type: 'SET_LOADING_STATS', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const analytics = await getTeacherAnalytics(teacherId, bimesterId, courseId, sectionId);
      dispatch({ type: 'SET_TEACHER_ANALYTICS', payload: analytics });
    } catch (error) {
      handleError(error, 'Error al cargar analíticas del profesor');
    } finally {
      dispatch({ type: 'SET_LOADING_STATS', payload: false });
    }
  }, [handleError]);

  const fetchBimesterHealth = useCallback(async (bimesterId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const health = await checkBimesterHealth(bimesterId);
      dispatch({ type: 'SET_BIMESTER_HEALTH', payload: health });
    } catch (error) {
      handleError(error, 'Error al verificar salud del bimestre');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  // ==================== ACCIONES DE UI ====================
  
  const setConfigFilters = useCallback((filters: ConfigFilters) => {
    dispatch({ type: 'SET_CONFIG_FILTERS', payload: filters });
  }, []);

  const setGridFilters = useCallback((filters: GetQnaGridRequest) => {
    dispatch({ type: 'SET_GRID_FILTERS', payload: filters });
  }, []);

  const setFormMode = useCallback((mode: 'create' | 'edit' | null, editingId?: number) => {
    dispatch({ type: 'SET_FORM_MODE', payload: { mode, editingId } });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const clearGridError = useCallback(() => {
    dispatch({ type: 'SET_GRID_ERROR', payload: null });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const resetResults = useCallback(() => {
    dispatch({ type: 'RESET_RESULTS' });
  }, []);

  // Utilidades
  const getConfigById = useCallback((id: number) => {
    return state.configs.find(config => config.id === id);
  }, [state.configs]);

  // Valor del contexto
  const contextValue: QnaContextType = {
    state,
    
    // Configuraciones ERICA
    fetchConfigs,
    fetchConfigByKey,
    createConfig: createConfigAction,
    updateConfig: updateConfigAction,
    removeConfig,
    setupDefaults,
    
    // Grid QNA
    fetchQnaGrid,
    refreshGrid,
    clearGrid,
    
    // Cálculos
    recalculate,
    recalculateBimester,
    
    // Resultados y estadísticas
    fetchStudentResults,
    fetchBimesterSummary,
    fetchSectionStats,
    fetchTeacherAnalytics,
    fetchBimesterHealth,
    
    // Acciones de UI
    setConfigFilters,
    setGridFilters,
    setFormMode,
    clearError,
    clearGridError,
    resetState,
    resetResults,
    
    // Utilidades
    getConfigById
  };

  return (
    <QnaContext.Provider value={contextValue}>
      {children}
    </QnaContext.Provider>
  );
}

// Hook principal para usar el contexto
export function useQnaContext() {
  const context = useContext(QnaContext);
  if (context === undefined) {
    throw new Error('useQnaContext must be used within a QnaProvider');
  }
  return context;
}

// ==================== HOOKS ESPECIALIZADOS ====================

// Hook para configuraciones
export function useQnaConfigs() {
  const {
    state: { configs, loading: loadingConfigs, submitting, formMode, editingConfigId, currentConfig },
    fetchConfigs,
    createConfig,
    updateConfig,
    removeConfig,
    setFormMode,
    fetchConfigByKey,
    setupDefaults
  } = useQnaContext();

  const handleSubmit = useCallback(async (data: CreateEricaConfigRequest) => {
    if (formMode === 'edit' && editingConfigId) {
      return await updateConfig(editingConfigId, data);
    } else {
      return await createConfig(data);
    }
  }, [formMode, editingConfigId, createConfig, updateConfig]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id);
    // Buscar config en estado local primero
    const existingConfig = configs.find(c => c.id === id);
    if (existingConfig) {
      // Si ya está en el estado, no necesitamos hacer fetch adicional
      return;
    }
  }, [setFormMode, configs]);

  const startCreate = useCallback(() => {
    setFormMode('create');
  }, [setFormMode]);

  const cancelForm = useCallback(() => {
    setFormMode(null);
  }, [setFormMode]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta configuración?')) {
      return await removeConfig(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeConfig]);

  return {
    configs,
    loading: loadingConfigs,
    submitting,
    formMode,
    editingConfigId,
    currentConfig,
    handleSubmit,
    startEdit,
    startCreate,
    cancelForm,
    handleDelete,
    refetch: fetchConfigs,
    setupDefaults
  };
}

// Hook para el grid QNA
export function useQnaGrid() {
  const {
    state: { qnaGrid, loadingGrid, gridError, gridFilters },
    fetchQnaGrid,
    refreshGrid,
    clearGrid,
    setGridFilters,
    clearGridError
  } = useQnaContext();

  const loadGrid = useCallback(async (params: GetQnaGridRequest) => {
    setGridFilters(params);
    await fetchQnaGrid(params);
  }, [fetchQnaGrid, setGridFilters]);

  return {
    qnaGrid,
    loading: loadingGrid,
    error: gridError,
    filters: gridFilters,
    loadGrid,
    refreshGrid,
    clearGrid,
    clearError: clearGridError
  };
}

// Hook para cálculos
export function useQnaCalculations() {
  const {
    state: { calculating, error },
    recalculate,
    recalculateBimester,
    clearError
  } = useQnaContext();

  return {
    calculating,
    error,
    recalculate,
    recalculateBimester,
    clearError
  };
}

// Hook para resultados de estudiante
export function useStudentQnaResults() {
  const {
    state: { studentResults, loadingResults, error },
    fetchStudentResults,
    clearError
  } = useQnaContext();

  return {
    results: studentResults,
    loading: loadingResults,
    error,
    fetchResults: fetchStudentResults,
    clearError
  };
}

// Hook para estadísticas y analíticas
export function useQnaAnalytics() {
  const {
    state: { 
      bimesterSummary, 
      sectionStats, 
      teacherAnalytics, 
      bimesterHealth,
      loadingStats, 
      loadingResults,
      loading,
      error 
    },
    fetchBimesterSummary,
    fetchSectionStats,
    fetchTeacherAnalytics,
    fetchBimesterHealth,
    clearError
  } = useQnaContext();

  return {
    bimesterSummary,
    sectionStats,
    teacherAnalytics,
    bimesterHealth,
    loadingStats,
    loadingResults,
    loadingHealth: loading,
    error,
    fetchBimesterSummary,
    fetchSectionStats,
    fetchTeacherAnalytics,
    fetchBimesterHealth,
    clearError
  };
}

// Hook para salud del bimestre
export function useBimesterHealth() {
  const {
    state: { bimesterHealth, loading, error },
    fetchBimesterHealth,
    clearError
  } = useQnaContext();

  return {
    health: bimesterHealth,
    loading,
    error,
    checkHealth: fetchBimesterHealth,
    clearError
  };
}

// Hook para configuraciones por tipo
export function useQnaConfigsByType() {
  const { state: { configs } } = useQnaContext();

  const getConfigsByType = useCallback((configType: string) => {
    return configs.filter(config => config.configType === configType);
  }, [configs]);

  const getConfigByKey = useCallback((configType: string, configKey: string) => {
    return configs.find(
      config => config.configType === configType && config.configKey === configKey
    );
  }, [configs]);

  const getColorConfigs = useCallback(() => {
    return configs.filter(config => 
      config.category === 'colors' || config.configType === 'color_ranges'
    );
  }, [configs]);

  const getSystemConfigs = useCallback(() => {
    return configs.filter(config => 
      config.category === 'system' || config.configType === 'system'
    );
  }, [configs]);

  return {
    getConfigsByType,
    getConfigByKey,
    getColorConfigs,
    getSystemConfigs
  };
}