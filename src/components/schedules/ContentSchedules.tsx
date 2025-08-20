// src/components/schedules/ContentSchedules.tsx 
'use client';

import React, { useState, useCallback, useEffect } from "react";
import { toast } from 'react-toastify';
import { Moon, Sun, Calendar, RefreshCw } from 'lucide-react';

// Components
import { ScheduleCalendarView } from "@/components/schedules/ScheduleCalendarView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Contexts
import { useScheduleContext } from "@/context/ScheduleContext";
import { useGradeScheduleConfigContext } from "@/context/ScheduleConfigContext";
import { useSectionContext } from "@/context/SectionsContext";
import { useCourseContext } from "@/context/CourseContext";
import { useTeacherContext } from "@/context/TeacherContext";
import { useTheme } from 'next-themes';

// Types
import type { ScheduleChange } from "@/types/schedules.types";
import type { ScheduleFormValues } from "@/types/schedules";

// Interfaces para el componente
interface ContentSchedulesProps {
  className?: string;
}

export default function ContentSchedules({ className = "" }: ContentSchedulesProps) {
  // Theme management
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  // Context hooks
  const scheduleContext = useScheduleContext();
  const gradeConfigContext = useGradeScheduleConfigContext();
  const sectionContext = useSectionContext();
  const courseContext = useCourseContext();
  const teacherContext = useTeacherContext();

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Destructure context functions
  const {
    createSchedule,
    updateSchedule,
    removeSchedule,
    createBatchSchedules,
    refreshSchedules,
    state: scheduleState
  } = scheduleContext;

  const {
    state: gradeConfigState,
    fetchGrades,
    fetchScheduleConfigs
  } = gradeConfigContext;

  const {
    state: sectionState,
    fetchSections
  } = sectionContext;

  const {
    state: courseState,
    fetchCourses
  } = courseContext;

  const {
    state: teacherState,
    fetchAllTeachers: fetchTeachers,
    fetchTeacherAvailability
  } = teacherContext;

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🚀 Inicializando datos...');
        
        await Promise.all([
          fetchGrades(),
          fetchSections(),
          fetchCourses(),
          fetchTeachers(),
          refreshSchedules()
        ]);

        console.log('✅ Datos básicos cargados, cargando disponibilidad...');
        await fetchTeacherAvailability();
        console.log('✅ Disponibilidad cargada');
      } catch (error) {
        console.error('❌ Error initializing data:', error);
        toast.error('Error al cargar datos iniciales');
      }
    };

    initializeData();
  }, [fetchGrades, fetchSections, fetchCourses, fetchTeachers, refreshSchedules, fetchTeacherAvailability]);

  // Data normalization helper
  const normalizeScheduleData = useCallback((data: any): ScheduleFormValues => ({
    sectionId: data.sectionId,
    courseId: data.courseId,
    teacherId: data.teacherId || undefined,
    dayOfWeek: data.dayOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    classroom: data.classroom || undefined,
  }), []);

  // Validation helper
  const validateScheduleData = useCallback((data: Partial<ScheduleFormValues>): boolean => {
    const required = ['sectionId', 'courseId', 'dayOfWeek', 'startTime', 'endTime'];
    return required.every(field => data[field as keyof ScheduleFormValues] !== undefined);
  }, []);

  // Batch save handler
  const handleBatchSave = useCallback(async (changes: ScheduleChange[]) => {
    console.log('🟢 ContentSchedules - handleBatchSave ejecutado con:', changes.length, 'cambios');

    try {
      // Separar por tipo de acción
      const creates = changes.filter(change => change.action === 'create');
      const updates = changes.filter(change => change.action === 'update');
      const deletes = changes.filter(change => change.action === 'delete');

      console.log('🟢 Cambios separados:', {
        creates: creates.length,
        updates: updates.length,
        deletes: deletes.length
      });

      // 1. Procesar eliminaciones primero
      for (const change of deletes) {
        if (typeof change.schedule.id === 'number') {
          console.log('🟢 Eliminando schedule ID:', change.schedule.id);
          await removeSchedule(change.schedule.id);
        }
      }

      // 2. Procesar updates individuales
      for (const change of updates) {
        if (typeof change.schedule.id === 'number') {
          console.log('🟢 Actualizando schedule ID:', change.schedule.id);

          const updateData: Partial<ScheduleFormValues> = {
            sectionId: change.schedule.sectionId,
            courseId: change.schedule.courseId || undefined,
            teacherId: change.schedule.teacherId || undefined,
            dayOfWeek: change.schedule.dayOfWeek,
            startTime: change.schedule.startTime,
            endTime: change.schedule.endTime,
            classroom: change.schedule.classroom || undefined,
          };

          const result = await updateSchedule(change.schedule.id, updateData);

          if (!result.success) {
            throw new Error(result.message || 'Error actualizando schedule');
          }
        }
      }

      // 3. Procesar creaciones con batch
      if (creates.length > 0) {
        const schedulesToSave: ScheduleFormValues[] = creates
          .filter(change => change.schedule.courseId && change.schedule.sectionId)
          .map(change => normalizeScheduleData({
            sectionId: change.schedule.sectionId,
            courseId: change.schedule.courseId!,
            teacherId: change.schedule.teacherId,
            dayOfWeek: change.schedule.dayOfWeek,
            startTime: change.schedule.startTime,
            endTime: change.schedule.endTime,
            classroom: change.schedule.classroom,
          }));

        console.log('🟢 Schedules a crear:', schedulesToSave);

        if (schedulesToSave.length > 0) {
          const result = await createBatchSchedules(schedulesToSave);
          if (!result.success) {
            throw new Error(result.message || 'Error en guardado masivo');
          }
          console.log('🟢 ✅ Batch save exitoso:', result);
        }
      }

      // Refrescar disponibilidad después de cambios
      await fetchTeacherAvailability();

      toast.success(`✅ Cambios guardados exitosamente`);
      return { success: true };

    } catch (error) {
      console.error('🔴 Error en handleBatchSave:', error);
      toast.error('Error al guardar cambios');
      throw error;
    }
  }, [removeSchedule, updateSchedule, createBatchSchedules, normalizeScheduleData, fetchTeacherAvailability]);

  // Individual CRUD handlers
  const handleCreateSchedule = useCallback(async (data: Partial<ScheduleFormValues>) => {
    console.log('🟢 Creando schedule individual:', data);

    if (!validateScheduleData(data)) {
      const error = { success: false, message: 'Datos requeridos faltantes' };
      toast.error(error.message);
      return error;
    }

    const completeData: ScheduleFormValues = normalizeScheduleData(data);
    const result = await createSchedule(completeData);

    if (result.success) {
      toast.success('Horario creado exitosamente');
      await fetchTeacherAvailability();
    } else {
      toast.error(result.message || 'Error al crear horario');
    }

    return result;
  }, [validateScheduleData, normalizeScheduleData, createSchedule, fetchTeacherAvailability]);

  const handleUpdateSchedule = useCallback(async (id: number, data: Partial<ScheduleFormValues>) => {
    console.log('🟢 Actualizando schedule individual:', id, data);

    const normalizedData: Partial<ScheduleFormValues> = {
      ...data,
      teacherId: data.teacherId || undefined,
      classroom: data.classroom || undefined,
    };

    const result = await updateSchedule(id, normalizedData);

    if (result.success) {
      toast.success('Horario actualizado exitosamente');
      await fetchTeacherAvailability();
    } else {
      toast.error(result.message || 'Error al actualizar horario');
    }

    return result;
  }, [updateSchedule, fetchTeacherAvailability]);

  const handleDeleteSchedule = useCallback(async (id: number): Promise<void> => {
    console.log('🟢 Eliminando schedule individual:', id);
    try {
      const result = await removeSchedule(id);
      if (result.success) {
        toast.success('Horario eliminado exitosamente');
        await fetchTeacherAvailability();
      } else {
        toast.error(result.message || 'Error al eliminar horario');
      }
    } catch (error) {
      console.error('Error eliminando schedule:', error);
      toast.error('Error al eliminar horario');
      throw error;
    }
  }, [removeSchedule, fetchTeacherAvailability]);

  // Refresh all data
  const handleRefreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshSchedules(),
        fetchGrades(),
        fetchSections(),
        fetchCourses(),
        fetchTeachers()
      ]);
      
      await fetchTeacherAvailability();
      
      toast.success('Datos actualizados');
    } catch (error) {
      toast.error('Error al actualizar datos');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshSchedules, fetchGrades, fetchSections, fetchCourses, fetchTeachers, fetchTeacherAvailability]);

  // Loading state
  const isLoading = scheduleState.loading ||
    gradeConfigState.loading.general ||
    sectionState.loading ||
    courseState.loading ||
    teacherState.loading;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header simplificado */}
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calendar className="h-5 w-5" />
              Gestión de Horarios
            </CardTitle>

            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                className={`${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Stats summary simplificado */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Horarios</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {scheduleState.schedules.length}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Secciones</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {sectionState.sections.length}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Cursos</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {courseState.courses.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendario principal - Sin pestañas */}
      <ScheduleCalendarView
        onBatchSave={handleBatchSave}
        onCreateSchedule={handleCreateSchedule}
        onUpdateSchedule={handleUpdateSchedule}
        onDeleteSchedule={handleDeleteSchedule}
        className={isDark ? 'dark' : ''}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className={isDark ? 'text-white' : 'text-gray-900'}>
                Cargando datos...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}