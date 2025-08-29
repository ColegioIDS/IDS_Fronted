// src/contexts/EricaTopicsContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
  EricaTopic,
  EricaTopicFormValues,
  CreateEricaTopicRequest,
  UpdateEricaTopicRequest,
  BulkCreateEricaTopicsRequest,
  EricaTopicFilters,
  EricaTopicResponse,
  EricaTopicWithEvaluations,
  SectionWeekTopics,
  TeacherPendingTopics,
  SectionCoursePlanning,
  TeacherTopicStats,
  MarkCompleteRequest,
  DuplicateTopicRequest,
  DuplicateTopicResponse,
  EvaluationGridData
} from '@/types/erica-topics';
import {
  getEricaTopics,
  createEricaTopic,
  updateEricaTopic,
  getEricaTopicById,
  deleteEricaTopic,
  createEricaTopicsBulk,
  getEricaTopicWithEvaluations,
  getTopicsBySectionAndWeek,
  getPendingTopicsByTeacher,
  getSectionCoursePlanning,
  getTeacherTopicStats,
  markEricaTopicComplete,
  duplicateEricaTopic,
  getEvaluationGrid,
  getActiveEricaTopics,
  getCompletedEricaTopics,
  getPendingEricaTopics,
  searchEricaTopics,
  getEricaTopicsByDateRange,
  getEricaTopicsByCourse,
  getEricaTopicsBySection,
  getEricaTopicsByTeacher,
  getEricaTopicsByBimester,
  markMultipleTopicsComplete,
  updateMultipleTopics,
  deleteMultipleTopics,
  validateTopicCreation,
  validateTopicCompletion
} from '@/services/erica-topics';

// Estado del contexto
interface EricaTopicsState {
  // Data principal
  topics: EricaTopic[];
  currentTopic: EricaTopic | null;
  currentTopicWithEvaluations: EricaTopicWithEvaluations | null;
  
  // Data específica
  sectionWeekTopics: SectionWeekTopics | null;
  teacherPendingTopics: TeacherPendingTopics | null;
  sectionCoursePlanning: SectionCoursePlanning | null;
  teacherStats: TeacherTopicStats | null;
  evaluationGrid: EvaluationGridData | null;
  
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
  loadingGrid: boolean;
  loadingSectionData: boolean;
  
  // Estados de error
  error: string | null;
  
  // Filtros actuales
  filters: EricaTopicFilters;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | 'duplicate' | null;
  editingId: number | null;
  duplicatingId: number | null;
  
  // Validaciones
  validationResults: {
    canCreate: boolean;
    canComplete: boolean;
    message?: string;
  };
}

// Acciones
type EricaTopicsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_LOADING_STATS'; payload: boolean }
  | { type: 'SET_LOADING_GRID'; payload: boolean }
  | { type: 'SET_LOADING_SECTION_DATA'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TOPICS'; payload: { data: EricaTopic[]; meta: EricaTopicsState['meta'] } }
  | { type: 'ADD_TOPIC'; payload: EricaTopic }
  | { type: 'ADD_BULK_TOPICS'; payload: EricaTopic[] }
  | { type: 'UPDATE_TOPIC'; payload: { id: number; data: EricaTopic } }
  | { type: 'REMOVE_TOPIC'; payload: number }
  | { type: 'REMOVE_MULTIPLE_TOPICS'; payload: number[] }
  | { type: 'SET_CURRENT_TOPIC'; payload: EricaTopic | null }
  | { type: 'SET_CURRENT_TOPIC_WITH_EVALUATIONS'; payload: EricaTopicWithEvaluations | null }
  | { type: 'SET_SECTION_WEEK_TOPICS'; payload: SectionWeekTopics | null }
  | { type: 'SET_TEACHER_PENDING_TOPICS'; payload: TeacherPendingTopics | null }
  | { type: 'SET_SECTION_COURSE_PLANNING'; payload: SectionCoursePlanning | null }
  | { type: 'SET_TEACHER_STATS'; payload: TeacherTopicStats | null }
  | { type: 'SET_EVALUATION_GRID'; payload: EvaluationGridData | null }
  | { type: 'SET_FILTERS'; payload: EricaTopicFilters }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | 'duplicate' | null; editingId?: number; duplicatingId?: number } }
  | { type: 'SET_VALIDATION_RESULTS'; payload: { canCreate: boolean; canComplete: boolean; message?: string } }
  | { type: 'MARK_TOPIC_COMPLETE'; payload: { id: number; isCompleted: boolean } }
  | { type: 'MARK_MULTIPLE_TOPICS_COMPLETE'; payload: { ids: number[]; isCompleted: boolean } }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: EricaTopicsState = {
  topics: [],
  currentTopic: null,
  currentTopicWithEvaluations: null,
  sectionWeekTopics: null,
  teacherPendingTopics: null,
  sectionCoursePlanning: null,
  teacherStats: null,
  evaluationGrid: null,
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  loading: false,
  submitting: false,
  loadingStats: false,
  loadingGrid: false,
  loadingSectionData: false,
  error: null,
  filters: {},
  formMode: null,
  editingId: null,
  duplicatingId: null,
  validationResults: {
    canCreate: true,
    canComplete: true
  }
};

