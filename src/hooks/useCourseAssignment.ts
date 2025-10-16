// src/hooks/useCourseAssignment.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner'; // o tu librería de toasts
import { 
  getCourseAssignmentFormData, 
  getSectionAssignmentData,
  getCourseAssignments,
  createCourseAssignment,
  updateCourseAssignment,
  deleteCourseAssignment,
  bulkUpdateCourseAssignments
} from '@/services/course-assignments';
import { 
  CourseAssignmentFormData, 
  SectionAssignmentData,
  CourseAssignment,
  CourseAssignmentFilters
} from '@/types/course-assignments';
import {
  CourseAssignmentFormValues,
  UpdateCourseAssignmentFormValues,
  BulkUpdateFormValues
} from '@/schemas/course-assignment.schema';

// ==================== TIPOS DEL HOOK ====================

interface UseCourseAssignmentOptions {
  autoLoadFormData?: boolean;
  autoLoadSection?: boolean;
  sectionId?: number;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface UseCourseAssignmentReturn {
  // Data states
  formData: CourseAssignmentFormData | null;
  sectionData: SectionAssignmentData | null;
  assignments: CourseAssignment[];
  
  // Loading states
  isLoading: boolean;
  isLoadingFormData: boolean;
  isLoadingSectionData: boolean;
  isSubmitting: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  loadFormData: () => Promise<void>;
  loadSectionData: (sectionId: number) => Promise<void>;
  fetchAssignments: (filters?: CourseAssignmentFilters) => Promise<void>;
  createAssignment: (data: CourseAssignmentFormValues) => Promise<CourseAssignment | null>;
  updateAssignment: (id: number, data: UpdateCourseAssignmentFormValues) => Promise<CourseAssignment | null>;
  deleteAssignment: (id: number) => Promise<boolean>;
  bulkUpdate: (data: BulkUpdateFormValues) => Promise<boolean>;
  
  // Helpers
  clearError: () => void;
  reset: () => void;
}

// ==================== HOOK ====================

export function useCourseAssignment(
  options: UseCourseAssignmentOptions = {}
): UseCourseAssignmentReturn {
  
  const {
    autoLoadFormData = false,
    autoLoadSection = false,
    sectionId,
    onSuccess,
    onError
  } = options;

  // ==================== STATES ====================
  
  const [formData, setFormData] = useState<CourseAssignmentFormData | null>(null);
  const [sectionData, setSectionData] = useState<SectionAssignmentData | null>(null);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [isLoadingSectionData, setIsLoadingSectionData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // ==================== REFS ====================
  
  // Prevenir múltiples llamadas simultáneas
  const isLoadingFormDataRef = useRef(false);
  const isLoadingSectionDataRef = useRef(false);

  // ==================== HELPERS ====================
  
  const handleSuccess = useCallback((message: string) => {
    if (onSuccess) {
      onSuccess(message);
    } else {
      toast.success(message);
    }
  }, [onSuccess]);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    } else {
      toast.error(errorMessage);
    }
  }, [onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setFormData(null);
    setSectionData(null);
    setAssignments([]);
    setError(null);
    setIsLoading(false);
    setIsLoadingFormData(false);
    setIsLoadingSectionData(false);
    setIsSubmitting(false);
  }, []);

  // ==================== LOAD FORM DATA ====================
  
  const loadFormData = useCallback(async () => {
    // Prevenir llamadas duplicadas
    if (isLoadingFormDataRef.current) {
      console.log('loadFormData ya en progreso, saltando...');
      return;
    }

    try {
      isLoadingFormDataRef.current = true;
      setIsLoadingFormData(true);
      setError(null);
      
      const data = await getCourseAssignmentFormData();
      setFormData(data);
      
      // Validar datos críticos
      if (!data.activeCycle) {
        throw new Error('No hay ciclo escolar activo');
      }
      
      if (data.grades.length === 0) {
        console.warn('No hay grados disponibles en el ciclo activo');
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar datos del formulario';
      handleError(errorMessage);
      console.error('Error en loadFormData:', err);
    } finally {
      setIsLoadingFormData(false);
      isLoadingFormDataRef.current = false;
    }
  }, [handleError]);

  // ==================== LOAD SECTION DATA ====================
  
  const loadSectionData = useCallback(async (id: number) => {
    // Prevenir llamadas duplicadas
    if (isLoadingSectionDataRef.current) {
      console.log('loadSectionData ya en progreso, saltando...');
      return;
    }

    try {
      isLoadingSectionDataRef.current = true;
      setIsLoadingSectionData(true);
      setError(null);
      
      const data = await getSectionAssignmentData(id);
      setSectionData(data);
      
      // Validar datos críticos
      if (!data.section) {
        throw new Error('Sección no encontrada');
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar datos de la sección';
      handleError(errorMessage);
      console.error('Error en loadSectionData:', err);
    } finally {
      setIsLoadingSectionData(false);
      isLoadingSectionDataRef.current = false;
    }
  }, [handleError]);

  // ==================== FETCH ASSIGNMENTS ====================
  
  const fetchAssignments = useCallback(async (filters?: CourseAssignmentFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getCourseAssignments(filters);
      const assignmentsArray = Array.isArray(data) ? data : data.data;
      setAssignments(assignmentsArray);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar asignaciones';
      handleError(errorMessage);
      console.error('Error en fetchAssignments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // ==================== CREATE ASSIGNMENT ====================
  
  const createAssignment = useCallback(async (
    data: CourseAssignmentFormValues
  ): Promise<CourseAssignment | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const newAssignment = await createCourseAssignment(data);
      
      // Actualizar lista local
      setAssignments(prev => [...prev, newAssignment]);
      
      handleSuccess('Asignación creada correctamente');
      return newAssignment;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear asignación';
      handleError(errorMessage);
      console.error('Error en createAssignment:', err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [handleSuccess, handleError]);

  // ==================== UPDATE ASSIGNMENT ====================
  
  const updateAssignment = useCallback(async (
    id: number,
    data: UpdateCourseAssignmentFormValues
  ): Promise<CourseAssignment | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const updatedAssignment = await updateCourseAssignment(id, data);
      
      // Actualizar lista local
      setAssignments(prev => 
        prev.map(item => item.id === id ? updatedAssignment : item)
      );
      
      handleSuccess('Asignación actualizada correctamente');
      return updatedAssignment;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar asignación';
      handleError(errorMessage);
      console.error('Error en updateAssignment:', err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [handleSuccess, handleError]);

  // ==================== DELETE ASSIGNMENT ====================
  
  const deleteAssignment = useCallback(async (id: number): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await deleteCourseAssignment(id);
      
      // Actualizar lista local
      setAssignments(prev => prev.filter(item => item.id !== id));
      
      handleSuccess('Asignación eliminada correctamente');
      return true;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar asignación';
      handleError(errorMessage);
      console.error('Error en deleteAssignment:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [handleSuccess, handleError]);

  // ==================== BULK UPDATE ====================
  
  const bulkUpdate = useCallback(async (
    data: BulkUpdateFormValues
  ): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await bulkUpdateCourseAssignments(data);
      
      // Recargar datos de la sección si está disponible
      if (sectionId) {
        await loadSectionData(sectionId);
      }
      
      handleSuccess('Asignaciones actualizadas correctamente');
      return true;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error en actualización masiva';
      handleError(errorMessage);
      console.error('Error en bulkUpdate:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [sectionId, loadSectionData, handleSuccess, handleError]);

  // ==================== EFFECTS ====================
  
  // Auto-load form data on mount
  useEffect(() => {
    if (autoLoadFormData && !formData && !isLoadingFormDataRef.current) {
      loadFormData();
    }
  }, [autoLoadFormData, formData, loadFormData]);

  // Auto-load section data when sectionId changes
  useEffect(() => {
    if (autoLoadSection && sectionId && !isLoadingSectionDataRef.current) {
      loadSectionData(sectionId);
    }
  }, [autoLoadSection, sectionId, loadSectionData]);

  // ==================== RETURN ====================
  
  return {
    // Data
    formData,
    sectionData,
    assignments,
    
    // Loading
    isLoading,
    isLoadingFormData,
    isLoadingSectionData,
    isSubmitting,
    
    // Error
    error,
    
    // Actions
    loadFormData,
    loadSectionData,
    fetchAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    bulkUpdate,
    
    // Helpers
    clearError,
    reset,
  };
}

// ==================== VARIANTES DEL HOOK ====================

/**
 * Hook simplificado para cargar solo formData
 */
export function useCourseAssignmentFormData() {
  const { formData, isLoadingFormData, error, loadFormData } = useCourseAssignment({
    autoLoadFormData: true
  });

  return {
    formData,
    isLoading: isLoadingFormData,
    error,
    reload: loadFormData
  };
}

/**
 * Hook simplificado para una sección específica
 */
export function useCourseAssignmentSection(sectionId: number) {
  const { 
    sectionData, 
    isLoadingSectionData, 
    error, 
    loadSectionData,
    bulkUpdate,
    isSubmitting
  } = useCourseAssignment({
    autoLoadSection: true,
    sectionId
  });

  return {
    sectionData,
    isLoading: isLoadingSectionData,
    isSubmitting,
    error,
    reload: () => loadSectionData(sectionId),
    bulkUpdate
  };
}