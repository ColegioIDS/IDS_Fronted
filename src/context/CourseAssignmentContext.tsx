// src/context/CourseAssignmentContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
  CourseAssignment,
  TeacherCourse,
  GradeCourseConfig,
  CreateCourseAssignmentRequest,
  UpdateCourseAssignmentRequest,
  BulkUpdateRequest,
  CourseAssignmentFilters,
  CourseAssignmentResponse,
  CourseAssignmentStats,
  AssignmentType
} from '@/types/course-assignments';
import {
  getCourseAssignments,
  createCourseAssignment,
  updateCourseAssignment,
  getCourseAssignmentById,
  deleteCourseAssignment,
  bulkUpdateCourseAssignments,
  getGradeCourseConfig,
  getTeacherCourses,
  getSectionAssignments,
  initializeCourseAssignments,
  getCourseAssignmentStats
} from '@/services/course-assignments';

// Estado del contexto
interface CourseAssignmentState {
  // Data
  assignments: CourseAssignment[];
  currentAssignment: CourseAssignment | null;
  stats: CourseAssignmentStats | null;
  gradeCourseConfig: GradeCourseConfig[];
  teacherCourses: TeacherCourse[];
  
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
  loadingConfig: boolean;
  loadingTeacherCourses: boolean;
  
  // Estados de error
  error: string | null;
  
  // Filtros actuales
  filters: CourseAssignmentFilters;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | 'bulk' | null;
  editingId: number | null;
  
  // Datos de configuración
  selectedGradeId: number | null;
  selectedTeacherId: number | null;
  selectedSectionId: number | null;
}

// Acciones
type CourseAssignmentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_LOADING_STATS'; payload: boolean }
  | { type: 'SET_LOADING_CONFIG'; payload: boolean }
  | { type: 'SET_LOADING_TEACHER_COURSES'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ASSIGNMENTS'; payload: { data: CourseAssignment[]; meta: CourseAssignmentState['meta'] } }
  | { type: 'ADD_ASSIGNMENT'; payload: CourseAssignment }
  | { type: 'UPDATE_ASSIGNMENT'; payload: { id: number; data: CourseAssignment } }
  | { type: 'REMOVE_ASSIGNMENT'; payload: number }
  | { type: 'SET_CURRENT_ASSIGNMENT'; payload: CourseAssignment | null }
  | { type: 'SET_STATS'; payload: CourseAssignmentStats | null }
  | { type: 'SET_GRADE_COURSE_CONFIG'; payload: GradeCourseConfig[] }
  | { type: 'SET_TEACHER_COURSES'; payload: TeacherCourse[] }
  | { type: 'SET_FILTERS'; payload: CourseAssignmentFilters }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | 'bulk' | null; editingId?: number } }
  | { type: 'SET_SELECTED_GRADE'; payload: number | null }
  | { type: 'SET_SELECTED_TEACHER'; payload: number | null }
  | { type: 'SET_SELECTED_SECTION'; payload: number | null }
  | { type: 'BULK_UPDATE_ASSIGNMENTS'; payload: CourseAssignment[] }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: CourseAssignmentState = {
  assignments: [],
  currentAssignment: null,
  stats: null,
  gradeCourseConfig: [],
  teacherCourses: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  loading: false,
  submitting: false,
  loadingStats: false,
  loadingConfig: false,
  loadingTeacherCourses: false,
  error: null,
  filters: {},
  formMode: null,
  editingId: null,
  selectedGradeId: null,
  selectedTeacherId: null,
  selectedSectionId: null
};

