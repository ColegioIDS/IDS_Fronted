// src/hooks/useSchedule.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner'; // o tu librería de toasts
import { 
  getScheduleFormData,
  getTeacherAvailability,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  batchSaveSchedules,
  deleteSchedulesBySection
} from '@/services/schedule';
import { 
  Schedule,
  ScheduleFormData,
  ScheduleFormValues,
  TeacherAvailability
} from '@/types/schedules';

// ==================== TIPOS DEL HOOK ====================

interface UseScheduleOptions {
  autoLoadFormData?: boolean;
  autoLoadAvailability?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface UseScheduleReturn {
  // Data states
  formData: ScheduleFormData | null;
  schedules: Schedule[];
  teacherAvailability: TeacherAvailability | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingFormData: boolean;
  isLoadingAvailability: boolean;
  isSubmitting: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  loadFormData: () => Promise<void>;
  loadAvailability: () => Promise<void>;
  fetchSchedules: (filters?: {
    sectionId?: number;
    courseId?: number;
    teacherId?: number;
    dayOfWeek?: number;
  }) => Promise<void>;
  createScheduleItem: (data: ScheduleFormValues) => Promise<Schedule | null>;
  updateScheduleItem: (id: number, data: Partial<ScheduleFormValues>) => Promise<Schedule | null>;
  deleteScheduleItem: (id: number) => Promise<boolean>;
  batchSave: (schedules: ScheduleFormValues[]) => Promise<boolean>;
  deleteBySection: (sectionId: number, keepIds?: number[]) => Promise<boolean>;
  
  // Helpers
  clearError: () => void;
  reset: () => void;
}

// ==================== HOOK ====================

export function useSchedule(
  options: UseScheduleOptions = {}
): UseScheduleReturn {
  
  const {
    autoLoadFormData = false,
    autoLoadAvailability = false,
    onSuccess,
    onError
  } = options;

  // ==================== STATES ====================
  
  const [formData, setFormData] = useState<ScheduleFormData | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teacherAvailability, setTeacherAvailability] = useState<TeacherAvailability | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // ==================== REFS ====================
  
  // Prevenir múltiples llamadas simultáneas
  const isLoadingFormDataRef = useRef(false);
  const isLoadingAvailabilityRef = useRef(false);

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
    setSchedules([]);
    setTeacherAvailability(null);
    setError(null);
    setIsLoading(false);
    setIsLoadingFormData(false);
    setIsLoadingAvailability(false);
    setIsSubmitting(false);
  }, []);

  
// ==================== LOAD FORM DATA ====================

const loadFormData = useCallback(async () => {
  if (isLoadingFormDataRef.current) {
    console.log('loadFormData ya en progreso, saltando...');
    return;
  }

  try {
    isLoadingFormDataRef.current = true;
    setIsLoadingFormData(true);
    setError(null);
    
    const data = await getScheduleFormData();
    setFormData(data);
    setSchedules(data.schedules.map(s => ({
      id: s.id,
      sectionId: s.sectionId,
      courseId: s.courseId,
      teacherId: s.teacherId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      classroom: s.classroom,
      section: {
        id: s.sectionId,
        name: s.sectionName,
        grade: {
          id: s.gradeId,
          name: s.gradeName
        }
      },
      course: {
        id: s.courseId,
        name: s.courseName,
        color: s.courseColor || undefined
      },
      teacher: s.teacherId && s.teacherName ? {
        id: s.teacherId,
        givenNames: s.teacherName.split(' ')[0] || '',
        lastNames: s.teacherName.split(' ').slice(1).join(' ') || ''
      } : undefined
    })));
    
    if (!data.activeCycle) {
      throw new Error('No hay ciclo escolar activo');
    }
    
  } catch (err: any) {
    const errorMessage = err.message || 'Error al cargar datos del formulario';
    setError(errorMessage);
    console.error('Error en loadFormData:', err);
  } finally {
    setIsLoadingFormData(false);
    isLoadingFormDataRef.current = false;
  }
}, []); // ← SIN dependencias

// ==================== EFFECTS ====================

useEffect(() => {
  if (autoLoadFormData && !formData && !isLoadingFormDataRef.current) {
    loadFormData();
  }
  // Limpiar: no llamar loadFormData más si hay error
}, [autoLoadFormData, !!formData]); // ← Solo estas 2 dependencias
  // ==================== LOAD AVAILABILITY ====================
  
const loadAvailability = useCallback(async () => {
  if (isLoadingAvailabilityRef.current) {
    console.log('loadAvailability ya en progreso, saltando...');
    return;
  }

  try {
    isLoadingAvailabilityRef.current = true;
    setIsLoadingAvailability(true);
    setError(null);
    
    const data = await getTeacherAvailability();
    setTeacherAvailability(data);
    
  } catch (err: any) {
    const errorMessage = err.message || 'Error al cargar disponibilidad';
    setError(errorMessage);
    console.error('Error en loadAvailability:', err);
  } finally {
    setIsLoadingAvailability(false);
    isLoadingAvailabilityRef.current = false;
  }
}, []); // ← SIN dependencias

// ==================== EFFECTS ====================

