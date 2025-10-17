// src/components/schedules/ContentSchedules.tsx 
'use client';

import React, { useCallback } from "react";
import { toast } from 'sonner';
import { Moon, Sun, Calendar, RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';

// Components
import { ScheduleCalendarView } from "@/components/schedules/ScheduleCalendarView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedContent from '@/components/common/ProtectedContent';

// Hooks
import { useSchedule } from '@/hooks/useSchedule';
import { useAuth } from '@/context/AuthContext';

// Types
import type { ScheduleChange } from "@/types/schedules.types";
import type { ScheduleFormValues } from '@/types/schedules';

interface ContentSchedulesProps {
  className?: string;
}

export default function ContentSchedules({ className = "" }: ContentSchedulesProps) {
  // ✅ CRÍTICO: TODOS los hooks DEBEN estar ANTES de cualquier return condicional

  // Theme management
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  // Auth & Permissions
  const { hasPermission } = useAuth();
  const canRead = hasPermission('schedule', 'read');
  const canCreate = hasPermission('schedule', 'create');
  const canUpdate = hasPermission('schedule', 'update');
  const canDelete = hasPermission('schedule', 'delete');
  const canBatchCreate = hasPermission('schedule', 'batch-create');

  // ✅ Hook principal - DEBE estar antes de cualquier return
  const {
    formData,
    schedules,
    teacherAvailability,
    isLoading,
    isLoadingFormData,
    isSubmitting,
    error,
    loadFormData,
    loadAvailability,
    createScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    batchSave,
    clearError
  } = useSchedule({
    autoLoadFormData: true,
    autoLoadAvailability: true,
    onSuccess: (message) => toast.success(message),
    onError: (error) => toast.error("custom error: " + error)
  });

  console.log("form data ", formData)

  // ✅ Todos los callbacks DESPUÉS de todos los hooks
  const normalizeScheduleData = useCallback((data: any): ScheduleFormValues => ({
    sectionId: data.sectionId,
    courseId: data.courseId,
    teacherId: data.teacherId || undefined,
    dayOfWeek: data.dayOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    classroom: data.classroom || undefined,
  }), []);

  const validateScheduleData = useCallback((data: Partial<ScheduleFormValues>): boolean => {
    const required = ['sectionId', 'courseId', 'dayOfWeek', 'startTime', 'endTime'];
    return required.every(field => data[field as keyof ScheduleFormValues] !== undefined);
  }, []);

  const handleBatchSave = useCallback(async (changes: ScheduleChange[]) => {
    if (!canBatchCreate) {
      toast.error('No tienes permisos para guardar cambios masivos');
      return { success: false };
    }

    console.log('🟢 handleBatchSave con:', changes.length, 'cambios');

    try {
      const creates = changes.filter(change => change.action === 'create');
      const updates = changes.filter(change => change.action === 'update');
      const deletes = changes.filter(change => change.action === 'delete');

      if (canDelete) {
        for (const change of deletes) {
          if (typeof change.schedule.id === 'number') {
            await deleteScheduleItem(change.schedule.id);
          }
        }
      }

      if (canUpdate) {
        for (const change of updates) {
          if (typeof change.schedule.id === 'number') {
            const updateData: Partial<ScheduleFormValues> = {
              sectionId: change.schedule.sectionId,
              courseId: change.schedule.courseId || undefined,
              teacherId: change.schedule.teacherId || undefined,
              dayOfWeek: change.schedule.dayOfWeek,
              startTime: change.schedule.startTime,
              endTime: change.schedule.endTime,
              classroom: change.schedule.classroom || undefined,
            };
            await updateScheduleItem(change.schedule.id, updateData);
          }
        }
      }

      if (creates.length > 0 && canBatchCreate) {
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

        if (schedulesToSave.length > 0) {
          await batchSave(schedulesToSave);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('🔴 Error en handleBatchSave:', error);
      return { success: false };
    }
  }, [canBatchCreate, canUpdate, canDelete, deleteScheduleItem, updateScheduleItem, batchSave, normalizeScheduleData]);

  const handleCreateSchedule = useCallback(async (data: Partial<ScheduleFormValues>) => {
    if (!canCreate) {
      toast.error('No tienes permisos para crear horarios');
      return { success: false, message: 'Sin permisos' };
    }

    if (!validateScheduleData(data)) {
      toast.error('Datos requeridos faltantes');
      return { success: false, message: 'Datos requeridos faltantes' };
    }

    const completeData: ScheduleFormValues = normalizeScheduleData(data);
    const result = await createScheduleItem(completeData);

    return { success: !!result, data: result };
  }, [canCreate, validateScheduleData, normalizeScheduleData, createScheduleItem]);

  const handleUpdateSchedule = useCallback(async (id: number, data: Partial<ScheduleFormValues>) => {
    if (!canUpdate) {
      toast.error('No tienes permisos para actualizar horarios');
      return { success: false, message: 'Sin permisos' };
    }

    const normalizedData: Partial<ScheduleFormValues> = {
      ...data,
      teacherId: data.teacherId || undefined,
      classroom: data.classroom || undefined,
    };

    const result = await updateScheduleItem(id, normalizedData);
    return { success: !!result, data: result };
  }, [canUpdate, updateScheduleItem]);

  const handleDeleteSchedule = useCallback(async (id: number): Promise<void> => {
    if (!canDelete) {
      toast.error('No tienes permisos para eliminar horarios');
      return;
    }
    await deleteScheduleItem(id);
  }, [canDelete, deleteScheduleItem]);

  const handleRefreshAll = useCallback(async () => {
    try {
      await Promise.all([
        loadFormData(),
        loadAvailability()
      ]);
      toast.success('Datos actualizados');
    } catch (error) {
      toast.error('Error al actualizar datos');
    }
  }, [loadFormData, loadAvailability]);

  // ✅ AHORA SÍ: Returns condicionales DESPUÉS de todos los hooks

  // Check permissions
  if (!canRead) {
    return (
      <ProtectedContent
        requiredPermission={{ module: 'schedule', action: 'read' }}
      >
        <></>
      </ProtectedContent>);
  }

  // Loading state
  if (isLoadingFormData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className={isDark ? 'text-white' : 'text-gray-900'}>
              Cargando datos...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // No active cycle
  if (!formData?.activeCycle) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No hay ciclo escolar activo. Configure un ciclo antes de gestionar horarios.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ✅ Render principal
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calendar className="h-5 w-5" />
              Gestión de Horarios
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={isLoading}
                className={`${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Horarios</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {schedules.length}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Secciones</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formData?.grades.reduce((acc, grade) => acc + grade.sections.length, 0) || 0}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Cursos</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formData?.grades.reduce((acc, grade) => acc + grade.courses.length, 0) || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendario principal */}
      <ScheduleCalendarView
        onBatchSave={handleBatchSave}
        onCreateSchedule={handleCreateSchedule}
        onUpdateSchedule={handleUpdateSchedule}
        onDeleteSchedule={handleDeleteSchedule}
        className={isDark ? 'dark' : ''}
      />

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className={isDark ? 'text-white' : 'text-gray-900'}>
                Guardando cambios...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}