// Reducer
function courseAssignmentReducer(state: CourseAssignmentState, action: CourseAssignmentAction): CourseAssignmentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_LOADING_STATS':
      return { ...state, loadingStats: action.payload };
      
    case 'SET_LOADING_CONFIG':
      return { ...state, loadingConfig: action.payload };
      
    case 'SET_LOADING_TEACHER_COURSES':
      return { ...state, loadingTeacherCourses: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_ASSIGNMENTS':
      return {
        ...state,
        assignments: action.payload.data,
        meta: action.payload.meta,
        loading: false,
        error: null
      };
      
    case 'ADD_ASSIGNMENT':
      return {
        ...state,
        assignments: [action.payload, ...state.assignments],
        meta: {
          ...state.meta,
          total: state.meta.total + 1
        }
      };
      
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(assignment =>
          assignment.id === action.payload.id ? action.payload.data : assignment
        ),
        currentAssignment: state.currentAssignment?.id === action.payload.id 
          ? action.payload.data 
          : state.currentAssignment
      };
      
    case 'REMOVE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.filter(assignment => assignment.id !== action.payload),
        meta: {
          ...state.meta,
          total: Math.max(0, state.meta.total - 1)
        }
      };
      
    case 'SET_CURRENT_ASSIGNMENT':
      return { ...state, currentAssignment: action.payload };
      
    case 'SET_STATS':
      return { ...state, stats: action.payload, loadingStats: false };
      
    case 'SET_GRADE_COURSE_CONFIG':
      return { ...state, gradeCourseConfig: action.payload, loadingConfig: false };
      
    case 'SET_TEACHER_COURSES':
      return { ...state, teacherCourses: action.payload, loadingTeacherCourses: false };
      
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
      
    case 'SET_FORM_MODE':
      return {
        ...state,
        formMode: action.payload.mode,
        editingId: action.payload.editingId || null
      };
      
    case 'SET_SELECTED_GRADE':
      return { ...state, selectedGradeId: action.payload };
      
    case 'SET_SELECTED_TEACHER':
      return { ...state, selectedTeacherId: action.payload };
      
    case 'SET_SELECTED_SECTION':
      return { ...state, selectedSectionId: action.payload };
      
    case 'BULK_UPDATE_ASSIGNMENTS':
      return {
        ...state,
        assignments: action.payload,
        meta: {
          ...state.meta,
          total: action.payload.length
        }
      };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Tipos del contexto
interface CourseAssignmentContextType {
  // Estado
  state: CourseAssignmentState;
  
  // Acciones de datos
  fetchAssignments: (filters?: CourseAssignmentFilters) => Promise<void>;
  fetchAssignmentById: (id: number) => Promise<void>;
  fetchGradeCourseConfig: (gradeId: number) => Promise<void>;
  fetchTeacherCourses: (teacherId: number, sectionId?: number) => Promise<void>;
  fetchSectionAssignments: (sectionId: number) => Promise<void>;
  fetchAssignmentStats: () => Promise<void>;
  
  // Acciones CRUD
  createAssignment: (data: CreateCourseAssignmentRequest) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateAssignment: (id: number, data: UpdateCourseAssignmentRequest) => Promise<{ success: boolean; message?: string }>;
  removeAssignment: (id: number) => Promise<{ success: boolean; message?: string }>;
  bulkUpdateAssignments: (data: BulkUpdateRequest) => Promise<{ success: boolean; message?: string }>;
  initializeAssignments: () => Promise<{ success: boolean; message?: string; totalAssignments?: number }>;
  
  // Acciones de UI
  setFilters: (filters: CourseAssignmentFilters) => void;
  setFormMode: (mode: 'create' | 'edit' | 'bulk' | null, editingId?: number) => void;
  setSelectedGrade: (gradeId: number | null) => void;
  setSelectedTeacher: (teacherId: number | null) => void;
  setSelectedSection: (sectionId: number | null) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshAssignments: () => Promise<void>;
  getAssignmentById: (id: number) => CourseAssignment | undefined;
  getTeacherAssignments: (teacherId: number) => CourseAssignment[];
  getSectionCourses: (sectionId: number) => CourseAssignment[];
}

// Crear contexto
const CourseAssignmentContext = createContext<CourseAssignmentContextType | undefined>(undefined);