useEffect(() => {
  if (autoLoadAvailability && !teacherAvailability && !isLoadingAvailabilityRef.current) {
    loadAvailability();
  }
}, [autoLoadAvailability, !!teacherAvailability]); // ← Solo estas 2 dependencias

  // ==================== FETCH SCHEDULES ====================
  
  const fetchSchedules = useCallback(async (filters?: {
    sectionId?: number;
    courseId?: number;
    teacherId?: number;
    dayOfWeek?: number;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getSchedules(filters);
      setSchedules(data);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar horarios';
      handleError(errorMessage);
      console.error('Error en fetchSchedules:', err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // ==================== CREATE SCHEDULE ====================
  
  const createScheduleItem = useCallback(async (
    data: ScheduleFormValues
  ): Promise<Schedule | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const newSchedule = await createSchedule(data);
      
      // Actualizar lista local
      setSchedules(prev => [...prev, newSchedule]);
      
      // Refrescar disponibilidad
      await loadAvailability();
      
      handleSuccess('Horario creado exitosamente');
      return newSchedule;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear horario';
      handleError(errorMessage);
      console.error('Error en createScheduleItem:', err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadAvailability, handleSuccess, handleError]);

  // ==================== UPDATE SCHEDULE ====================
  
  const updateScheduleItem = useCallback(async (
    id: number,
    data: Partial<ScheduleFormValues>
  ): Promise<Schedule | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const updatedSchedule = await updateSchedule(id, data);
      
      // Actualizar lista local
      setSchedules(prev => 
        prev.map(item => item.id === id ? updatedSchedule : item)
      );
      
      // Refrescar disponibilidad
      await loadAvailability();
      
      handleSuccess('Horario actualizado exitosamente');
      return updatedSchedule;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar horario';
      handleError(errorMessage);
      console.error('Error en updateScheduleItem:', err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadAvailability, handleSuccess, handleError]);

  // ==================== DELETE SCHEDULE ====================
  
  const deleteScheduleItem = useCallback(async (id: number): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await deleteSchedule(id);
      
      // Actualizar lista local
      setSchedules(prev => prev.filter(item => item.id !== id));
      
      // Refrescar disponibilidad
      await loadAvailability();
      
      handleSuccess('Horario eliminado exitosamente');
      return true;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar horario';
      handleError(errorMessage);
      console.error('Error en deleteScheduleItem:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadAvailability, handleSuccess, handleError]);

  // ==================== BATCH SAVE ====================
  
  const batchSave = useCallback(async (
    schedules: ScheduleFormValues[]
  ): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const savedSchedules = await batchSaveSchedules(schedules);
      
      // Recargar datos
      await Promise.all([
        loadFormData(),
        loadAvailability()
      ]);
      
      handleSuccess(`${savedSchedules.length} horarios guardados exitosamente`);
      return true;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error en guardado masivo';
      handleError(errorMessage);
      console.error('Error en batchSave:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadFormData, loadAvailability, handleSuccess, handleError]);

  // ==================== DELETE BY SECTION ====================
  
  const deleteBySection = useCallback(async (
    sectionId: number,
    keepIds: number[] = []
  ): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await deleteSchedulesBySection(sectionId, keepIds);
      
      // Actualizar lista local
      setSchedules(prev => 
        prev.filter(item => 
          item.sectionId !== sectionId || keepIds.includes(item.id)
        )
      );
      
      // Refrescar disponibilidad
      await loadAvailability();
      
      handleSuccess('Horarios limpiados exitosamente');
      return true;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al limpiar horarios';
      handleError(errorMessage);
      console.error('Error en deleteBySection:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadAvailability, handleSuccess, handleError]);

  // ==================== EFFECTS ====================
  
  // Auto-load form data on mount
  useEffect(() => {
    if (autoLoadFormData && !formData && !isLoadingFormDataRef.current) {
      loadFormData();
    }
  }, [autoLoadFormData, formData, loadFormData]);

  // Auto-load availability on mount
  useEffect(() => {
    if (autoLoadAvailability && !teacherAvailability && !isLoadingAvailabilityRef.current) {
      loadAvailability();
    }
  }, [autoLoadAvailability, teacherAvailability, loadAvailability]);

  // ==================== RETURN ====================
  
  return {
    // Data
    formData,
    schedules,
    teacherAvailability,
    
    // Loading
    isLoading,
    isLoadingFormData,
    isLoadingAvailability,
    isSubmitting,
    
    // Error
    error,
    
    // Actions
    loadFormData,
    loadAvailability,
    fetchSchedules,
    createScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    batchSave,
    deleteBySection,
    
    // Helpers
    clearError,
    reset,
  };
}

// ==================== VARIANTES DEL HOOK ====================

/**
 * Hook simplificado para cargar solo formData
 */
export function useScheduleFormData() {
  const { formData, isLoadingFormData, error, loadFormData } = useSchedule({
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
export function useScheduleBySection(sectionId: number) {
  const { 
    schedules, 
    isLoading, 
    error, 
    fetchSchedules,
    batchSave,
    deleteBySection,
    isSubmitting
  } = useSchedule();

  useEffect(() => {
    if (sectionId) {
      fetchSchedules({ sectionId });
    }
  }, [sectionId, fetchSchedules]);

  return {
    schedules,
    isLoading,
    isSubmitting,
    error,
    reload: () => fetchSchedules({ sectionId }),
    batchSave,
    deleteBySection: (keepIds?: number[]) => deleteBySection(sectionId, keepIds)
  };
}