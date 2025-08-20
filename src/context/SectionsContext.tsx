// src/contexts/SectionsContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  Section,
  SectionFormValues,
  SectionOption,
  TeacherOption
} from '@/types/sections';
import {
  getSections,
  createSection,
  updateSection,
  getSectionById,
  deleteSection
} from '@/services/sectionService';

// Filtros para secciones
interface SectionFilters {
  gradeId?: number;
  teacherId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// Estado del contexto
interface SectionState {
  // Data
  sections: Section[];
  currentSection: Section | null;
  
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
  filters: SectionFilters;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | null;
  editingId: number | null;

  // Estado para controlar si ya se intentó cargar inicialmente
  initialized: boolean;
}

// Acciones
type SectionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SECTIONS'; payload: { data: Section[]; meta?: SectionState['meta'] } }
  | { type: 'ADD_SECTION'; payload: Section }
  | { type: 'UPDATE_SECTION'; payload: { id: number; data: Section } }
  | { type: 'REMOVE_SECTION'; payload: number }
  | { type: 'SET_CURRENT_SECTION'; payload: Section | null }
  | { type: 'SET_FILTERS'; payload: SectionFilters }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | null; editingId?: number } }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: SectionState = {
  sections: [],
  currentSection: null,
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
  initialized: false
};

// Reducer
function sectionReducer(state: SectionState, action: SectionAction): SectionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_SECTIONS':
      return {
        ...state,
        sections: action.payload.data,
        meta: action.payload.meta || state.meta,
        loading: false,
        error: null,
        initialized: true
      };
      
    case 'ADD_SECTION':
      return {
        ...state,
        sections: [action.payload, ...state.sections],
        meta: {
          ...state.meta,
          total: state.meta.total + 1
        }
      };
      
    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map(section =>
          section.id === action.payload.id ? action.payload.data : section
        ),
        currentSection: state.currentSection?.id === action.payload.id 
          ? action.payload.data 
          : state.currentSection
      };
      
    case 'REMOVE_SECTION':
      return {
        ...state,
        sections: state.sections.filter(section => section.id !== action.payload),
        meta: {
          ...state.meta,
          total: Math.max(0, state.meta.total - 1)
        }
      };
      
    case 'SET_CURRENT_SECTION':
      return { ...state, currentSection: action.payload };
      
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
      
    case 'SET_FORM_MODE':
      return {
        ...state,
        formMode: action.payload.mode,
        editingId: action.payload.editingId || null
      };

    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Tipos del contexto
interface SectionContextType {
  // Estado
  state: SectionState;
  
  // Acciones de datos
  fetchSections: (filters?: SectionFilters) => Promise<void>;
  fetchSectionById: (id: number) => Promise<void>;
  fetchSectionsByGrade: (gradeId: number) => Promise<void>;
  
  // Acciones CRUD
  createSection: (data: SectionFormValues) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateSection: (id: number, data: Partial<SectionFormValues>) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  removeSection: (id: number) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  
  // Acciones de UI
  setFilters: (filters: SectionFilters) => void;
  setFormMode: (mode: 'create' | 'edit' | null, editingId?: number) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Utilidades
  refreshSections: () => Promise<void>;
  getSectionById: (id: number) => Section | undefined;
  getSectionOptions: () => SectionOption[];
  getTeacherOptions: () => TeacherOption[];
}

// Crear contexto
const SectionContext = createContext<SectionContextType | undefined>(undefined);

// Provider del contexto
interface SectionProviderProps {
  children: ReactNode;
}