// Provider del contexto
interface CourseAssignmentProviderProps {
  children: ReactNode;
}

export function CourseAssignmentProvider({ children }: CourseAssignmentProviderProps) {
  const [state, dispatch] = useReducer(courseAssignmentReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Función auxiliar para generar meta información
  const generateMeta = useCallback((data: CourseAssignment[]): CourseAssignmentState['meta'] => {
    return {
      total: data.length,
      page: 1,
      limit: data.length,
      totalPages: 1
    };
  }, []);

  // Acciones de datos
  const fetchAssignments = useCallback(async (filters?: CourseAssignmentFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getCourseAssignments(filters);
      
      let assignments: CourseAssignment[];
      let meta: CourseAssignmentState['meta'];
      
      if (Array.isArray(response)) {
        assignments = response;
        meta = generateMeta(assignments);
      } else {
        assignments = response.data;
        meta = response.meta || generateMeta(assignments);
      }
      
      dispatch({
        type: 'SET_ASSIGNMENTS',
        payload: { data: assignments, meta }
      });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      handleError(error, 'Error al cargar las asignaciones');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, generateMeta]);

  const fetchAssignmentById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const assignment = await getCourseAssignmentById(id);
      dispatch({ type: 'SET_CURRENT_ASSIGNMENT', payload: assignment });
    } catch (error) {
      handleError(error, 'Error al cargar la asignación');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchGradeCourseConfig = useCallback(async (gradeId: number) => {
    try {
      dispatch({ type: 'SET_LOADING_CONFIG', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const config = await getGradeCourseConfig(gradeId);
      dispatch({ type: 'SET_GRADE_COURSE_CONFIG', payload: config });
      dispatch({ type: 'SET_SELECTED_GRADE', payload: gradeId });
    } catch (error) {
      handleError(error, 'Error al cargar la configuración del grado');
      dispatch({ type: 'SET_LOADING_CONFIG', payload: false });
    }
  }, [handleError]);

  const fetchTeacherCourses = useCallback(async (teacherId: number, sectionId?: number) => {
    try {
      dispatch({ type: 'SET_LOADING_TEACHER_COURSES', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const courses = await getTeacherCourses(teacherId, sectionId);
      dispatch({ type: 'SET_TEACHER_COURSES', payload: courses });
      dispatch({ type: 'SET_SELECTED_TEACHER', payload: teacherId });
      
      if (sectionId) {
        dispatch({ type: 'SET_SELECTED_SECTION', payload: sectionId });
      }
    } catch (error) {
      handleError(error, 'Error al cargar los cursos del maestro');
      dispatch({ type: 'SET_LOADING_TEACHER_COURSES', payload: false });
    }
  }, [handleError]);

  const fetchSectionAssignments = useCallback(async (sectionId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const assignments = await getSectionAssignments(sectionId);
      const meta = generateMeta(assignments);
      
      dispatch({
        type: 'SET_ASSIGNMENTS',
        payload: { data: assignments, meta }
      });
      
      dispatch({ type: 'SET_SELECTED_SECTION', payload: sectionId });
      dispatch({ type: 'SET_FILTERS', payload: { sectionId } });
    } catch (error) {
      handleError(error, 'Error al cargar las asignaciones de la sección');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, generateMeta]);

  const fetchAssignmentStats = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING_STATS', payload: true });
      
      const stats = await getCourseAssignmentStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      handleError(error, 'Error al cargar las estadísticas');
      dispatch({ type: 'SET_LOADING_STATS', payload: false });
    }
  }, [handleError]);

  // Acciones CRUD
  const createAssignmentAction = useCallback(async (data: CreateCourseAssignmentRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newAssignment = await createCourseAssignment(data);
      dispatch({ type: 'ADD_ASSIGNMENT', payload: newAssignment });
      
      toast.success("Asignación creada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al crear la asignación');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateAssignmentAction = useCallback(async (id: number, data: UpdateCourseAssignmentRequest) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedAssignment = await updateCourseAssignment(id, data);
      dispatch({
        type: 'UPDATE_ASSIGNMENT',
        payload: { id, data: updatedAssignment }
      });
      
      toast.success("Asignación actualizada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar la asignación');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeAssignment = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteCourseAssignment(id);
      dispatch({ type: 'REMOVE_ASSIGNMENT', payload: id });
      
      toast.success("Asignación eliminada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar la asignación');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

const bulkUpdateAssignmentsAction = useCallback(async (data: BulkUpdateRequest) => {
  try {
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    const result = await bulkUpdateCourseAssignments(data);
    
    await fetchAssignments(state.filters);
    
    // Manejo seguro del mensaje
    const successMessage = (result && result.message) 
      ? result.message 
      : "Actualización masiva completada correctamente";
    
    toast.success(successMessage);
    
    return { success: true, message: successMessage };
    
  } catch (error: any) {
    
    const message = handleError(error, 'Error en la actualización masiva');
    
    return { success: false, message };
  } finally {
    dispatch({ type: 'SET_SUBMITTING', payload: false });
  }
}, [handleError, fetchAssignments, state.filters]);

  const initializeAssignmentsAction = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await initializeCourseAssignments();
      
      // Refrescar las asignaciones después de la inicialización
      await fetchAssignments();
      
      toast.success(result.message || "Asignaciones inicializadas correctamente");
      return { 
        success: true, 
        message: result.message,
        totalAssignments: result.totalAssignments 
      };
    } catch (error: any) {
      const message = handleError(error, 'Error al inicializar las asignaciones');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, fetchAssignments]);

  // Acciones de UI
  const setFilters = useCallback((filters: CourseAssignmentFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setFormMode = useCallback((mode: 'create' | 'edit' | 'bulk' | null, editingId?: number) => {
    dispatch({ type: 'SET_FORM_MODE', payload: { mode, editingId } });
  }, []);

  const setSelectedGrade = useCallback((gradeId: number | null) => {
    dispatch({ type: 'SET_SELECTED_GRADE', payload: gradeId });
  }, []);

  const setSelectedTeacher = useCallback((teacherId: number | null) => {
    dispatch({ type: 'SET_SELECTED_TEACHER', payload: teacherId });
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
  const refreshAssignments = useCallback(async () => {
    await fetchAssignments(state.filters);
  }, [fetchAssignments, state.filters]);

  const getAssignmentByIdFromState = useCallback((id: number) => {
    return state.assignments.find(assignment => assignment.id === id);
  }, [state.assignments]);

  const getTeacherAssignments = useCallback((teacherId: number) => {
    return state.assignments.filter(assignment => assignment.teacherId === teacherId);
  }, [state.assignments]);

  const getSectionCourses = useCallback((sectionId: number) => {
    return state.assignments.filter(assignment => assignment.sectionId === sectionId);
  }, [state.assignments]);

  // Valor del contexto
  const contextValue: CourseAssignmentContextType = {
    state,
    
    // Acciones de datos
    fetchAssignments,
    fetchAssignmentById,
    fetchGradeCourseConfig,
    fetchTeacherCourses,
    fetchSectionAssignments,
    fetchAssignmentStats,
    
    // Acciones CRUD
    createAssignment: createAssignmentAction,
    updateAssignment: updateAssignmentAction,
    removeAssignment,
    bulkUpdateAssignments: bulkUpdateAssignmentsAction,
    initializeAssignments: initializeAssignmentsAction,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    setSelectedGrade,
    setSelectedTeacher,
    setSelectedSection,
    clearError,
    resetState,
    
    // Utilidades
    refreshAssignments,
    getAssignmentById: getAssignmentByIdFromState,
    getTeacherAssignments,
    getSectionCourses
  };

  return (
    <CourseAssignmentContext.Provider value={contextValue}>
      {children}
    </CourseAssignmentContext.Provider>
  );
}

// Hook para usar el contexto
export function useCourseAssignmentContext() {
  const context = useContext(CourseAssignmentContext);
  if (context === undefined) {
    throw new Error('useCourseAssignmentContext must be used within a CourseAssignmentProvider');
  }
  return context;
}

// Hook especializado para formularios
export function useCourseAssignmentForm() {
  const {
    state: { submitting, formMode, editingId, currentAssignment },
    createAssignment,
    updateAssignment,
    setFormMode,
    fetchAssignmentById
  } = useCourseAssignmentContext();

  const handleSubmit = useCallback(async (data: CreateCourseAssignmentRequest) => {
    if (formMode === 'edit' && editingId) {
      return await updateAssignment(editingId, data);
    } else {
      return await createAssignment(data);
    }
  }, [formMode, editingId, createAssignment, updateAssignment]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id);
    await fetchAssignmentById(id);
  }, [setFormMode, fetchAssignmentById]);

  const startCreate = useCallback(() => {
    setFormMode('create');
  }, [setFormMode]);

  const startBulkEdit = useCallback(() => {
    setFormMode('bulk');
  }, [setFormMode]);

  const cancelForm = useCallback(() => {
    setFormMode(null);
  }, [setFormMode]);

  return {
    submitting,
    formMode,
    editingId,
    currentAssignment,
    handleSubmit,
    startEdit,
    startCreate,
    startBulkEdit,
    cancelForm
  };
}

// Hook especializado para listas
export function useCourseAssignmentList() {
  const {
    state: { assignments, meta, loading, error, filters },
    fetchAssignments,
    setFilters,
    removeAssignment
  } = useCourseAssignmentContext();

  const handleFilterChange = useCallback(async (newFilters: CourseAssignmentFilters) => {
    setFilters(newFilters);
    await fetchAssignments(newFilters);
  }, [setFilters, fetchAssignments]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta asignación?')) {
      return await removeAssignment(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeAssignment]);

  return {
    assignments,
    meta,
    loading,
    error,
    filters,
    handleFilterChange,
    handleDelete,
    refetch: () => fetchAssignments(filters)
  };
}

// Hook especializado para estadísticas
export function useCourseAssignmentStatsContext() {
  const {
    state: { stats, loadingStats },
    fetchAssignmentStats
  } = useCourseAssignmentContext();

  return {
    stats,
    loading: loadingStats,
    fetchStats: fetchAssignmentStats
  };
}

// Hook especializado para configuración de grados
export function useCourseAssignmentConfig() {
  const {
    state: { gradeCourseConfig, loadingConfig, selectedGradeId },
    fetchGradeCourseConfig,
    setSelectedGrade
  } = useCourseAssignmentContext();

  const loadGradeConfig = useCallback(async (gradeId: number) => {
    await fetchGradeCourseConfig(gradeId);
  }, [fetchGradeCourseConfig]);

  return {
    gradeCourseConfig,
    loading: loadingConfig,
    selectedGradeId,
    loadGradeConfig,
    setSelectedGrade
  };
}

// Hook especializado para cursos de maestros
export function useTeacherCoursesContext() {
  const {
    state: { teacherCourses, loadingTeacherCourses, selectedTeacherId, selectedSectionId },
    fetchTeacherCourses,
    setSelectedTeacher,
    setSelectedSection
  } = useCourseAssignmentContext();

  const loadTeacherCourses = useCallback(async (teacherId: number, sectionId?: number) => {
    await fetchTeacherCourses(teacherId, sectionId);
  }, [fetchTeacherCourses]);

  return {
    teacherCourses,
    loading: loadingTeacherCourses,
    selectedTeacherId,
    selectedSectionId,
    loadTeacherCourses,
    setSelectedTeacher,
    setSelectedSection
  };
}