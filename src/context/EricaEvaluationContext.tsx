// src/contexts/EricaEvaluationContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
  EricaEvaluation,
  EricaEvaluationWithRelations,
  CreateEricaEvaluationRequest,
  UpdateEricaEvaluationRequest,
  SaveGridRequest,
  BulkCreateEvaluationsRequest,
  EvaluationFilters,
  EvaluationGridResponse,
  TopicStats,
  TopicSummary,
  TeacherAnalytics,
  PendingTopic,
  EvaluationResponse,
  ValidationResult,
  SaveGridResult
} from '@/types/erica-evaluations';
import {
  getEricaEvaluations,
  createEricaEvaluation,
  updateEricaEvaluation,
  getEricaEvaluationById,
  deleteEricaEvaluation,
  createBulkEvaluations,
  getEvaluationGrid,
  saveEvaluationGrid,
  getTopicSummary,
  getTopicStats,
  getStudentTopicEvaluations,
  getStudentCourseEvaluations,
  getSectionWeekEvaluations,
  getPendingEvaluationsByTeacher,
  getTeacherAnalytics,
  validateEvaluationData,
  recalculateTopicPoints,
  getActiveEvaluations,
  getEvaluationsByBimester,
  getEvaluationsByCourse,
  getEvaluationsBySection,
  getEvaluationsByTeacher,
  getEvaluationStats
} from '@/services/ericaEvaluationService';

// Estado del contexto
interface EricaEvaluationState {
  // Data
  evaluations: EricaEvaluationWithRelations[];
  currentEvaluation: EricaEvaluationWithRelations | null;
  evaluationGrid: EvaluationGridResponse | null;
  topicSummary: TopicSummary | null;
  topicStats: TopicStats | null;
  teacherAnalytics: TeacherAnalytics | null;
  pendingTopics: PendingTopic[];
  evaluationStats: any | null;
  
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
  loadingGrid: boolean;
  loadingStats: boolean;
  loadingSummary: boolean;
  loadingAnalytics: boolean;
  loadingPending: boolean;
  
  // Estados de error
  error: string | null;
  gridError: string | null;
  
  // Filtros actuales
  filters: EvaluationFilters;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | 'grid' | null;
  editingId: number | null;
  currentTopicId: number | null;
  
  // Validación
  validationResult: ValidationResult | null;
}

// Acciones
type EricaEvaluationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_LOADING_GRID'; payload: boolean }
  | { type: 'SET_LOADING_STATS'; payload: boolean }
  | { type: 'SET_LOADING_SUMMARY'; payload: boolean }
  | { type: 'SET_LOADING_ANALYTICS'; payload: boolean }
  | { type: 'SET_LOADING_PENDING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GRID_ERROR'; payload: string | null }
  | { type: 'SET_EVALUATIONS'; payload: { data: EricaEvaluationWithRelations[]; meta: EricaEvaluationState['meta'] } }
  | { type: 'ADD_EVALUATION'; payload: EricaEvaluationWithRelations }
  | { type: 'ADD_BULK_EVALUATIONS'; payload: EricaEvaluationWithRelations[] }
  | { type: 'UPDATE_EVALUATION'; payload: { id: number; data: EricaEvaluationWithRelations } }
  | { type: 'REMOVE_EVALUATION'; payload: number }
  | { type: 'SET_CURRENT_EVALUATION'; payload: EricaEvaluationWithRelations | null }
  | { type: 'SET_EVALUATION_GRID'; payload: EvaluationGridResponse | null }
  | { type: 'SET_TOPIC_SUMMARY'; payload: TopicSummary | null }
  | { type: 'SET_TOPIC_STATS'; payload: TopicStats | null }
  | { type: 'SET_TEACHER_ANALYTICS'; payload: TeacherAnalytics | null }
  | { type: 'SET_PENDING_TOPICS'; payload: PendingTopic[] }
  | { type: 'SET_EVALUATION_STATS'; payload: any | null }
  | { type: 'SET_FILTERS'; payload: EvaluationFilters }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | 'grid' | null; editingId?: number; topicId?: number } }
  | { type: 'SET_VALIDATION_RESULT'; payload: ValidationResult | null }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: EricaEvaluationState = {
  evaluations: [],
  currentEvaluation: null,
  evaluationGrid: null,
  topicSummary: null,
  topicStats: null,
  teacherAnalytics: null,
  pendingTopics: [],
  evaluationStats: null,
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  loading: false,
  submitting: false,
  loadingGrid: false,
  loadingStats: false,
  loadingSummary: false,
  loadingAnalytics: false,
  loadingPending: false,
  error: null,
  gridError: null,
  filters: {},
  formMode: null,
  editingId: null,
  currentTopicId: null,
  validationResult: null
};

