// src/contexts/StudentContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
  Student,
  CreateStudentPayload,
  ParentDpiResponse,
  StudentTransferPayload,
  Enrollment,
  EnrollmentFormData, // ✅ NUEVO
  SectionsAvailability // ✅ NUEVO
} from '@/types/student';
import {
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getUserByDPI,
  getActiveEnrollment,
  transferStudent,
  studentEnrollmentService // ✅ NUEVO
} from '@/services/useStudents';

import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { deleteImageFromCloudinary } from '@/services/useCloudinary';

// Interfaces para filtros y paginación
interface StudentFilters {
  search?: string;
  gradeId?: number;
  sectionId?: number;
  cycleId?: number;
  status?: string;
  page?: number;
  limit?: number;
}

// Estado del contexto
interface StudentState {
  // Data
  students: Student[];
  currentStudent: Student | null;
  parentDpiInfo: ParentDpiResponse | null;
  activeEnrollment: Enrollment | null;
  
  // ✅ NUEVO: Datos de inscripción
  enrollmentData: EnrollmentFormData | null;
  availableSections: SectionsAvailability | null;
  
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
  loadingDpi: boolean;
  loadingEnrollment: boolean;
  loadingEnrollmentData: boolean; // ✅ NUEVO
  loadingSections: boolean; // ✅ NUEVO
  
  // Estados de error
  error: string | null;
  
  // Filtros actuales
  filters: StudentFilters;
  
  // Estado de formularios
  formMode: 'create' | 'edit' | 'transfer' | null;
  editingId: number | null;
}

// Acciones
type StudentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_LOADING_DPI'; payload: boolean }
  | { type: 'SET_LOADING_ENROLLMENT'; payload: boolean }
  | { type: 'SET_LOADING_ENROLLMENT_DATA'; payload: boolean } // ✅ NUEVO
  | { type: 'SET_LOADING_SECTIONS'; payload: boolean } // ✅ NUEVO
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STUDENTS'; payload: { data: Student[]; meta: StudentState['meta'] } }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: { id: number; data: Student } }
  | { type: 'REMOVE_STUDENT'; payload: number }
  | { type: 'SET_CURRENT_STUDENT'; payload: Student | null }
  | { type: 'SET_PARENT_DPI_INFO'; payload: ParentDpiResponse | null }
  | { type: 'SET_ACTIVE_ENROLLMENT'; payload: Enrollment | null }
  | { type: 'SET_ENROLLMENT_DATA'; payload: EnrollmentFormData | null } // ✅ NUEVO
  | { type: 'SET_AVAILABLE_SECTIONS'; payload: SectionsAvailability | null } // ✅ NUEVO
  | { type: 'SET_FILTERS'; payload: StudentFilters }
  | { type: 'SET_FORM_MODE'; payload: { mode: 'create' | 'edit' | 'transfer' | null; editingId?: number } }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: StudentState = {
  students: [],
  currentStudent: null,
  parentDpiInfo: null,
  activeEnrollment: null,
  enrollmentData: null, // ✅ NUEVO
  availableSections: null, // ✅ NUEVO
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  loading: false,
  submitting: false,
  loadingDpi: false,
  loadingEnrollment: false,
  loadingEnrollmentData: false, // ✅ NUEVO
  loadingSections: false, // ✅ NUEVO
  error: null,
  filters: {},
  formMode: null,
  editingId: null
};

