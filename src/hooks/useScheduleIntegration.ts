// src/hooks/useScheduleIntegration.ts
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// Context imports
import { useScheduleContext } from "@/context/ScheduleContext";
import { useGradeScheduleConfigContext } from "@/context/ScheduleConfigContext";
import { useSectionContext } from "@/context/SectionsContext";
import { useCourseContext } from "@/context/CourseContext";
import { useTeacherContext } from "@/context/TeacherContext";

// Types
import type { ScheduleFormValues } from "@/types/schedules";
import type { ScheduleChange } from "@/types/schedules.types";

// Helper type for handling undefined vs null compatibility
type ScheduleDataInput = {
  sectionId?: number;
  courseId?: number | null | undefined;
  teacherId?: number | null | undefined;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  classroom?: string | null | undefined;
};

/**
 * Hook personalizado que integra todos los contextos relacionados con horarios
 * Proporciona una interfaz unificada para operaciones complejas
 */
export function useScheduleIntegration() {
  // State para controlar la inicialización
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Contexts
  const scheduleContext = useScheduleContext();
  const gradeConfigContext = useGradeScheduleConfigContext();
  const sectionContext = useSectionContext();
  const courseContext = useCourseContext();
  const teacherContext = useTeacherContext();

  // Extracted states for easier access
  const scheduleState = scheduleContext.state;
  const gradeConfigState = gradeConfigContext.state;
  const sectionState = sectionContext.state;
  const courseState = courseContext.state;
  const teacherState = teacherContext.state;

  // Data normalization helper
  const normalizeScheduleData = useCallback((data: ScheduleDataInput): Partial<ScheduleFormValues> => {
    const result: Partial<ScheduleFormValues> = {};
    
    if (data.sectionId !== undefined) result.sectionId = data.sectionId;
    if (data.courseId !== undefined) result.courseId = data.courseId || undefined;
    if (data.teacherId !== undefined) result.teacherId = data.teacherId || null;
    if (data.dayOfWeek !== undefined) result.dayOfWeek = data.dayOfWeek as any;
    if (data.startTime !== undefined) result.startTime = data.startTime;
    if (data.endTime !== undefined) result.endTime = data.endTime;
    if (data.classroom !== undefined) result.classroom = data.classroom || undefined;
    
    return result;
  }, []);

  // Determine the correct fetch function for teachers based on context structure
  const fetchTeachers = useCallback(async () => {
    try {
      // Try different possible method names based on your context structure
      if ('fetchTeachers' in teacherContext) {
        await (teacherContext as any).fetchTeachers();
      } else if ('fetchUsers' in teacherContext) {
        await (teacherContext as any).fetchUsers();
      } else if ('loadTeachers' in teacherContext) {
        await (teacherContext as any).loadTeachers();
      } else {
        console.warn('No se encontró método para cargar profesores en TeacherContext');
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      throw error;
    }
  }, [teacherContext]);

  // Initialize all data
  const initializeData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      await Promise.all([
        gradeConfigContext.fetchGrades(),
        sectionContext.fetchSections(),
        courseContext.fetchCourses(),
        fetchTeachers(),
        scheduleContext.refreshSchedules()
      ]);
      
      setIsInitialized(true);
      console.log('✅ Datos inicializados correctamente');
    } catch (error) {
      console.error('❌ Error inicializando datos:', error);
      toast.error('Error al cargar datos iniciales');
    } finally {
      setIsRefreshing(false);
    }
  }, [
    gradeConfigContext.fetchGrades,
    sectionContext.fetchSections,
    courseContext.fetchCourses,
    fetchTeachers,
    scheduleContext.refreshSchedules
  ]);

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        scheduleContext.refreshSchedules(),
        gradeConfigContext.fetchGrades(),
        sectionContext.fetchSections(),
        courseContext.fetchCourses(),
        fetchTeachers()
      ]);
      toast.success('Datos actualizados');
    } catch (error) {
      toast.error('Error al actualizar datos');
    } finally {
      setIsRefreshing(false);
    }
  }, [
    scheduleContext.refreshSchedules,
    gradeConfigContext.fetchGrades,
    sectionContext.fetchSections,
    courseContext.fetchCourses,
    fetchTeachers
  ]);

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeData();
    }
  }, [initializeData, isInitialized]);

  // Enhanced batch save with proper error handling
  const handleBatchSave = useCallback(async (changes: ScheduleChange[]) => {
    console.log('🟢 Procesando', changes.length, 'cambios');
    
    try {
      // Separate changes by action type
      const creates = changes.filter(change => change.action === 'create');
      const updates = changes.filter(change => change.action === 'update');
      const deletes = changes.filter(change => change.action === 'delete');

      let results = {
        deleted: 0,
        updated: 0,
        created: 0,
        errors: [] as string[]
      };

      // Process deletions first
      for (const change of deletes) {
        try {
          if (typeof change.schedule.id === 'number') {
            await scheduleContext.removeSchedule(change.schedule.id);
            results.deleted++;
          }
        } catch (error) {
          results.errors.push(`Error eliminando horario: ${error}`);
        }
      }

      // Process updates
      for (const change of updates) {
        try {
          if (typeof change.schedule.id === 'number') {
            const updateData = normalizeScheduleData({
              sectionId: change.schedule.sectionId,
              courseId: change.schedule.courseId,
              teacherId: change.schedule.teacherId,
              dayOfWeek: change.schedule.dayOfWeek,
              startTime: change.schedule.startTime,
              endTime: change.schedule.endTime,
              classroom: change.schedule.classroom,
            });
            
            await scheduleContext.updateSchedule(change.schedule.id, updateData);
            results.updated++;
          }
        } catch (error) {
          results.errors.push(`Error actualizando horario: ${error}`);
        }
      }

      // Process creations with batch
      if (creates.length > 0) {
        try {
          const schedulesToSave: ScheduleFormValues[] = creates
            .filter(change => change.schedule.courseId && change.schedule.sectionId)
            .map(change => ({
              sectionId: change.schedule.sectionId,
              courseId: change.schedule.courseId!,
              teacherId: change.schedule.teacherId || null, // undefined -> null
              dayOfWeek: change.schedule.dayOfWeek,
              startTime: change.schedule.startTime,
              endTime: change.schedule.endTime,
              classroom: change.schedule.classroom || undefined,
            }));

          if (schedulesToSave.length > 0) {
            await scheduleContext.createBatchSchedules(schedulesToSave);
            results.created = schedulesToSave.length;
          }
        } catch (error) {
          results.errors.push(`Error en creación masiva: ${error}`);
        }
      }

      // Show results
      if (results.errors.length > 0) {
        toast.error(`Algunos cambios fallaron: ${results.errors.join(', ')}`);
      } else {
        const messages = [];
        if (results.created > 0) messages.push(`${results.created} creados`);
        if (results.updated > 0) messages.push(`${results.updated} actualizados`);
        if (results.deleted > 0) messages.push(`${results.deleted} eliminados`);
        
        toast.success(`✅ Cambios aplicados: ${messages.join(', ')}`);
      }

      return { 
        success: results.errors.length === 0,
        results 
      };
      
    } catch (error) {
      console.error('🔴 Error en handleBatchSave:', error);
      toast.error('Error al procesar cambios');
      throw error;
    }
  }, [scheduleContext]);

  // Get available data with safe fallbacks
  const getAvailableData = useCallback(() => {
    return {
      schedules: scheduleState.schedules || [],
      grades: gradeConfigState.grades || [],
      sections: sectionState.sections || [],
      courses: courseState.courses || [],
      teachers: teacherState.teachers || [], // Solo usar teachers, no users
      scheduleConfigs: gradeConfigState.scheduleConfigs || []
    };
  }, [scheduleState, gradeConfigState, sectionState, courseState, teacherState]);

  // Check loading states
  const getLoadingStates = useCallback(() => {
    return {
      schedules: scheduleState.loading,
      grades: gradeConfigState.loading.grades,
      sections: sectionState.loading,
      courses: courseState.loading,
      teachers: teacherState.loading,
      configs: gradeConfigState.loading.scheduleConfigs,
      general: gradeConfigState.loading.general,
      isRefreshing,
      anyLoading: scheduleState.loading || 
                  gradeConfigState.loading.general || 
                  sectionState.loading || 
                  courseState.loading || 
                  teacherState.loading ||
                  isRefreshing
    };
  }, [scheduleState, gradeConfigState, sectionState, courseState, teacherState, isRefreshing]);

  // Enhanced CRUD operations
  const createSchedule = useCallback(async (data: Partial<ScheduleFormValues> | ScheduleDataInput) => {
    const required = ['sectionId', 'courseId', 'dayOfWeek', 'startTime', 'endTime'];
    const isValid = required.every(field => data[field as keyof typeof data] !== undefined);
    
    if (!isValid) {
      const error = { success: false, message: 'Datos requeridos faltantes' };
      toast.error(error.message);
      return error;
    }
    
    const completeData: ScheduleFormValues = {
      sectionId: data.sectionId!,
      courseId: data.courseId!,
      teacherId: data.teacherId || null,
      dayOfWeek: data.dayOfWeek as any,
      startTime: data.startTime!,
      endTime: data.endTime!,
      classroom: data.classroom || undefined,
    };
    
    return await scheduleContext.createSchedule(completeData);
  }, [scheduleContext.createSchedule]);

  const updateSchedule = useCallback(async (id: number, data: Partial<ScheduleFormValues> | ScheduleDataInput) => {
    const normalizedData = normalizeScheduleData(data);
    return await scheduleContext.updateSchedule(id, normalizedData);
  }, [scheduleContext.updateSchedule, normalizeScheduleData]);

  const deleteSchedule = useCallback(async (id: number) => {
    return await scheduleContext.removeSchedule(id);
  }, [scheduleContext.removeSchedule]);

  return {
    // States
    isInitialized,
    isRefreshing,
    
    // Data
    ...getAvailableData(),
    
    // Loading states
    loading: getLoadingStates(),
    
    // Actions
    initializeData,
    refreshAllData,
    handleBatchSave,
    
    // CRUD operations
    createSchedule,
    updateSchedule,
    deleteSchedule,
    
    // Context access (if needed for specific operations)
    contexts: {
      schedule: scheduleContext,
      gradeConfig: gradeConfigContext,
      section: sectionContext,
      course: courseContext,
      teacher: teacherContext
    }
  };
}