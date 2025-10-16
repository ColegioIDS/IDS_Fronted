// src/hooks/useCourseGrade.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner'; // o 'react-toastify' según uses
import {
  getCourseGrades,
  getCourseGradeById,
  createCourseGrade,
  updateCourseGrade,
  deleteCourseGrade,
  getCourseGradeFormData,
  getCourseGradesByCourse,
  getCourseGradesByGrade
} from '@/services/course-grade';
import {
  CourseGradeWithRelations,
  CourseGradeFilters,
  CourseGradeFormData as CourseGradeApiFormData
} from '@/types/course-grade.types';
import { CourseGradeFormData } from '@/schemas/courseGradeSchema';

interface UseCourseGradeReturn {
  // Data
  courseGrades: CourseGradeWithRelations[];
  currentCourseGrade: CourseGradeWithRelations | null;
  formData: CourseGradeApiFormData | null;

  // Loading states
  isLoading: boolean;
  isLoadingFormData: boolean;
  isSubmitting: boolean;

  // Error states
  error: string | null;

  // CRUD operations
  fetchCourseGrades: (filters?: CourseGradeFilters) => Promise<void>;
  fetchCourseGradeById: (id: number) => Promise<void>;
  fetchFormData: () => Promise<void>;
  fetchByCourse: (courseId: number) => Promise<void>;
  fetchByGrade: (gradeId: number) => Promise<void>;
  createCourseGradeItem: (data: CourseGradeFormData) => Promise<CourseGradeWithRelations | null>;
  updateCourseGradeItem: (id: number, data: Partial<CourseGradeFormData>) => Promise<CourseGradeWithRelations | null>;
  deleteCourseGradeItem: (id: number) => Promise<boolean>;

  // UI helpers
  clearError: () => void;
  clearCurrentCourseGrade: () => void;
}

export function useCourseGrade(
  autoFetch: boolean = true,
  initialFilters?: CourseGradeFilters
): UseCourseGradeReturn {
  // States
  const [courseGrades, setCourseGrades] = useState<CourseGradeWithRelations[]>([]);
  const [currentCourseGrade, setCurrentCourseGrade] = useState<CourseGradeWithRelations | null>(null);
  const [formData, setFormData] = useState<CourseGradeApiFormData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== FETCH OPERATIONS ====================

  /**
   * Obtiene todas las relaciones curso-grado
   */
  const fetchCourseGrades = useCallback(async (filters?: CourseGradeFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCourseGrades(filters);
      setCourseGrades(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar relaciones curso-grado';
      setError(errorMessage);
      console.error('Error fetching course grades:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtiene una relación curso-grado por ID
   */
  const fetchCourseGradeById = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCourseGradeById(id);
      setCurrentCourseGrade(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar relación curso-grado';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching course grade by id:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtiene datos del formulario (cursos y grados del ciclo activo)
   */
  const fetchFormData = useCallback(async () => {
    try {
      setIsLoadingFormData(true);
      setError(null);
      const data = await getCourseGradeFormData();
      setFormData(data);

      // Validaciones y notificaciones
      if (data.grades.length === 0) {
        toast.warning(
          `No hay grados disponibles para el ciclo ${data.activeCycle.name}`,
          {
            description: 'Por favor, crea grados para este ciclo antes de continuar.',
          }
        );
      }

      if (data.courses.length === 0) {
        toast.warning(
          'No hay cursos activos disponibles',
          {
            description: 'Por favor, crea cursos activos antes de continuar.',
          }
        );
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar datos del formulario';
      setError(errorMessage);

      if (err.response?.status === 404) {
        toast.error(
          'No hay ciclo escolar activo',
          {
            description: 'Por favor, activa un ciclo escolar antes de crear relaciones.',
          }
        );
      } else {
        toast.error(errorMessage);
      }
      console.error('Error fetching form data:', err);
    } finally {
      setIsLoadingFormData(false);
    }
  }, []);

  /**
   * Obtiene relaciones por curso
   */
  const fetchByCourse = useCallback(async (courseId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCourseGradesByCourse(courseId);
      setCourseGrades(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar relaciones por curso';
      setError(errorMessage);
      console.error('Error fetching course grades by course:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtiene relaciones por grado
   */
  const fetchByGrade = useCallback(async (gradeId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCourseGradesByGrade(gradeId);
      setCourseGrades(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar relaciones por grado';
      setError(errorMessage);
      console.error('Error fetching course grades by grade:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== CREATE ====================

  /**
   * Crea una nueva relación curso-grado
   */
  const createCourseGradeItem = useCallback(
    async (data: CourseGradeFormData): Promise<CourseGradeWithRelations | null> => {
      try {
        setIsSubmitting(true);
        setError(null);
        const newCourseGrade = await createCourseGrade(data);
        
        // Actualizar la lista localmente
        setCourseGrades(prev => [...prev, newCourseGrade]);
        
        toast.success('Relación curso-grado creada correctamente');
        return newCourseGrade;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al crear relación curso-grado';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error creating course grade:', err);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  // ==================== UPDATE ====================

  /**
   * Actualiza una relación curso-grado
   */
  const updateCourseGradeItem = useCallback(
    async (
      id: number,
      data: Partial<CourseGradeFormData>
    ): Promise<CourseGradeWithRelations | null> => {
      try {
        setIsSubmitting(true);
        setError(null);
        const updatedCourseGrade = await updateCourseGrade(id, data);
        
        // Actualizar la lista localmente
        setCourseGrades(prev =>
          prev.map(item => (item.id === id ? updatedCourseGrade : item))
        );
        
        // Actualizar currentCourseGrade si es el mismo
        if (currentCourseGrade?.id === id) {
          setCurrentCourseGrade(updatedCourseGrade);
        }
        
        toast.success('Relación curso-grado actualizada correctamente');
        return updatedCourseGrade;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al actualizar relación curso-grado';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error updating course grade:', err);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCourseGrade]
  );

  // ==================== DELETE ====================

  /**
   * Elimina una relación curso-grado
   */
  const deleteCourseGradeItem = useCallback(async (id: number): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);
      await deleteCourseGrade(id);
      
      // Actualizar la lista localmente
      setCourseGrades(prev => prev.filter(item => item.id !== id));
      
      // Limpiar currentCourseGrade si es el mismo
      if (currentCourseGrade?.id === id) {
        setCurrentCourseGrade(null);
      }
      
      toast.success('Relación curso-grado eliminada correctamente');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar relación curso-grado';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error deleting course grade:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentCourseGrade]);

  // ==================== HELPERS ====================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentCourseGrade = useCallback(() => {
    setCurrentCourseGrade(null);
  }, []);

  // ==================== AUTO FETCH ====================

  useEffect(() => {
    if (autoFetch) {
      fetchCourseGrades(initialFilters);
    }
  }, [autoFetch, fetchCourseGrades, initialFilters]);

  // ==================== RETURN ====================

  return {
    // Data
    courseGrades,
    currentCourseGrade,
    formData,

    // Loading states
    isLoading,
    isLoadingFormData,
    isSubmitting,

    // Error states
    error,

    // CRUD operations
    fetchCourseGrades,
    fetchCourseGradeById,
    fetchFormData,
    fetchByCourse,
    fetchByGrade,
    createCourseGradeItem,
    updateCourseGradeItem,
    deleteCourseGradeItem,

    // UI helpers
    clearError,
    clearCurrentCourseGrade,
  };
}