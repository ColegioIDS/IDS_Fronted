// src/contexts/CourseContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
  Course,
  CourseFormValues,
  CourseFilters,
  CourseGradeRelation
} from '@/types/courses';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseGrades,
  addCourseGrade,
  updateCourseGrade,
  removeCourseGrade
} from '@/services/useCourses';

// Estado del contexto
interface CourseState {
  // Data
  courses: Course[];
  currentCourse: Course | null;
  courseGrades: CourseGradeRelation[];
  
  // Estados de carga
  loading: boolean;
  submitting: boolean;
  loadingGrades: boolean;
  
  // Estados de error
  error: string | null;
  
  // Filtros actuales
  filters: CourseFilters;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | null;
  editingId: number | null;
}

// Acciones
type CourseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_LOADING_GRADES'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: { id: number; data: Course } }
  | { type: 'REMOVE_COURSE'; payload: number }
  | { type: 'SET_CURRENT_COURSE'; payload: Course | null }
  | { type: 'SET_COURSE_GRADES'; payload: CourseGradeRelation[] }
  | { type: 'ADD_COURSE_GRADE'; payload: CourseGradeRelation }
  | { type: 'UPDATE_COURSE_GRADE'; payload: { courseId: number; gradeId: number; data: CourseGradeRelation } }
  | { type: 'REMOVE_COURSE_GRADE'; payload: { courseId: number; gradeId: number } }
  | { type: 'SET_FILTERS'; payload: CourseFilters }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | null; editingId?: number } }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  courseGrades: [],
  loading: false,
  submitting: false,
  loadingGrades: false,
  error: null,
  filters: {},
  formMode: null,
  editingId: null
};

// Reducer
function courseReducer(state: CourseState, action: CourseAction): CourseState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_LOADING_GRADES':
      return { ...state, loadingGrades: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_COURSES':
      return {
        ...state,
        courses: action.payload,
        loading: false,
        error: null
      };
      
    case 'ADD_COURSE':
      return {
        ...state,
        courses: [action.payload, ...state.courses]
      };
      
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload.id ? action.payload.data : course
        ),
        currentCourse: state.currentCourse?.id === action.payload.id 
          ? action.payload.data 
          : state.currentCourse
      };
      
    case 'REMOVE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(course => course.id !== action.payload)
      };
      
    case 'SET_CURRENT_COURSE':
      return { ...state, currentCourse: action.payload };
      
    case 'SET_COURSE_GRADES':
      return { 
        ...state, 
        courseGrades: action.payload, 
        loadingGrades: false 
      };
      
    case 'ADD_COURSE_GRADE':
      return {
        ...state,
        courseGrades: [...state.courseGrades, action.payload]
      };
      
    case 'UPDATE_COURSE_GRADE':
      return {
        ...state,
        courseGrades: state.courseGrades.map(cg =>
          cg.courseId === action.payload.courseId && cg.gradeId === action.payload.gradeId
            ? action.payload.data
            : cg
        )
      };
      
    case 'REMOVE_COURSE_GRADE':
      return {
        ...state,
        courseGrades: state.courseGrades.filter(cg =>
          !(cg.courseId === action.payload.courseId && cg.gradeId === action.payload.gradeId)
        )
      };
      
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
interface CourseContextType {
  // Estado
  state: CourseState;
  
  // Acciones de datos
  fetchCourses: (filters?: CourseFilters) => Promise<void>;
  fetchCourseById: (id: number) => Promise<void>;
  fetchCourseGrades: (courseId: number) => Promise<void>;
  
  // Acciones CRUD de cursos
  createCourse: (data: CourseFormValues) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateCourse: (id: number, data: Partial<CourseFormValues>) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  removeCourse: (id: number) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones CRUD de course-grades
  addCourseGrade: (courseId: number, gradeId: number, isCore?: boolean) => Promise<{ success: boolean; message?: string }>;
  updateCourseGrade: (courseId: number, gradeId: number, isCore: boolean) => Promise<{ success: boolean; message?: string }>;
  removeCourseGrade: (courseId: number, gradeId: number) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de UI
  setFilters: (filters: CourseFilters) => void;
  setFormMode: (mode: 'create' | 'edit' | null, editingId?: number) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshCourses: () => Promise<void>;
  getCourseById: (id: number) => Course | undefined;
}

// Crear contexto
const CourseContext = createContext<CourseContextType | undefined>(undefined);

// Provider del contexto
interface CourseProviderProps {
  children: ReactNode;
}