// Reducer
function ericaEvaluationReducer(state: EricaEvaluationState, action: EricaEvaluationAction): EricaEvaluationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_LOADING_GRID':
      return { ...state, loadingGrid: action.payload };
      
    case 'SET_LOADING_STATS':
      return { ...state, loadingStats: action.payload };
      
    case 'SET_LOADING_SUMMARY':
      return { ...state, loadingSummary: action.payload };
      
    case 'SET_LOADING_ANALYTICS':
      return { ...state, loadingAnalytics: action.payload };
      
    case 'SET_LOADING_PENDING':
      return { ...state, loadingPending: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_GRID_ERROR':
      return { ...state, gridError: action.payload };
      
    case 'SET_EVALUATIONS':
      return {
        ...state,
        evaluations: action.payload.data,
        meta: action.payload.meta,
        loading: false,
        error: null
      };
      
    case 'ADD_EVALUATION':
      return {
        ...state,
        evaluations: [action.payload, ...state.evaluations],
        meta: {
          ...state.meta,
          total: state.meta.total + 1
        }
      };
      
    case 'ADD_BULK_EVALUATIONS':
      return {
        ...state,
        evaluations: [...action.payload, ...state.evaluations],
        meta: {
          ...state.meta,
          total: state.meta.total + action.payload.length
        }
      };
      
    case 'UPDATE_EVALUATION':
      return {
        ...state,
        evaluations: state.evaluations.map(evaluation =>
          evaluation.id === action.payload.id ? action.payload.data : evaluation
        ),
        currentEvaluation: state.currentEvaluation?.id === action.payload.id 
          ? action.payload.data 
          : state.currentEvaluation
      };
      
    case 'REMOVE_EVALUATION':
      return {
        ...state,
        evaluations: state.evaluations.filter(evaluation => evaluation.id !== action.payload),
        meta: {
          ...state.meta,
          total: Math.max(0, state.meta.total - 1)
        }
      };
      
    case 'SET_CURRENT_EVALUATION':
      return { ...state, currentEvaluation: action.payload };
      
    case 'SET_EVALUATION_GRID':
      return { ...state, evaluationGrid: action.payload, loadingGrid: false, gridError: null };
      
    case 'SET_TOPIC_SUMMARY':
      return { ...state, topicSummary: action.payload, loadingSummary: false };
      
    case 'SET_TOPIC_STATS':
      return { ...state, topicStats: action.payload, loadingStats: false };
      
    case 'SET_TEACHER_ANALYTICS':
      return { ...state, teacherAnalytics: action.payload, loadingAnalytics: false };
      
    case 'SET_PENDING_TOPICS':
      return { ...state, pendingTopics: action.payload, loadingPending: false };
      
    case 'SET_EVALUATION_STATS':
      return { ...state, evaluationStats: action.payload };
      
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
      
    case 'SET_FORM_MODE':
      return {
        ...state,
        formMode: action.payload.mode,
        editingId: action.payload.editingId || null,
        currentTopicId: action.payload.topicId || null
      };
      
    case 'SET_VALIDATION_RESULT':
      return { ...state, validationResult: action.payload };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Tipos del contexto
interface EricaEvaluationContextType {
  // Estado
  state: EricaEvaluationState;
  
  // Acciones de datos básicas
  fetchEvaluations: (filters?: EvaluationFilters) => Promise<void>;
  fetchEvaluationById: (id: number) => Promise<void>;
  fetchActiveEvaluations: (filters?: EvaluationFilters) => Promise<void>;
  fetchEvaluationsByBimester: (bimesterId: number, filters?: Omit<EvaluationFilters, 'bimesterId'>) => Promise<void>;
  fetchEvaluationsByCourse: (courseId: number, filters?: Omit<EvaluationFilters, 'courseId'>) => Promise<void>;
  fetchEvaluationsBySection: (sectionId: number, filters?: Omit<EvaluationFilters, 'sectionId'>) => Promise<void>;
  fetchEvaluationsByTeacher: (teacherId: number, filters?: Omit<EvaluationFilters, 'teacherId'>) => Promise<void>;
  
  // Acciones específicas de grid
  fetchEvaluationGrid: (topicId: number, includeEmpty?: boolean) => Promise<void>;
  saveGrid: (gridData: SaveGridRequest) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  
  // Acciones de estadísticas y resúmenes
  fetchTopicSummary: (topicId: number) => Promise<void>;
  fetchTopicStats: (topicId: number) => Promise<void>;
  fetchTeacherAnalytics: (teacherId: number, filters?: { bimesterId?: number; courseId?: number }) => Promise<void>;
  fetchPendingEvaluations: (teacherId: number, bimesterId?: number) => Promise<void>;
  fetchEvaluationStats: () => Promise<void>;
  
  // Acciones específicas de consultas
  fetchStudentTopicEvaluations: (studentId: number, topicId: number) => Promise<void>;
  fetchStudentCourseEvaluations: (studentId: number, courseId: number, bimesterId: number) => Promise<void>;
  fetchSectionWeekEvaluations: (sectionId: number, courseId: number, weekId: number) => Promise<void>;
  
  // Acciones CRUD
  createEvaluation: (data: CreateEricaEvaluationRequest) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  createBulkEvaluations: (data: BulkCreateEvaluationsRequest) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateEvaluation: (id: number, data: UpdateEricaEvaluationRequest) => Promise<{ success: boolean; message?: string }>;
  removeEvaluation: (id: number) => Promise<{ success: boolean; message?: string }>;
  
  // Utilidades
  validateEvaluation: (enrollmentId: number, topicId: number, categoryId: number, teacherId: number) => Promise<void>;
  recalculatePoints: (topicId: number) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de UI
  setFilters: (filters: EvaluationFilters) => void;
  setFormMode: (mode: 'create' | 'edit' | 'grid' | null, editingId?: number, topicId?: number) => void;
  clearError: () => void;
  clearGridError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshEvaluations: () => Promise<void>;
  getEvaluationById: (id: number) => EricaEvaluationWithRelations | undefined;
}

// Crear contexto
const EricaEvaluationContext = createContext<EricaEvaluationContextType | undefined>(undefined);

// Provider del contexto
interface EricaEvaluationProviderProps {
  children: ReactNode;
}

export function EricaEvaluationProvider({ children }: EricaEvaluationProviderProps) {
  const [state, dispatch] = useReducer(ericaEvaluationReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Función auxiliar para manejar errores del grid
  const handleGridError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_GRID_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Función auxiliar para convertir respuesta a formato estándar
  const normalizeEvaluationResponse = useCallback((response: EricaEvaluationWithRelations[] | EvaluationResponse) => {
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
    return {
      data: response.data,
      meta: response.meta
    };
  }, []);

  // ==================== ACCIONES DE DATOS BÁSICAS ====================

  const fetchEvaluations = useCallback(async (filters?: EvaluationFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getEricaEvaluations(filters);
      const normalizedResponse = normalizeEvaluationResponse(response);
      
      dispatch({
        type: 'SET_EVALUATIONS',
        payload: normalizedResponse
      });
      
      if (filters) {
        if (filters) {
       dispatch({ type: 'SET_FILTERS', payload: filters || {} });

      }
      }
    } catch (error) {
      handleError(error, 'Error al cargar las evaluaciones');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeEvaluationResponse]);

  const fetchEvaluationById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const evaluation = await getEricaEvaluationById(id);
      dispatch({ type: 'SET_CURRENT_EVALUATION', payload: evaluation });
    } catch (error) {
      handleError(error, 'Error al cargar la evaluación');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchActiveEvaluations = useCallback(async (filters?: EvaluationFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getActiveEvaluations(filters);
      const normalizedResponse = normalizeEvaluationResponse(response);
      
      dispatch({
        type: 'SET_EVALUATIONS',
        payload: normalizedResponse
      });
      
    dispatch({ type: 'SET_FILTERS', payload: filters || {} });

    } catch (error) {
      handleError(error, 'Error al cargar las evaluaciones activas');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeEvaluationResponse]);

  const fetchEvaluationsByBimester = useCallback(async (
    bimesterId: number,
    filters?: Omit<EvaluationFilters, 'bimesterId'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getEvaluationsByBimester(bimesterId, filters);
      const normalizedResponse = normalizeEvaluationResponse(response);
      
      dispatch({
        type: 'SET_EVALUATIONS',
        payload: normalizedResponse
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, bimesterId } });
    } catch (error) {
      handleError(error, 'Error al cargar las evaluaciones por bimestre');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeEvaluationResponse]);

  const fetchEvaluationsByCourse = useCallback(async (
    courseId: number,
    filters?: Omit<EvaluationFilters, 'courseId'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getEvaluationsByCourse(courseId, filters);
      const normalizedResponse = normalizeEvaluationResponse(response);
      
      dispatch({
        type: 'SET_EVALUATIONS',
        payload: normalizedResponse
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, courseId } });
    } catch (error) {
      handleError(error, 'Error al cargar las evaluaciones por curso');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeEvaluationResponse]);

  const fetchEvaluationsBySection = useCallback(async (
    sectionId: number,
    filters?: Omit<EvaluationFilters, 'sectionId'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getEvaluationsBySection(sectionId, filters);
      const normalizedResponse = normalizeEvaluationResponse(response);
      
      dispatch({
        type: 'SET_EVALUATIONS',
        payload: normalizedResponse
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, sectionId } });
    } catch (error) {
      handleError(error, 'Error al cargar las evaluaciones por sección');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeEvaluationResponse]);

  const fetchEvaluationsByTeacher = useCallback(async (
    teacherId: number,
    filters?: Omit<EvaluationFilters, 'teacherId'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getEvaluationsByTeacher(teacherId, filters);
      const normalizedResponse = normalizeEvaluationResponse(response);
      
      dispatch({
        type: 'SET_EVALUATIONS',
        payload: normalizedResponse
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, teacherId } });
    } catch (error) {
      handleError(error, 'Error al cargar las evaluaciones por maestro');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeEvaluationResponse]);

  // ==================== ACCIONES ESPECÍFICAS DE GRID ====================

  const fetchEvaluationGrid = useCallback(async (topicId: number, includeEmpty: boolean = false) => {
    try {
      dispatch({ type: 'SET_LOADING_GRID', payload: true });
      dispatch({ type: 'SET_GRID_ERROR', payload: null });
      
      const gridResponse = await getEvaluationGrid(topicId, includeEmpty);
      dispatch({ type: 'SET_EVALUATION_GRID', payload: gridResponse });
      dispatch({ type: 'SET_FORM_MODE', payload: { mode: 'grid', topicId } });
    } catch (error) {
      handleGridError(error, 'Error al cargar el grid de evaluación');
    } finally {
      dispatch({ type: 'SET_LOADING_GRID', payload: false });
    }
  }, [handleGridError]);

  const saveGrid = useCallback(async (gridData: SaveGridRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_GRID_ERROR', payload: null });
      
      const result = await saveEvaluationGrid(gridData);
      
      toast.success("Grid de evaluación guardado correctamente");
      
      // Refrescar el grid después de guardarlo
      await fetchEvaluationGrid(gridData.topicId);
      
      return { success: true };
    } catch (error: any) {
      const message = handleGridError(error, 'Error al guardar el grid de evaluación');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleGridError, fetchEvaluationGrid]);

  // ==================== ACCIONES DE ESTADÍSTICAS Y RESÚMENES ====================

  const fetchTopicSummary = useCallback(async (topicId: number) => {
    try {
      dispatch({ type: 'SET_LOADING_SUMMARY', payload: true });
      
      const summary = await getTopicSummary(topicId);
      dispatch({ type: 'SET_TOPIC_SUMMARY', payload: summary });
    } catch (error) {
      handleError(error, 'Error al cargar el resumen del tema');
    } finally {
      dispatch({ type: 'SET_LOADING_SUMMARY', payload: false });
    }
  }, [handleError]);

  const fetchTopicStats = useCallback(async (topicId: number) => {
    try {
      dispatch({ type: 'SET_LOADING_STATS', payload: true });
      
      const stats = await getTopicStats(topicId);
      dispatch({ type: 'SET_TOPIC_STATS', payload: stats });
    } catch (error) {
      handleError(error, 'Error al cargar las estadísticas del tema');
    } finally {
      dispatch({ type: 'SET_LOADING_STATS', payload: false });
    }
  }, [handleError]);

  const fetchTeacherAnalytics = useCallback(async (
    teacherId: number,
    filters?: { bimesterId?: number; courseId?: number }
  ) => {
    try {
      dispatch({ type: 'SET_LOADING_ANALYTICS', payload: true });
      
      const analytics = await getTeacherAnalytics(teacherId, filters);
      dispatch({ type: 'SET_TEACHER_ANALYTICS', payload: analytics });
    } catch (error) {
      handleError(error, 'Error al cargar las analíticas del maestro');
    } finally {
      dispatch({ type: 'SET_LOADING_ANALYTICS', payload: false });
    }
  }, [handleError]);

  const fetchPendingEvaluations = useCallback(async (teacherId: number, bimesterId?: number) => {
    try {
      dispatch({ type: 'SET_LOADING_PENDING', payload: true });
      
      const pending = await getPendingEvaluationsByTeacher(teacherId, bimesterId);
      dispatch({ type: 'SET_PENDING_TOPICS', payload: pending });
    } catch (error) {
      handleError(error, 'Error al cargar las evaluaciones pendientes');
    } finally {
      dispatch({ type: 'SET_LOADING_PENDING', payload: false });
    }
  }, [handleError]);

  const fetchEvaluationStats = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING_STATS', payload: true });
      
      const stats = await getEvaluationStats();
      dispatch({ type: 'SET_EVALUATION_STATS', payload: stats });
    } catch (error) {
      handleError(error, 'Error al cargar las estadísticas de evaluaciones');
    } finally {
      dispatch({ type: 'SET_LOADING_STATS', payload: false });
    }
  }, [handleError]);

  // ==================== ACCIONES ESPECÍFICAS DE CONSULTAS ====================

  const fetchStudentTopicEvaluations = useCallback(async (studentId: number, topicId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const evaluations = await getStudentTopicEvaluations(studentId, topicId);
      const normalizedResponse = normalizeEvaluationResponse(evaluations);
      
      dispatch({
        type: 'SET_EVALUATIONS',
        payload: normalizedResponse
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { studentId, topicId } });
    } catch (error) {
      handleError(error, 'Error al cargar las evaluaciones del estudiante');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeEvaluationResponse]);

  const fetchStudentCourseEvaluations = useCallback(async (
    studentId: number,
    courseId: number,
    bimesterId: number
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const evaluations = await getStudentCourseEvaluations(studentId, courseId, bimesterId);
      const normalizedResponse = normalizeEvaluationResponse(evaluations);
      
      dispatch({
        type: 'SET_EVALUATIONS',
        payload: normalizedResponse
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { studentId, courseId, bimesterId } });
    } catch (error) {
      handleError(error, 'Error al cargar las evaluaciones del curso');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeEvaluationResponse]);

  const fetchSectionWeekEvaluations = useCallback(async (
    sectionId: number,
    courseId: number,
    weekId: number
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const evaluations = await getSectionWeekEvaluations(sectionId, courseId, weekId);
      const normalizedResponse = normalizeEvaluationResponse(evaluations);
      
      dispatch({
        type: 'SET_EVALUATIONS',
        payload: normalizedResponse
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { sectionId, courseId } });
    } catch (error) {
      handleError(error, 'Error al cargar las evaluaciones de la sección');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, normalizeEvaluationResponse]);

  // ==================== ACCIONES CRUD ====================

  const createEvaluationAction = useCallback(async (data: CreateEricaEvaluationRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newEvaluation = await createEricaEvaluation(data);
      dispatch({ type: 'ADD_EVALUATION', payload: newEvaluation });
      
      toast.success("Evaluación registrada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al registrar la evaluación');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const createBulkEvaluationsAction = useCallback(async (data: BulkCreateEvaluationsRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newEvaluations = await createBulkEvaluations(data);
      dispatch({ type: 'ADD_BULK_EVALUATIONS', payload: newEvaluations });
      
      toast.success(`${newEvaluations.length} evaluaciones creadas correctamente`);
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al crear las evaluaciones');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateEvaluationAction = useCallback(async (id: number, data: UpdateEricaEvaluationRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedEvaluation = await updateEricaEvaluation(id, data);
      dispatch({
        type: 'UPDATE_EVALUATION',
        payload: { id, data: updatedEvaluation }
      });
      
      toast.success("Evaluación actualizada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar la evaluación');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeEvaluation = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteEricaEvaluation(id);
      dispatch({ type: 'REMOVE_EVALUATION', payload: id });
      
      toast.success("Evaluación eliminada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar la evaluación');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // ==================== UTILIDADES ====================

  const validateEvaluation = useCallback(async (
    enrollmentId: number,
    topicId: number,
    categoryId: number,
    teacherId: number
  ) => {
    try {
      const result = await validateEvaluationData(enrollmentId, topicId, categoryId, teacherId);
      dispatch({ type: 'SET_VALIDATION_RESULT', payload: result });
    } catch (error) {
      handleError(error, 'Error al validar los datos de evaluación');
    }
  }, [handleError]);

  const recalculatePoints = useCallback(async (topicId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      
      await recalculateTopicPoints(topicId);
      
      toast.success("Puntos recalculados correctamente");
      
      // Refrescar estadísticas del tema
      await fetchTopicStats(topicId);
      
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al recalcular puntos');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, fetchTopicStats]);

  // ==================== ACCIONES DE UI ====================

  const setFilters = useCallback((filters: EvaluationFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setFormMode = useCallback((
    mode: 'create' | 'edit' | 'grid' | null,
    editingId?: number,
    topicId?: number
  ) => {
    dispatch({ type: 'SET_FORM_MODE', payload: { mode, editingId, topicId } });
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

  // ==================== UTILIDADES ADICIONALES ====================

  const refreshEvaluations = useCallback(async () => {
    await fetchEvaluations(state.filters);
  }, [fetchEvaluations, state.filters]);

  const getEvaluationByIdFromState = useCallback((id: number) => {
    return state.evaluations.find(evaluation => evaluation.id === id);
  }, [state.evaluations]);

  // Valor del contexto
  const contextValue: EricaEvaluationContextType = {
    state,
    
    // Acciones de datos básicas
    fetchEvaluations,
    fetchEvaluationById,
    fetchActiveEvaluations,
    fetchEvaluationsByBimester,
    fetchEvaluationsByCourse,
    fetchEvaluationsBySection,
    fetchEvaluationsByTeacher,
    
    // Acciones específicas de grid
    fetchEvaluationGrid,
    saveGrid,
    
    // Acciones de estadísticas y resúmenes
    fetchTopicSummary,
    fetchTopicStats,
    fetchTeacherAnalytics,
    fetchPendingEvaluations,
    fetchEvaluationStats,
    
    // Acciones específicas de consultas
    fetchStudentTopicEvaluations,
    fetchStudentCourseEvaluations,
    fetchSectionWeekEvaluations,
    
    // Acciones CRUD
    createEvaluation: createEvaluationAction,
    createBulkEvaluations: createBulkEvaluationsAction,
    updateEvaluation: updateEvaluationAction,
    removeEvaluation,
    
    // Utilidades
    validateEvaluation,
    recalculatePoints,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    clearError,
    clearGridError,
    resetState,
    
    // Utilidades adicionales
    refreshEvaluations,
    getEvaluationById: getEvaluationByIdFromState
  };

  return (
    <EricaEvaluationContext.Provider value={contextValue}>
      {children}
    </EricaEvaluationContext.Provider>
  );
}

// ==================== HOOKS PARA USAR EL CONTEXTO ====================

// Hook principal para usar el contexto
export function useEricaEvaluationContext() {
  const context = useContext(EricaEvaluationContext);
  if (context === undefined) {
    throw new Error('useEricaEvaluationContext must be used within an EricaEvaluationProvider');
  }
  return context;
}

// Hook especializado para formularios
export function useEricaEvaluationForm() {
  const {
    state: { submitting, formMode, editingId, currentTopicId, currentEvaluation, validationResult },
    createEvaluation,
    updateEvaluation,
    setFormMode,
    fetchEvaluationById,
    validateEvaluation
  } = useEricaEvaluationContext();

  const handleSubmit = useCallback(async (data: CreateEricaEvaluationRequest) => {
    if (formMode === 'edit' && editingId) {
      return await updateEvaluation(editingId, data);
    } else {
      return await createEvaluation(data);
    }
  }, [formMode, editingId, createEvaluation, updateEvaluation]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id);
    await fetchEvaluationById(id);
  }, [setFormMode, fetchEvaluationById]);

  const startCreate = useCallback(() => {
    setFormMode('create');
  }, [setFormMode]);

  const startGrid = useCallback((topicId: number) => {
    setFormMode('grid', undefined, topicId);
  }, [setFormMode]);

  const cancelForm = useCallback(() => {
    setFormMode(null);
  }, [setFormMode]);

  const handleValidation = useCallback(async (
    enrollmentId: number,
    topicId: number,
    categoryId: number,
    teacherId: number
  ) => {
    await validateEvaluation(enrollmentId, topicId, categoryId, teacherId);
  }, [validateEvaluation]);

  return {
    submitting,
    formMode,
    editingId,
    currentTopicId,
    currentEvaluation,
    validationResult,
    handleSubmit,
    startEdit,
    startCreate,
    startGrid,
    cancelForm,
    handleValidation
  };
}

// Hook especializado para listas
export function useEricaEvaluationList() {
  const {
    state: { evaluations, meta, loading, error, filters },
    fetchEvaluations,
    setFilters,
    removeEvaluation
  } = useEricaEvaluationContext();

  const handleFilterChange = useCallback(async (newFilters: EvaluationFilters) => {
    setFilters(newFilters);
    await fetchEvaluations(newFilters);
  }, [setFilters, fetchEvaluations]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta evaluación?')) {
      return await removeEvaluation(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeEvaluation]);

  return {
    evaluations,
    meta,
    loading,
    error,
    filters,
    handleFilterChange,
    handleDelete,
    refetch: () => fetchEvaluations(filters)
  };
}

// Hook especializado para el grid de evaluación
export function useEricaEvaluationGrid() {
  const {
    state: { evaluationGrid, loadingGrid, gridError, submitting, currentTopicId },
    fetchEvaluationGrid,
    saveGrid,
    fetchTopicSummary,
    fetchTopicStats,
    clearGridError
  } = useEricaEvaluationContext();

  const loadGrid = useCallback(async (topicId: number, includeEmpty?: boolean) => {
    await fetchEvaluationGrid(topicId, includeEmpty);
    // Cargar también el resumen y estadísticas
    await Promise.all([
      fetchTopicSummary(topicId),
      fetchTopicStats(topicId)
    ]);
  }, [fetchEvaluationGrid, fetchTopicSummary, fetchTopicStats]);

  const handleSaveGrid = useCallback(async (gridData: SaveGridRequest) => {
    const result = await saveGrid(gridData);
    if (result.success) {
      // Recargar grid después de guardar
      await loadGrid(gridData.topicId);
    }
    return result;
  }, [saveGrid, loadGrid]);

  const refreshGrid = useCallback(async () => {
    if (currentTopicId) {
      await loadGrid(currentTopicId);
    }
  }, [currentTopicId, loadGrid]);

  return {
    evaluationGrid,
    loading: loadingGrid,
    error: gridError,
    submitting,
    currentTopicId,
    loadGrid,
    saveGrid: handleSaveGrid,
    refreshGrid,
    clearError: clearGridError
  };
}

// Hook especializado para estadísticas
export function useEricaEvaluationStats() {
  const {
    state: { topicStats, topicSummary, teacherAnalytics, evaluationStats, loadingStats, loadingAnalytics },
    fetchTopicStats,
    fetchTopicSummary,
    fetchTeacherAnalytics,
    fetchEvaluationStats
  } = useEricaEvaluationContext();

  return {
    topicStats,
    topicSummary,
    teacherAnalytics,
    evaluationStats,
    loadingStats,
    loadingAnalytics,
    fetchTopicStats,
    fetchTopicSummary,
    fetchTeacherAnalytics,
    fetchEvaluationStats
  };
}

// Hook especializado para evaluaciones pendientes
export function useEricaEvaluationPending() {
  const {
    state: { pendingTopics, loadingPending },
    fetchPendingEvaluations
  } = useEricaEvaluationContext();

  const loadPendingEvaluations = useCallback(async (teacherId: number, bimesterId?: number) => {
    await fetchPendingEvaluations(teacherId, bimesterId);
  }, [fetchPendingEvaluations]);

  return {
    pendingTopics,
    loading: loadingPending,
    loadPendingEvaluations
  };
}

// Hook especializado para consultas específicas
export function useEricaEvaluationQueries() {
  const {
    fetchStudentTopicEvaluations,
    fetchStudentCourseEvaluations,
    fetchSectionWeekEvaluations,
    fetchEvaluationsByBimester,
    fetchEvaluationsByCourse,
    fetchEvaluationsBySection,
    fetchEvaluationsByTeacher
  } = useEricaEvaluationContext();

  return {
    fetchStudentTopicEvaluations,
    fetchStudentCourseEvaluations,
    fetchSectionWeekEvaluations,
    fetchEvaluationsByBimester,
    fetchEvaluationsByCourse,
    fetchEvaluationsBySection,
    fetchEvaluationsByTeacher
  };
}