export function SectionProvider({ children }: SectionProviderProps) {
  const [state, dispatch] = useReducer(sectionReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    dispatch({ type: 'SET_INITIALIZED', payload: true }); // Marcar como inicializado incluso con error
    toast.error(message);
    return message;
  }, []);

  // Acciones de datos
  const fetchSections = useCallback(async (filters?: SectionFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const gradeId = filters?.gradeId;
      const response = await getSections(gradeId);
      dispatch({
        type: 'SET_SECTIONS',
        payload: {
          data: response,
          meta: {
            total: response.length,
            page: 1,
            limit: response.length,
            totalPages: 1
          }
        }
      });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      handleError(error, 'Error al cargar las secciones');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchSectionById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const section = await getSectionById(id);
      dispatch({ type: 'SET_CURRENT_SECTION', payload: section });
    } catch (error) {
      handleError(error, 'Error al cargar la sección');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchSectionsByGrade = useCallback(async (gradeId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await getSections(gradeId);
      dispatch({
        type: 'SET_SECTIONS',
        payload: {
          data: response,
          meta: {
            total: response.length,
            page: 1,
            limit: response.length,
            totalPages: 1
          }
        }
      });
      
      dispatch({ type: 'SET_FILTERS', payload: { gradeId } });
    } catch (error) {
      handleError(error, 'Error al cargar las secciones del grado');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  // Acciones CRUD
  const createSectionAction = useCallback(async (data: SectionFormValues) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newSection = await createSection(data);
      dispatch({ type: 'ADD_SECTION', payload: newSection });
      
      toast.success("Sección creada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al crear la sección');
      return {
        success: false,
        message,
        details: error.response?.data?.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateSectionAction = useCallback(async (id: number, data: Partial<SectionFormValues>) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedSection = await updateSection(id, data);
      dispatch({
        type: 'UPDATE_SECTION',
        payload: { id, data: updatedSection }
      });
      
      toast.success("Sección actualizada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar la sección');
      return { 
        success: false, 
        message,
        details: error.response?.data?.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeSection = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteSection(id);
      dispatch({ type: 'REMOVE_SECTION', payload: id });
      
      toast.success("Sección eliminada correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar la sección');
      return { 
        success: false, 
        message,
        details: error.response?.data?.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Acciones de UI
  const setFilters = useCallback((filters: SectionFilters) => {
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
  const refreshSections = useCallback(async () => {
    await fetchSections(state.filters);
  }, [fetchSections, state.filters]);

  const getSectionByIdFromState = useCallback((id: number) => {
    return state.sections.find(section => section.id === id);
  }, [state.sections]);

  const getSectionOptions = useCallback((): SectionOption[] => {
    return state.sections.map(section => ({
      value: section.id,
      label: `${section.grade.name} - ${section.name}`,
      gradeId: section.gradeId
    }));
  }, [state.sections]);

  const getTeacherOptions = useCallback((): TeacherOption[] => {
    const teachers = state.sections
      .filter(section => section.teacher)
      .map(section => section.teacher!)
      .filter((teacher, index, self) => 
        self.findIndex(t => t.id === teacher.id) === index
      ); // Remove duplicates

    return teachers.map(teacher => ({
      value: teacher.id,
      label: `${teacher.givenNames} ${teacher.lastNames}`,
      isHomeroom: teacher.teacherDetails?.isHomeroomTeacher || false
    }));
  }, [state.sections]);

  // Valor del contexto
  const contextValue: SectionContextType = {
    state,
    
    // Acciones de datos
    fetchSections,
    fetchSectionById,
    fetchSectionsByGrade,
    
    // Acciones CRUD
    createSection: createSectionAction,
    updateSection: updateSectionAction,
    removeSection,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    clearError,
    resetState,
    
    // Utilidades
    refreshSections,
    getSectionById: getSectionByIdFromState,
    getSectionOptions,
    getTeacherOptions
  };

  return (
    <SectionContext.Provider value={contextValue}>
      {children}
    </SectionContext.Provider>
  );
}

// Hook para usar el contexto
export function useSectionContext() {
  const context = useContext(SectionContext);
  if (context === undefined) {
    throw new Error('useSectionContext must be used within a SectionProvider');
  }
  return context;
}

// Hook especializado para formularios
export function useSectionForm() {
  const {
    state: { submitting, formMode, editingId, currentSection },
    createSection,
    updateSection,
    setFormMode,
    fetchSectionById
  } = useSectionContext();

  const handleSubmit = useCallback(async (data: SectionFormValues) => {
    if (formMode === 'edit' && editingId) {
      return await updateSection(editingId, data);
    } else {
      return await createSection(data);
    }
  }, [formMode, editingId, createSection, updateSection]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id);
    await fetchSectionById(id);
  }, [setFormMode, fetchSectionById]);

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
    currentSection,
    handleSubmit,
    startEdit,
    startCreate,
    cancelForm
  };
}

// Hook especializado para listas - CORREGIDO
export function useSectionList() {
  const {
    state: { sections, meta, loading, error, filters, initialized },
    fetchSections,
    setFilters,
    removeSection
  } = useSectionContext();

  // Usar useRef para evitar múltiples llamadas
  const hasInitialized = useRef(false);

  // Cargar secciones automáticamente solo una vez al montar
  useEffect(() => {
    if (!hasInitialized.current && !initialized && !loading) {
      hasInitialized.current = true;
      fetchSections();
    }
  }, [initialized, loading, fetchSections]);

  const handleFilterChange = useCallback(async (newFilters: SectionFilters) => {
    setFilters(newFilters);
    await fetchSections(newFilters);
  }, [setFilters, fetchSections]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta sección?')) {
      return await removeSection(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeSection]);

  return {
    sections,
    meta,
    loading,
    error,
    filters,
    initialized,
    handleFilterChange,
    handleDelete,
    refetch: () => fetchSections(filters)
  };
}

// Hook especializado para opciones
export function useSectionOptionsContext() {
  const {
    state: { sections, loading },
    getSectionOptions,
    getTeacherOptions
  } = useSectionContext();

  return {
    sections,
    loading,
    sectionOptions: getSectionOptions(),
    teacherOptions: getTeacherOptions()
  };
}