export function CourseProvider({ children }: CourseProviderProps) {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Acciones de datos
  const fetchCourses = useCallback(async (filters?: CourseFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const courses = await getCourses(filters);
      dispatch({ type: 'SET_COURSES', payload: courses });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      handleError(error, 'Error al cargar los cursos');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchCourseById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const course = await getCourseById(id);
      dispatch({ type: 'SET_CURRENT_COURSE', payload: course });
    } catch (error) {
      handleError(error, 'Error al cargar el curso');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchCourseGrades = useCallback(async (courseId: number) => {
    try {
      dispatch({ type: 'SET_LOADING_GRADES', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const courseGrades = await getCourseGrades(courseId);
      dispatch({ type: 'SET_COURSE_GRADES', payload: courseGrades });
    } catch (error) {
      handleError(error, 'Error al cargar los grados del curso');
    } finally {
      dispatch({ type: 'SET_LOADING_GRADES', payload: false });
    }
  }, [handleError]);

  // Acciones CRUD de cursos
  const createCourseAction = useCallback(async (data: CourseFormValues) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newCourse = await createCourse(data);
      dispatch({ type: 'ADD_COURSE', payload: newCourse });
      
      toast.success("Curso creado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al crear el curso');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateCourseAction = useCallback(async (id: number, data: Partial<CourseFormValues>) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedCourse = await updateCourse(id, data);
      dispatch({
        type: 'UPDATE_COURSE',
        payload: { id, data: updatedCourse }
      });
      
      toast.success("Curso actualizado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar el curso');
      return { 
        success: false, 
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeCourse = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteCourse(id);
      dispatch({ type: 'REMOVE_COURSE', payload: id });
      
      toast.success("Curso eliminado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar el curso');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Acciones CRUD de course-grades
  const addCourseGradeAction = useCallback(async (courseId: number, gradeId: number, isCore: boolean = true) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newCourseGrade = await addCourseGrade(courseId, gradeId, isCore);
      dispatch({ type: 'ADD_COURSE_GRADE', payload: newCourseGrade });
      
      toast.success("Grado agregado al curso correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al agregar grado al curso');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateCourseGradeAction = useCallback(async (courseId: number, gradeId: number, isCore: boolean) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedCourseGrade = await updateCourseGrade(courseId, gradeId, isCore);
      dispatch({
        type: 'UPDATE_COURSE_GRADE',
        payload: { courseId, gradeId, data: updatedCourseGrade }
      });
      
      toast.success("Relación curso-grado actualizada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar relación curso-grado');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeCourseGradeAction = useCallback(async (courseId: number, gradeId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await removeCourseGrade(courseId, gradeId);
      dispatch({ type: 'REMOVE_COURSE_GRADE', payload: { courseId, gradeId } });
      
      toast.success("Grado removido del curso correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al remover grado del curso');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Acciones de UI
  const setFilters = useCallback((filters: CourseFilters) => {
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
  const refreshCourses = useCallback(async () => {
    await fetchCourses(state.filters);
  }, [fetchCourses, state.filters]);

  const getCourseByIdFromState = useCallback((id: number) => {
    return state.courses.find(course => course.id === id);
  }, [state.courses]);

  // Valor del contexto
  const contextValue: CourseContextType = {
    state,
    
    // Acciones de datos
    fetchCourses,
    fetchCourseById,
    fetchCourseGrades,
    
    // Acciones CRUD de cursos
    createCourse: createCourseAction,
    updateCourse: updateCourseAction,
    removeCourse,
    
    // Acciones CRUD de course-grades
    addCourseGrade: addCourseGradeAction,
    updateCourseGrade: updateCourseGradeAction,
    removeCourseGrade: removeCourseGradeAction,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    clearError,
    resetState,
    
    // Utilidades
    refreshCourses,
    getCourseById: getCourseByIdFromState
  };

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
}

// Hook para usar el contexto
export function useCourseContext() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourseContext must be used within a CourseProvider');
  }
  return context;
}

// Hook especializado para formularios
export function useCourseForm() {
  const {
    state: { submitting, formMode, editingId, currentCourse },
    createCourse,
    updateCourse,
    setFormMode,
    fetchCourseById
  } = useCourseContext();

  const handleSubmit = useCallback(async (data: CourseFormValues) => {
    if (formMode === 'edit' && editingId) {
      return await updateCourse(editingId, data);
    } else {
      return await createCourse(data);
    }
  }, [formMode, editingId, createCourse, updateCourse]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id);
    await fetchCourseById(id);
  }, [setFormMode, fetchCourseById]);

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
    currentCourse,
    handleSubmit,
    startEdit,
    startCreate,
    cancelForm
  };
}

// Hook especializado para listas
export function useCourseList() {
  const {
    state: { courses, loading, error, filters },
    fetchCourses,
    setFilters,
    removeCourse
  } = useCourseContext();

  const handleFilterChange = useCallback(async (newFilters: CourseFilters) => {
    setFilters(newFilters);
    await fetchCourses(newFilters);
  }, [setFilters, fetchCourses]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este curso?')) {
      return await removeCourse(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeCourse]);

  return {
    courses,
    loading,
    error,
    filters,
    handleFilterChange,
    handleDelete,
    refetch: () => fetchCourses(filters)
  };
}

// Hook especializado para gestión de grados
export function useCourseGrades() {
  const {
    state: { courseGrades, loadingGrades, submitting },
    fetchCourseGrades,
    addCourseGrade,
    updateCourseGrade,
    removeCourseGrade
  } = useCourseContext();

  const handleAddGrade = useCallback(async (courseId: number, gradeId: number, isCore: boolean = true) => {
    return await addCourseGrade(courseId, gradeId, isCore);
  }, [addCourseGrade]);

  const handleUpdateGrade = useCallback(async (courseId: number, gradeId: number, isCore: boolean) => {
    return await updateCourseGrade(courseId, gradeId, isCore);
  }, [updateCourseGrade]);

  const handleRemoveGrade = useCallback(async (courseId: number, gradeId: number) => {
    if (window.confirm('¿Estás seguro de que deseas remover este grado del curso?')) {
      return await removeCourseGrade(courseId, gradeId);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeCourseGrade]);

  return {
    courseGrades,
    loading: loadingGrades,
    submitting,
    fetchCourseGrades,
    handleAddGrade,
    handleUpdateGrade,
    handleRemoveGrade
  };
}