// Reducer
function studentReducer(state: StudentState, action: StudentAction): StudentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
      
    case 'SET_LOADING_DPI':
      return { ...state, loadingDpi: action.payload };
      
    case 'SET_LOADING_ENROLLMENT':
      return { ...state, loadingEnrollment: action.payload };
      
    // ✅ NUEVO
    case 'SET_LOADING_ENROLLMENT_DATA':
      return { ...state, loadingEnrollmentData: action.payload };
      
    // ✅ NUEVO
    case 'SET_LOADING_SECTIONS':
      return { ...state, loadingSections: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_STUDENTS':
      return {
        ...state,
        students: action.payload.data,
        meta: action.payload.meta,
        loading: false,
        error: null
      };
      
    case 'ADD_STUDENT':
      return {
        ...state,
        students: [action.payload, ...state.students],
        meta: {
          ...state.meta,
          total: state.meta.total + 1
        }
      };
      
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(student =>
          student.id === action.payload.id ? action.payload.data : student
        ),
        currentStudent: state.currentStudent?.id === action.payload.id 
          ? action.payload.data 
          : state.currentStudent
      };
      
    case 'REMOVE_STUDENT':
      return {
        ...state,
        students: state.students.filter(student => student.id !== action.payload),
        meta: {
          ...state.meta,
          total: Math.max(0, state.meta.total - 1)
        }
      };
      
    case 'SET_CURRENT_STUDENT':
      return { ...state, currentStudent: action.payload };
      
    case 'SET_PARENT_DPI_INFO':
      return { ...state, parentDpiInfo: action.payload, loadingDpi: false };
      
    case 'SET_ACTIVE_ENROLLMENT':
      return { ...state, activeEnrollment: action.payload, loadingEnrollment: false };
      
    // ✅ NUEVO
    case 'SET_ENROLLMENT_DATA':
      return { ...state, enrollmentData: action.payload, loadingEnrollmentData: false };
      
    // ✅ NUEVO
    case 'SET_AVAILABLE_SECTIONS':
      return { ...state, availableSections: action.payload, loadingSections: false };
      
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
interface StudentContextType {
  // Estado
  state: StudentState;
  
  // Acciones de datos
  fetchStudents: (filters?: StudentFilters) => Promise<void>;
  fetchStudentById: (id: number) => Promise<void>;
  fetchParentByDPI: (dpi: string) => Promise<void>;
  fetchActiveEnrollment: (studentId: number, cycleId: number) => Promise<void>;
  fetchEnrollmentData: () => Promise<void>; // ✅ NUEVO
  fetchSectionsByGradeAndCycle: (cycleId: number, gradeId: number) => Promise<void>; // ✅ NUEVO
  
  // Acciones CRUD
  createStudent: (data: CreateStudentPayload) => Promise<{ success: boolean; message?: string; details?: any[] }>;
  updateStudent: (id: number, data: Partial<Student>) => Promise<{ success: boolean; message?: string }>;
  removeStudent: (id: number) => Promise<{ success: boolean; message?: string }>;
  transferStudent: (studentId: number, transferData: StudentTransferPayload) => Promise<{ success: boolean; message?: string }>;
  
  // Acciones de UI
  setFilters: (filters: StudentFilters) => void;
  setFormMode: (mode: 'create' | 'edit' | 'transfer' | null, editingId?: number) => void;
  clearError: () => void;
  clearParentDpiInfo: () => void;
  clearAvailableSections: () => void; // ✅ NUEVO
  resetState: () => void;
  
  // Utilidades
  refreshStudents: () => Promise<void>;
  getStudentById: (id: number) => Student | undefined;
}

// Crear contexto
const StudentContext = createContext<StudentContextType | undefined>(undefined);

// Provider del contexto
interface StudentProviderProps {
  children: ReactNode;
}