// Reducer
function ericaTopicsReducer(state: EricaTopicsState, action: EricaTopicsAction): EricaTopicsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_LOADING_STATS':
      return { ...state, loadingStats: action.payload };
      
    case 'SET_LOADING_GRID':
      return { ...state, loadingGrid: action.payload };
      
    case 'SET_LOADING_SECTION_DATA':
      return { ...state, loadingSectionData: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_TOPICS':
      return {
        ...state,
        topics: action.payload.data,
        meta: action.payload.meta,
        loading: false,
        error: null
      };
      
    case 'ADD_TOPIC':
      return {
        ...state,
        topics: [action.payload, ...state.topics],
        meta: {
          ...state.meta,
          total: state.meta.total + 1
        }
      };
      
    case 'ADD_BULK_TOPICS':
      return {
        ...state,
        topics: [...action.payload, ...state.topics],
        meta: {
          ...state.meta,
          total: state.meta.total + action.payload.length
        }
      };
      
    case 'UPDATE_TOPIC':
      return {
        ...state,
        topics: state.topics.map(topic =>
          topic.id === action.payload.id ? action.payload.data : topic
        ),
        currentTopic: state.currentTopic?.id === action.payload.id 
          ? action.payload.data 
          : state.currentTopic
      };
      
    case 'REMOVE_TOPIC':
      return {
        ...state,
        topics: state.topics.filter(topic => topic.id !== action.payload),
        meta: {
          ...state.meta,
          total: Math.max(0, state.meta.total - 1)
        }
      };
      
    case 'REMOVE_MULTIPLE_TOPICS':
      return {
        ...state,
        topics: state.topics.filter(topic => !action.payload.includes(topic.id)),
        meta: {
          ...state.meta,
          total: Math.max(0, state.meta.total - action.payload.length)
        }
      };
      
    case 'SET_CURRENT_TOPIC':
      return { ...state, currentTopic: action.payload };
      
    case 'SET_CURRENT_TOPIC_WITH_EVALUATIONS':
      return { ...state, currentTopicWithEvaluations: action.payload };
      
    case 'SET_SECTION_WEEK_TOPICS':
      return { ...state, sectionWeekTopics: action.payload, loadingSectionData: false };
      
    case 'SET_TEACHER_PENDING_TOPICS':
      return { ...state, teacherPendingTopics: action.payload, loadingSectionData: false };
      
    case 'SET_SECTION_COURSE_PLANNING':
      return { ...state, sectionCoursePlanning: action.payload, loadingSectionData: false };
      
    case 'SET_TEACHER_STATS':
      return { ...state, teacherStats: action.payload, loadingStats: false };
      
    case 'SET_EVALUATION_GRID':
      return { ...state, evaluationGrid: action.payload, loadingGrid: false };
      
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
      
    case 'SET_FORM_MODE':
      return {
        ...state,
        formMode: action.payload.mode,
        editingId: action.payload.editingId || null,
        duplicatingId: action.payload.duplicatingId || null
      };
      
    case 'SET_VALIDATION_RESULTS':
      return { ...state, validationResults: action.payload };
      
    case 'MARK_TOPIC_COMPLETE':
      return {
        ...state,
        topics: state.topics.map(topic =>
          topic.id === action.payload.id 
            ? { ...topic, isCompleted: action.payload.isCompleted }
            : topic
        )
      };
      
    case 'MARK_MULTIPLE_TOPICS_COMPLETE':
      return {
        ...state,
        topics: state.topics.map(topic =>
          action.payload.ids.includes(topic.id)
            ? { ...topic, isCompleted: action.payload.isCompleted }
            : topic
        )
      };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Tipos del contexto
interface EricaTopicsContextType {
  // Estado
  state: EricaTopicsState;
  
  // Acciones de datos básicos
  fetchTopics: (filters?: EricaTopicFilters) => Promise<void>;
  fetchTopicById: (id: number) => Promise<void>;
  fetchTopicWithEvaluations: (id: number) => Promise<void>;
  
  // Acciones de datos específicos
  fetchSectionWeekTopics: (sectionId: number, weekId: number, courseId?: number) => Promise<void>;
  fetchTeacherPendingTopics: (teacherId: number, bimesterId?: number) => Promise<void>;
  fetchSectionCoursePlanning: (sectionId: number, courseId: number, bimesterId?: number) => Promise<void>;
  fetchTeacherStats: (teacherId: number, bimesterId?: number) => Promise<void>;
  fetchEvaluationGrid: (topicId: number, includeEmpty?: boolean) => Promise<void>;
  
  // Acciones CRUD
  createTopic: (data: CreateEricaTopicRequest) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  createBulkTopics: (data: BulkCreateEricaTopicsRequest) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateTopic: (id: number, data: UpdateEricaTopicRequest) => Promise<{ success: boolean; message?: string }>;
  removeTopic: (id: number) => Promise<{ success: boolean; message?: string }>;
  removeMultipleTopics: (ids: number[]) => Promise<{ success: boolean; message?: string }>;
  markTopicComplete: (id: number, data: MarkCompleteRequest) => Promise<{ success: boolean; message?: string }>;
  markMultipleComplete: (ids: number[], isCompleted: boolean, notes?: string) => Promise<{ success: boolean; message?: string }>;
  duplicateTopic: (id: number, data: DuplicateTopicRequest) => Promise<{ success: boolean; data?: DuplicateTopicResponse; message?: string }>;
  
  // Acciones de búsqueda y filtros
  searchTopics: (searchTerm: string, filters?: Omit<EricaTopicFilters, 'search'>) => Promise<void>;
  fetchActiveTopics: (filters?: EricaTopicFilters) => Promise<void>;
  fetchCompletedTopics: (filters?: EricaTopicFilters) => Promise<void>;
  fetchPendingTopics: (filters?: EricaTopicFilters) => Promise<void>;
  fetchTopicsByDateRange: (dateFrom: Date, dateTo: Date, filters?: Omit<EricaTopicFilters, 'dateFrom' | 'dateTo'>) => Promise<void>;
  fetchTopicsByCourse: (courseId: number, filters?: Omit<EricaTopicFilters, 'courseId'>) => Promise<void>;
  fetchTopicsBySection: (sectionId: number, filters?: Omit<EricaTopicFilters, 'sectionId'>) => Promise<void>;
  fetchTopicsByTeacher: (teacherId: number, filters?: Omit<EricaTopicFilters, 'teacherId'>) => Promise<void>;
  fetchTopicsByBimester: (bimesterId: number, filters?: Omit<EricaTopicFilters, 'bimesterId'>) => Promise<void>;
  
  // Validaciones
  validateTopicCreation: (courseId: number, academicWeekId: number, sectionId: number) => Promise<void>;
  validateTopicCompletion: (topicId: number) => Promise<void>;
  
  // Acciones de UI
  setFilters: (filters: EricaTopicFilters) => void;
  setFormMode: (mode: 'create' | 'edit' | 'duplicate' | null, editingId?: number, duplicatingId?: number) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshTopics: () => Promise<void>;
  getTopicById: (id: number) => EricaTopic | undefined;
}

// Crear contexto
const EricaTopicsContext = createContext<EricaTopicsContextType | undefined>(undefined);

// Provider del contexto
interface EricaTopicsProviderProps {
  children: ReactNode;
}

export function EricaTopicsProvider({ children }: EricaTopicsProviderProps) {
  const [state, dispatch] = useReducer(ericaTopicsReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Función auxiliar para procesar respuestas de getEricaTopics
  const processTopicsResponse = useCallback((result: EricaTopic[] | EricaTopicResponse) => {
    if (Array.isArray(result)) {
      return {
        data: result,
        meta: {
          total: result.length,
          page: 1,
          limit: result.length,
          totalPages: 1
        }
      };
    }
    return {
      data: result.data,
      meta: result.meta
    };
  }, []);

  // ==================== ACCIONES DE DATOS BÁSICOS ====================

  const fetchTopics = useCallback(async (filters?: EricaTopicFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await getEricaTopics(filters);
      const { data, meta } = processTopicsResponse(result);
      
      dispatch({
        type: 'SET_TOPICS',
        payload: { data, meta }
      });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      handleError(error, 'Error al cargar los temas');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, processTopicsResponse]);

  const fetchTopicById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const topic = await getEricaTopicById(id);
      dispatch({ type: 'SET_CURRENT_TOPIC', payload: topic });
    } catch (error) {
      handleError(error, 'Error al cargar el tema');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchTopicWithEvaluations = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const topicWithEvaluations = await getEricaTopicWithEvaluations(id);
      dispatch({ type: 'SET_CURRENT_TOPIC_WITH_EVALUATIONS', payload: topicWithEvaluations });
    } catch (error) {
      handleError(error, 'Error al cargar el tema con evaluaciones');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  // ==================== ACCIONES DE DATOS ESPECÍFICOS ====================

  const fetchSectionWeekTopics = useCallback(async (
    sectionId: number,
    weekId: number,
    courseId?: number
  ) => {
    try {
      dispatch({ type: 'SET_LOADING_SECTION_DATA', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const sectionWeekTopics = await getTopicsBySectionAndWeek(sectionId, weekId, courseId);
      dispatch({ type: 'SET_SECTION_WEEK_TOPICS', payload: sectionWeekTopics });
    } catch (error) {
      handleError(error, 'Error al cargar los temas de la sección y semana');
    } finally {
      dispatch({ type: 'SET_LOADING_SECTION_DATA', payload: false });
    }
  }, [handleError]);

  const fetchTeacherPendingTopics = useCallback(async (
    teacherId: number,
    bimesterId?: number
  ) => {
    try {
      dispatch({ type: 'SET_LOADING_SECTION_DATA', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const pendingTopics = await getPendingTopicsByTeacher(teacherId, bimesterId);
      dispatch({ type: 'SET_TEACHER_PENDING_TOPICS', payload: pendingTopics });
    } catch (error) {
      handleError(error, 'Error al cargar los temas pendientes del maestro');
    } finally {
      dispatch({ type: 'SET_LOADING_SECTION_DATA', payload: false });
    }
  }, [handleError]);

  const fetchSectionCoursePlanning = useCallback(async (
    sectionId: number,
    courseId: number,
    bimesterId?: number
  ) => {
    try {
      dispatch({ type: 'SET_LOADING_SECTION_DATA', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const planning = await getSectionCoursePlanning(sectionId, courseId, bimesterId);
      dispatch({ type: 'SET_SECTION_COURSE_PLANNING', payload: planning });
    } catch (error) {
      handleError(error, 'Error al cargar la planificación de la sección');
    } finally {
      dispatch({ type: 'SET_LOADING_SECTION_DATA', payload: false });
    }
  }, [handleError]);

  const fetchTeacherStats = useCallback(async (
    teacherId: number,
    bimesterId?: number
  ) => {
    try {
      dispatch({ type: 'SET_LOADING_STATS', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const stats = await getTeacherTopicStats(teacherId, bimesterId);
      dispatch({ type: 'SET_TEACHER_STATS', payload: stats });
    } catch (error) {
      handleError(error, 'Error al cargar las estadísticas del maestro');
    } finally {
      dispatch({ type: 'SET_LOADING_STATS', payload: false });
    }
  }, [handleError]);

  const fetchEvaluationGrid = useCallback(async (
    topicId: number,
    includeEmpty: boolean = false
  ) => {
    try {
      dispatch({ type: 'SET_LOADING_GRID', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const grid = await getEvaluationGrid(topicId, includeEmpty);
      dispatch({ type: 'SET_EVALUATION_GRID', payload: grid });
    } catch (error) {
      handleError(error, 'Error al cargar la grilla de evaluación');
    } finally {
      dispatch({ type: 'SET_LOADING_GRID', payload: false });
    }
  }, [handleError]);

  // ==================== ACCIONES CRUD ====================

  const createTopicAction = useCallback(async (data: CreateEricaTopicRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newTopic = await createEricaTopic(data);
      dispatch({ type: 'ADD_TOPIC', payload: newTopic });
      
      toast.success("Tema creado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al crear el tema');
      return {
        success: false,
        message,
        details: error.response?.data?.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const createBulkTopicsAction = useCallback(async (data: BulkCreateEricaTopicsRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newTopics = await createEricaTopicsBulk(data);
      dispatch({ type: 'ADD_BULK_TOPICS', payload: newTopics });
      
      toast.success(`${newTopics.length} temas creados correctamente`);
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al crear los temas');
      return {
        success: false,
        message,
        details: error.response?.data?.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateTopicAction = useCallback(async (id: number, data: UpdateEricaTopicRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedTopic = await updateEricaTopic(id, data);
      dispatch({
        type: 'UPDATE_TOPIC',
        payload: { id, data: updatedTopic }
      });
      
      toast.success("Tema actualizado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar el tema');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeTopicAction = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteEricaTopic(id);
      dispatch({ type: 'REMOVE_TOPIC', payload: id });
      
      toast.success("Tema eliminado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar el tema');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeMultipleTopicsAction = useCallback(async (ids: number[]) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteMultipleTopics(ids);
      dispatch({ type: 'REMOVE_MULTIPLE_TOPICS', payload: ids });
      
      toast.success(`${ids.length} temas eliminados correctamente`);
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar los temas');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const markTopicCompleteAction = useCallback(async (id: number, data: MarkCompleteRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedTopic = await markEricaTopicComplete(id, data);
      dispatch({
        type: 'UPDATE_TOPIC',
        payload: { id, data: updatedTopic }
      });
      
      toast.success(`Tema marcado como ${data.isCompleted ? 'completado' : 'pendiente'}`);
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al marcar el tema');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const markMultipleCompleteAction = useCallback(async (
    ids: number[],
    isCompleted: boolean,
    notes?: string
  ) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await markMultipleTopicsComplete(ids, isCompleted, notes);
      dispatch({
        type: 'MARK_MULTIPLE_TOPICS_COMPLETE',
        payload: { ids, isCompleted }
      });
      
      toast.success(`${ids.length} temas marcados como ${isCompleted ? 'completados' : 'pendientes'}`);
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al marcar los temas');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const duplicateTopicAction = useCallback(async (id: number, data: DuplicateTopicRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const duplicateResult = await duplicateEricaTopic(id, data);
      
      // Si el resultado incluye el tema duplicado, agregarlo al estado
      if (duplicateResult.duplicatedTopic) {
        dispatch({ type: 'ADD_TOPIC', payload: duplicateResult.duplicatedTopic });
      }
      
      toast.success("Tema duplicado correctamente");
      return { success: true, data: duplicateResult };
    } catch (error: any) {
      const message = handleError(error, 'Error al duplicar el tema');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // ==================== ACCIONES DE BÚSQUEDA Y FILTROS ====================

  const searchTopicsAction = useCallback(async (
    searchTerm: string,
    filters?: Omit<EricaTopicFilters, 'search'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const topics = await searchEricaTopics(searchTerm, filters);
      const { data, meta } = processTopicsResponse(topics);
      
      dispatch({
        type: 'SET_TOPICS',
        payload: { data, meta }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, search: searchTerm } });
    } catch (error) {
      handleError(error, 'Error al buscar temas');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, processTopicsResponse]);

  const fetchActiveTopicsAction = useCallback(async (filters?: EricaTopicFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const topics = await getActiveEricaTopics(filters);
      const { data, meta } = processTopicsResponse(topics);
      
      dispatch({
        type: 'SET_TOPICS',
        payload: { data, meta }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, isActive: true } });
    } catch (error) {
      handleError(error, 'Error al cargar temas activos');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, processTopicsResponse]);

  const fetchCompletedTopicsAction = useCallback(async (filters?: EricaTopicFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const topics = await getCompletedEricaTopics(filters);
      const { data, meta } = processTopicsResponse(topics);
      
      dispatch({
        type: 'SET_TOPICS',
        payload: { data, meta }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, isCompleted: true } });
    } catch (error) {
      handleError(error, 'Error al cargar temas completados');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, processTopicsResponse]);

  const fetchPendingTopicsAction = useCallback(async (filters?: EricaTopicFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const topics = await getPendingEricaTopics(filters);
      const { data, meta } = processTopicsResponse(topics);
      
      dispatch({
        type: 'SET_TOPICS',
        payload: { data, meta }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, isCompleted: false, isActive: true } });
    } catch (error) {
      handleError(error, 'Error al cargar temas pendientes');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, processTopicsResponse]);

  const fetchTopicsByDateRangeAction = useCallback(async (
    dateFrom: Date,
    dateTo: Date,
    filters?: Omit<EricaTopicFilters, 'dateFrom' | 'dateTo'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const topics = await getEricaTopicsByDateRange(dateFrom, dateTo, filters);
      const { data, meta } = processTopicsResponse(topics);
      
      dispatch({
        type: 'SET_TOPICS',
        payload: { data, meta }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, dateFrom, dateTo } });
    } catch (error) {
      handleError(error, 'Error al cargar temas por rango de fechas');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, processTopicsResponse]);

  const fetchTopicsByCourseAction = useCallback(async (
    courseId: number,
    filters?: Omit<EricaTopicFilters, 'courseId'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const topics = await getEricaTopicsByCourse(courseId, filters);
      const { data, meta } = processTopicsResponse(topics);
      
      dispatch({
        type: 'SET_TOPICS',
        payload: { data, meta }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, courseId } });
    } catch (error) {
      handleError(error, 'Error al cargar temas por curso');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, processTopicsResponse]);

  const fetchTopicsBySectionAction = useCallback(async (
    sectionId: number,
    filters?: Omit<EricaTopicFilters, 'sectionId'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const topics = await getEricaTopicsBySection(sectionId, filters);
      const { data, meta } = processTopicsResponse(topics);
      
      dispatch({
        type: 'SET_TOPICS',
        payload: { data, meta }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, sectionId } });
    } catch (error) {
      handleError(error, 'Error al cargar temas por sección');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, processTopicsResponse]);

  const fetchTopicsByTeacherAction = useCallback(async (
    teacherId: number,
    filters?: Omit<EricaTopicFilters, 'teacherId'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const topics = await getEricaTopicsByTeacher(teacherId, filters);
      const { data, meta } = processTopicsResponse(topics);
      
      dispatch({
        type: 'SET_TOPICS',
        payload: { data, meta }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, teacherId } });
    } catch (error) {
      handleError(error, 'Error al cargar temas por maestro');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, processTopicsResponse]);

  const fetchTopicsByBimesterAction = useCallback(async (
    bimesterId: number,
    filters?: Omit<EricaTopicFilters, 'bimesterId'>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const topics = await getEricaTopicsByBimester(bimesterId, filters);
      const { data, meta } = processTopicsResponse(topics);
      
      dispatch({
        type: 'SET_TOPICS',
        payload: { data, meta }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { ...filters, bimesterId } });
    } catch (error) {
      handleError(error, 'Error al cargar temas por bimestre');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, processTopicsResponse]);

  // ==================== VALIDACIONES ====================

  const validateTopicCreationAction = useCallback(async (
    courseId: number,
    academicWeekId: number,
    sectionId: number
  ) => {
    try {
      const result = await validateTopicCreation(courseId, academicWeekId, sectionId);
      dispatch({
        type: 'SET_VALIDATION_RESULTS',
        payload: {
          canCreate: result.canCreate,
          canComplete: state.validationResults.canComplete,
          message: result.message
        }
      });
    } catch (error) {
      dispatch({
        type: 'SET_VALIDATION_RESULTS',
        payload: {
          canCreate: false,
          canComplete: state.validationResults.canComplete,
          message: 'Error al validar la creación del tema'
        }
      });
    }
  }, [state.validationResults.canComplete]);

  const validateTopicCompletionAction = useCallback(async (topicId: number) => {
    try {
      const result = await validateTopicCompletion(topicId);
      dispatch({
        type: 'SET_VALIDATION_RESULTS',
        payload: {
          canCreate: state.validationResults.canCreate,
          canComplete: result.canComplete,
          message: result.message
        }
      });
    } catch (error) {
      dispatch({
        type: 'SET_VALIDATION_RESULTS',
        payload: {
          canCreate: state.validationResults.canCreate,
          canComplete: false,
          message: 'Error al validar la finalización del tema'
        }
      });
    }
  }, [state.validationResults.canCreate]);

  // ==================== ACCIONES DE UI ====================

  const setFilters = useCallback((filters: EricaTopicFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setFormMode = useCallback((
    mode: 'create' | 'edit' | 'duplicate' | null,
    editingId?: number,
    duplicatingId?: number
  ) => {
    dispatch({ type: 'SET_FORM_MODE', payload: { mode, editingId, duplicatingId } });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // ==================== UTILIDADES ====================

  const refreshTopics = useCallback(async () => {
    await fetchTopics(state.filters);
  }, [fetchTopics, state.filters]);

  const getTopicByIdFromState = useCallback((id: number) => {
    return state.topics.find(topic => topic.id === id);
  }, [state.topics]);

  // Valor del contexto
  const contextValue: EricaTopicsContextType = {
    state,
    
    // Acciones de datos básicos
    fetchTopics,
    fetchTopicById,
    fetchTopicWithEvaluations,
    
    // Acciones de datos específicos
    fetchSectionWeekTopics,
    fetchTeacherPendingTopics,
    fetchSectionCoursePlanning,
    fetchTeacherStats,
    fetchEvaluationGrid,
    
    // Acciones CRUD
    createTopic: createTopicAction,
    createBulkTopics: createBulkTopicsAction,
    updateTopic: updateTopicAction,
    removeTopic: removeTopicAction,
    removeMultipleTopics: removeMultipleTopicsAction,
    markTopicComplete: markTopicCompleteAction,
    markMultipleComplete: markMultipleCompleteAction,
    duplicateTopic: duplicateTopicAction,
    
    // Acciones de búsqueda y filtros
    searchTopics: searchTopicsAction,
    fetchActiveTopics: fetchActiveTopicsAction,
    fetchCompletedTopics: fetchCompletedTopicsAction,
    fetchPendingTopics: fetchPendingTopicsAction,
    fetchTopicsByDateRange: fetchTopicsByDateRangeAction,
    fetchTopicsByCourse: fetchTopicsByCourseAction,
    fetchTopicsBySection: fetchTopicsBySectionAction,
    fetchTopicsByTeacher: fetchTopicsByTeacherAction,
    fetchTopicsByBimester: fetchTopicsByBimesterAction,
    
    // Validaciones
    validateTopicCreation: validateTopicCreationAction,
    validateTopicCompletion: validateTopicCompletionAction,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    clearError,
    resetState,
    
    // Utilidades
    refreshTopics,
    getTopicById: getTopicByIdFromState
  };

  return (
    <EricaTopicsContext.Provider value={contextValue}>
      {children}
    </EricaTopicsContext.Provider>
  );
}

// ==================== HOOKS ====================

// Hook principal para usar el contexto
export function useEricaTopicsContext() {
  const context = useContext(EricaTopicsContext);
  if (context === undefined) {
    throw new Error('useEricaTopicsContext must be used within an EricaTopicsProvider');
  }
  return context;
}

// Hook especializado para formularios
export function useEricaTopicsForm() {
  const {
    state: { submitting, formMode, editingId, duplicatingId, currentTopic, validationResults },
    createTopic,
    updateTopic,
    duplicateTopic,
    setFormMode,
    fetchTopicById,
    validateTopicCreation,
    validateTopicCompletion
  } = useEricaTopicsContext();

  const handleSubmit = useCallback(async (data: CreateEricaTopicRequest | DuplicateTopicRequest) => {
    if (formMode === 'edit' && editingId) {
      return await updateTopic(editingId, data as UpdateEricaTopicRequest);
    } else if (formMode === 'duplicate' && duplicatingId) {
      return await duplicateTopic(duplicatingId, data as DuplicateTopicRequest);
    } else {
      return await createTopic(data as CreateEricaTopicRequest);
    }
  }, [formMode, editingId, duplicatingId, createTopic, updateTopic, duplicateTopic]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id);
    await fetchTopicById(id);
  }, [setFormMode, fetchTopicById]);

  const startCreate = useCallback(() => {
    setFormMode('create');
  }, [setFormMode]);

  const startDuplicate = useCallback(async (id: number) => {
    setFormMode('duplicate', undefined, id);
    await fetchTopicById(id);
  }, [setFormMode, fetchTopicById]);

  const cancelForm = useCallback(() => {
    setFormMode(null);
  }, [setFormMode]);

  return {
    submitting,
    formMode,
    editingId,
    duplicatingId,
    currentTopic,
    validationResults,
    handleSubmit,
    startEdit,
    startCreate,
    startDuplicate,
    cancelForm,
    validateCreation: validateTopicCreation,
    validateCompletion: validateTopicCompletion
  };
}

// Hook especializado para listas
export function useEricaTopicsList() {
  const {
    state: { topics, meta, loading, error, filters },
    fetchTopics,
    setFilters,
    removeTopic,
    removeMultipleTopics,
    markTopicComplete,
    markMultipleComplete,
    searchTopics,
    fetchActiveTopics,
    fetchCompletedTopics,
    fetchPendingTopics
  } = useEricaTopicsContext();

  const handleFilterChange = useCallback(async (newFilters: EricaTopicFilters) => {
    setFilters(newFilters);
    await fetchTopics(newFilters);
  }, [setFilters, fetchTopics]);

  const handleSearch = useCallback(async (searchTerm: string) => {
    await searchTopics(searchTerm, filters);
  }, [searchTopics, filters]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este tema?')) {
      return await removeTopic(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeTopic]);

  const handleBulkDelete = useCallback(async (ids: number[]) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${ids.length} temas?`)) {
      return await removeMultipleTopics(ids);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeMultipleTopics]);

  const handleMarkComplete = useCallback(async (id: number, isCompleted: boolean, notes?: string) => {
    return await markTopicComplete(id, { isCompleted, notes });
  }, [markTopicComplete]);

  const handleBulkMarkComplete = useCallback(async (ids: number[], isCompleted: boolean, notes?: string) => {
    return await markMultipleComplete(ids, isCompleted, notes);
  }, [markMultipleComplete]);

  return {
    topics,
    meta,
    loading,
    error,
    filters,
    handleFilterChange,
    handleSearch,
    handleDelete,
    handleBulkDelete,
    handleMarkComplete,
    handleBulkMarkComplete,
    fetchActiveTopics,
    fetchCompletedTopics,
    fetchPendingTopics,
    refetch: () => fetchTopics(filters)
  };
}

// Hook especializado para estadísticas y datos específicos
export function useEricaTopicsData() {
  const {
    state: { 
      sectionWeekTopics, 
      teacherPendingTopics, 
      sectionCoursePlanning, 
      teacherStats, 
      evaluationGrid,
      loadingStats,
      loadingGrid,
      loadingSectionData
    },
    fetchSectionWeekTopics,
    fetchTeacherPendingTopics,
    fetchSectionCoursePlanning,
    fetchTeacherStats,
    fetchEvaluationGrid
  } = useEricaTopicsContext();

  return {
    // Datos
    sectionWeekTopics,
    teacherPendingTopics,
    sectionCoursePlanning,
    teacherStats,
    evaluationGrid,
    
    // Estados de carga
    loadingStats,
    loadingGrid,
    loadingSectionData,
    
    // Funciones de fetch
    fetchSectionWeekTopics,
    fetchTeacherPendingTopics,
    fetchSectionCoursePlanning,
    fetchTeacherStats,
    fetchEvaluationGrid
  };
}

// Hook especializado para filtros por entidad
export function useEricaTopicsFilters() {
  const {
    fetchTopicsByCourse,
    fetchTopicsBySection,
    fetchTopicsByTeacher,
    fetchTopicsByBimester,
    fetchTopicsByDateRange,
    state: { loading }
  } = useEricaTopicsContext();

  return {
    loading,
    fetchByCourse: fetchTopicsByCourse,
    fetchBySection: fetchTopicsBySection,
    fetchByTeacher: fetchTopicsByTeacher,
    fetchByBimester: fetchTopicsByBimester,
    fetchByDateRange: fetchTopicsByDateRange
  };
}