export function StudentProvider({ children }: StudentProviderProps) {
  const [state, dispatch] = useReducer(studentReducer, initialState);

  // Función auxiliar para manejar errores
  const handleError = useCallback((error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    return message;
  }, []);

  // Simular meta información
  const createMockMeta = useCallback((data: Student[], filters: StudentFilters = {}): StudentState['meta'] => {
    const limit = filters.limit || 10;
    const page = filters.page || 1;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    
    return { total, page, limit, totalPages };
  }, []);

  // Acciones de datos existentes (sin cambios)
  const fetchStudents = useCallback(async (filters?: StudentFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await getStudents();
      const meta = createMockMeta(data, filters);
      
      dispatch({
        type: 'SET_STUDENTS',
        payload: { data, meta }
      });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error) {
      handleError(error, 'Error al cargar los estudiantes');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, createMockMeta]);

  const fetchStudentById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const student = await getStudentById(id);
      dispatch({ type: 'SET_CURRENT_STUDENT', payload: student });
    } catch (error) {
      handleError(error, 'Error al cargar el estudiante');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const fetchParentByDPI = useCallback(async (dpi: string) => {
    try {
      dispatch({ type: 'SET_LOADING_DPI', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const parentInfo = await getUserByDPI(dpi);
      dispatch({ type: 'SET_PARENT_DPI_INFO', payload: parentInfo });
    } catch (error) {
      handleError(error, 'Error al buscar padre por DPI');
    } finally {
      dispatch({ type: 'SET_LOADING_DPI', payload: false });
    }
  }, [handleError]);

  const fetchActiveEnrollment = useCallback(async (studentId: number, cycleId: number) => {
    try {
      dispatch({ type: 'SET_LOADING_ENROLLMENT', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const enrollment = await getActiveEnrollment(studentId, cycleId);
      dispatch({ type: 'SET_ACTIVE_ENROLLMENT', payload: enrollment });
    } catch (error) {
      handleError(error, 'Error al cargar la matrícula activa');
    } finally {
      dispatch({ type: 'SET_LOADING_ENROLLMENT', payload: false });
    }
  }, [handleError]);

  // ✅ NUEVO: Obtener datos de inscripción (ciclo activo + grados)
  const fetchEnrollmentData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING_ENROLLMENT_DATA', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await studentEnrollmentService.getEnrollmentData();
      dispatch({ type: 'SET_ENROLLMENT_DATA', payload: data });
    } catch (error) {
      handleError(error, 'Error al cargar datos de inscripción');
      dispatch({ type: 'SET_ENROLLMENT_DATA', payload: null });
    } finally {
      dispatch({ type: 'SET_LOADING_ENROLLMENT_DATA', payload: false });
    }
  }, [handleError]);

  // ✅ NUEVO: Obtener secciones disponibles por grado y ciclo
  const fetchSectionsByGradeAndCycle = useCallback(async (cycleId: number, gradeId: number) => {
    try {
      dispatch({ type: 'SET_LOADING_SECTIONS', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await studentEnrollmentService.getSectionsByGradeAndCycle(cycleId, gradeId);
      dispatch({ type: 'SET_AVAILABLE_SECTIONS', payload: data });
    } catch (error) {
      handleError(error, 'Error al cargar secciones disponibles');
      dispatch({ type: 'SET_AVAILABLE_SECTIONS', payload: null });
    } finally {
      dispatch({ type: 'SET_LOADING_SECTIONS', payload: false });
    }
  }, [handleError]);

  // Acciones CRUD (sin cambios)
  const createStudentAction = useCallback(async (data: CreateStudentPayload) => {
    let uploadedPicture: { publicId: string; kind: string; url: string; description: string } | undefined;
    
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      if (data.profileImage instanceof File) {
        console.log('📸 Procesando imagen de perfil...');
        try {
          console.log('📸 Subiendo imagen a Cloudinary...');
          const result = await uploadImageToCloudinary(data.profileImage);
          uploadedPicture = {
            publicId: result.publicId,
            kind: 'profile',
            url: result.url,
            description: 'Foto de perfil del estudiante',
          };
          console.log('✅ Imagen subida exitosamente:', result.url);
        } catch (imageError) {
          console.error('❌ Error al subir imagen:', imageError);
          toast.error('No se pudo subir la imagen');
          throw new Error('Error al subir la imagen');
        }
      }

      const studentPayload = {
        ...data,
        pictures: uploadedPicture 
          ? [...(data.pictures || []), uploadedPicture] 
          : data.pictures,
        profileImage: undefined,
      };
      
      const newStudent = await createStudent(studentPayload);
      dispatch({ type: 'ADD_STUDENT', payload: newStudent });
      
      toast.success("Estudiante creado correctamente");
      return { success: true };
    } catch (error: any) {
      if (uploadedPicture?.publicId) {
        try {
          console.log('🗑️ Eliminando imagen por error en registro...');
          await deleteImageFromCloudinary(uploadedPicture.publicId);
        } catch (deleteError) {
          console.warn("No se pudo eliminar la imagen:", deleteError);
        }
      }
      
      const message = handleError(error, 'Error al crear el estudiante');
      return {
        success: false,
        message,
        details: error.details || []
      };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateStudentAction = useCallback(async (id: number, data: Partial<Student>) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedStudent = await updateStudent(id, data);
      dispatch({
        type: 'UPDATE_STUDENT',
        payload: { id, data: updatedStudent }
      });
      
      toast.success("Estudiante actualizado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al actualizar el estudiante');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeStudent = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await deleteStudent(id);
      dispatch({ type: 'REMOVE_STUDENT', payload: id });
      
      toast.success("Estudiante eliminado correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al eliminar el estudiante');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const transferStudentAction = useCallback(async (studentId: number, transferData: StudentTransferPayload) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newEnrollment = await transferStudent(studentId, transferData);
      dispatch({ type: 'SET_ACTIVE_ENROLLMENT', payload: newEnrollment });
      
      toast.success("Estudiante transferido correctamente");
      return { success: true };
    } catch (error: any) {
      const message = handleError(error, 'Error al transferir el estudiante');
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Acciones de UI
  const setFilters = useCallback((filters: StudentFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setFormMode = useCallback((mode: 'create' | 'edit' | 'transfer' | null, editingId?: number) => {
    dispatch({ type: 'SET_FORM_MODE', payload: { mode, editingId } });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const clearParentDpiInfo = useCallback(() => {
    dispatch({ type: 'SET_PARENT_DPI_INFO', payload: null });
  }, []);

  // ✅ NUEVO
  const clearAvailableSections = useCallback(() => {
    dispatch({ type: 'SET_AVAILABLE_SECTIONS', payload: null });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Utilidades
  const refreshStudents = useCallback(async () => {
    await fetchStudents(state.filters);
  }, [fetchStudents, state.filters]);

  const getStudentByIdFromState = useCallback((id: number) => {
    return state.students.find(student => student.id === id);
  }, [state.students]);

  // Valor del contexto
  const contextValue: StudentContextType = {
    state,
    
    // Acciones de datos
    fetchStudents,
    fetchStudentById,
    fetchParentByDPI,
    fetchActiveEnrollment,
    fetchEnrollmentData, // ✅ NUEVO
    fetchSectionsByGradeAndCycle, // ✅ NUEVO
    
    // Acciones CRUD
    createStudent: createStudentAction,
    updateStudent: updateStudentAction,
    removeStudent,
    transferStudent: transferStudentAction,
    
    // Acciones de UI
    setFilters,
    setFormMode,
    clearError,
    clearParentDpiInfo,
    clearAvailableSections, // ✅ NUEVO
    resetState,
    
    // Utilidades
    refreshStudents,
    getStudentById: getStudentByIdFromState
  };

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
}

// Hook para usar el contexto (sin cambios)
export function useStudentContext() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudentContext must be used within a StudentProvider');
  }
  return context;
}

// ✅ MODIFICADO: Hook especializado para formularios
export function useStudentForm() {
  const {
    state: { 
      submitting, 
      formMode, 
      editingId, 
      currentStudent, 
      parentDpiInfo, 
      loadingDpi,
      enrollmentData, // ✅ NUEVO
      availableSections, // ✅ NUEVO
      loadingEnrollmentData, // ✅ NUEVO
      loadingSections // ✅ NUEVO
    },
    createStudent,
    updateStudent,
    setFormMode,
    fetchStudentById,
    fetchParentByDPI,
    clearParentDpiInfo,
    fetchEnrollmentData, // ✅ NUEVO
    fetchSectionsByGradeAndCycle, // ✅ NUEVO
    clearAvailableSections // ✅ NUEVO
  } = useStudentContext();

  const handleSubmit = useCallback(async (data: CreateStudentPayload | Partial<Student>) => {
    if (formMode === 'edit' && editingId) {
      return await updateStudent(editingId, data as Partial<Student>);
    } else {
      return await createStudent(data as CreateStudentPayload);
    }
  }, [formMode, editingId, createStudent, updateStudent]);

  const startEdit = useCallback(async (id: number) => {
    setFormMode('edit', id);
    await fetchStudentById(id);
  }, [setFormMode, fetchStudentById]);

  const startCreate = useCallback(() => {
    setFormMode('create');
  }, [setFormMode]);

  const startTransfer = useCallback(async (id: number) => {
    setFormMode('transfer', id);
    await fetchStudentById(id);
  }, [setFormMode, fetchStudentById]);

  const cancelForm = useCallback(() => {
    setFormMode(null);
    clearParentDpiInfo();
    clearAvailableSections(); // ✅ NUEVO
  }, [setFormMode, clearParentDpiInfo, clearAvailableSections]);

  const searchParentByDPI = useCallback(async (dpi: string) => {
    await fetchParentByDPI(dpi);
  }, [fetchParentByDPI]);

  // ✅ NUEVO: Cargar secciones cuando cambia el grado
  const loadSectionsByGrade = useCallback(async (cycleId: number, gradeId: number) => {
    await fetchSectionsByGradeAndCycle(cycleId, gradeId);
  }, [fetchSectionsByGradeAndCycle]);

  return {
    submitting,
    formMode,
    editingId,
    currentStudent,
    parentDpiInfo,
    loadingDpi,
    enrollmentData, // ✅ NUEVO
    availableSections, // ✅ NUEVO
    loadingEnrollmentData, // ✅ NUEVO
    loadingSections, // ✅ NUEVO
    handleSubmit,
    startEdit,
    startCreate,
    startTransfer,
    cancelForm,
    searchParentByDPI,
    clearParentDpiInfo,
    fetchEnrollmentData, // ✅ NUEVO
    loadSectionsByGrade, // ✅ NUEVO
    clearAvailableSections // ✅ NUEVO
  };
}

// Hook especializado para listas (sin cambios)
export function useStudentList() {
  const {
    state: { students, meta, loading, error, filters },
    fetchStudents,
    setFilters,
    removeStudent
  } = useStudentContext();

  const handleFilterChange = useCallback(async (newFilters: StudentFilters) => {
    setFilters(newFilters);
    await fetchStudents(newFilters);
  }, [setFilters, fetchStudents]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este estudiante?')) {
      return await removeStudent(id);
    }
    return { success: false, message: 'Operación cancelada' };
  }, [removeStudent]);

  return {
    students,
    meta,
    loading,
    error,
    filters,
    handleFilterChange,
    handleDelete,
    refetch: () => fetchStudents(filters)
  };
}

// Hook especializado para transferencias (sin cambios)
export function useStudentTransfer() {
  const {
    state: { submitting, currentStudent, activeEnrollment, loadingEnrollment },
    transferStudent,
    fetchActiveEnrollment,
    setFormMode
  } = useStudentContext();

  const handleTransfer = useCallback(async (studentId: number, transferData: StudentTransferPayload) => {
    const result = await transferStudent(studentId, transferData);
    if (result.success) {
      setFormMode(null);
    }
    return result;
  }, [transferStudent, setFormMode]);

  const loadStudentEnrollment = useCallback(async (studentId: number, cycleId: number) => {
    await fetchActiveEnrollment(studentId, cycleId);
  }, [fetchActiveEnrollment]);

  return {
    submitting,
    currentStudent,
    activeEnrollment,
    loadingEnrollment,
    handleTransfer,
    loadStudentEnrollment
  };
}