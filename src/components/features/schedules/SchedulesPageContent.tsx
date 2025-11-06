'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Calendar, RefreshCw, Sun, Moon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProtectedContent from '@/components/common/ProtectedContent';

import { useSchedules } from '@/hooks/useSchedules';
import { usePermissions } from '@/hooks/usePermissions';

// Import calendar components
import { ScheduleHeader } from './calendar/ScheduleHeader';
import { ScheduleSidebar } from './calendar/ScheduleSidebar';
import { ScheduleGrid } from './calendar/ScheduleGrid';
import { ScheduleConfigModal } from './calendar/ScheduleConfigModal';

import type { ScheduleChange, TempSchedule, TimeSlot, ScheduleConfig, CourseAssignment, DayOfWeek, DragItem } from '@/types/schedules.types';
import { DEFAULT_TIME_SLOTS, ScheduleTimeGenerator } from '@/types/schedules.types';

/**
 * PASO 4: Main schedules page component with calendar integration
 * 
 * This component orchestrates the schedules module:
 * - Displays interactive schedule calendar
 * - Handles permission checks
 * - Uses courseAssignmentId as primary identifier (no separate course/teacher selectors)
 * 
 * Architecture: Uses unified useSchedules hook + schedulesService
 * Primary identifier: courseAssignmentId
 */
export default function SchedulesPageContent({
  className = '',
}: {
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  // Permission checks
  const { hasPermission } = usePermissions();
  const canRead = hasPermission('schedule', 'read');
  const canCreate = hasPermission('schedule', 'create');
  const canUpdate = hasPermission('schedule', 'update');
  const canDelete = hasPermission('schedule', 'delete');

  // State
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [tempSchedules, setTempSchedules] = useState<TempSchedule[]>([]);
  const [pendingChanges, setPendingChanges] = useState<ScheduleChange[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // New unified hook
  const {
    schedules,
    formData,
    isLoadingFormData,
    isLoading,
    error,
    clearError,
    loadSchedulesBySection,
    createScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    batchSave,
    loadConfig,
    config,
    createConfig,
    updateConfig,
  } = useSchedules();

  // ✅ Handle refresh
  const handleRefreshAll = async () => {
    try {
      if (selectedSection > 0) {
        await loadSchedulesBySection(selectedSection);
        toast.success('Datos actualizados');
      }
    } catch (err) {
      toast.error('Error al actualizar datos');
      console.error('Refresh error:', err);
    }
  };

  // Load schedules when section changes
  useEffect(() => {
    if (selectedSection > 0) {
      loadSchedulesBySection(selectedSection);
      loadConfig(selectedSection);
    }
  }, [selectedSection, loadSchedulesBySection, loadConfig]);

  // Extract sections from formData
  const sections = useMemo(() => {
    if (!formData?.sections) return [];
    return formData.sections.map(section => ({
      id: section.id,
      name: section.name,
    }));
  }, [formData?.sections]);

  // Extract courseAssignments for selected section
  const courseAssignments = useMemo((): CourseAssignment[] => {
    if (!formData?.courseAssignments || selectedSection === 0) return [];
    
    // Filter by selected section and map to CourseAssignment type
    return formData.courseAssignments
      .filter(ca => ca.sectionId === selectedSection)
      .map(ca => ({
        id: ca.id,
        sectionId: ca.sectionId,
        courseId: ca.courseId,
        teacherId: ca.teacherId,
        assignmentType: ca.assignmentType,
        createdAt: ca.createdAt,
        updatedAt: ca.updatedAt,
        course: ca.course,
        teacher: ca.teacher,
      }));
  }, [formData?.courseAssignments, selectedSection]);

  // Generate time slots from config or use defaults
  const timeSlots = useMemo((): TimeSlot[] => {
    if (!config || selectedSection === 0) {
      return DEFAULT_TIME_SLOTS;
    }

    try {
      return ScheduleTimeGenerator.generateTimeSlots(config);
    } catch (error) {
      console.error('Error generating time slots:', error);
      return DEFAULT_TIME_SLOTS;
    }
  }, [config, selectedSection]);

  // Calculate assignment hours (how many hours each assignment has been scheduled)
  const assignmentHours = useMemo(() => {
    const hours: { [key: number]: number } = {};
    
    [...schedules, ...tempSchedules].forEach(schedule => {
      if (schedule.courseAssignmentId) {
        const key = schedule.courseAssignmentId;
        if (!hours[key]) hours[key] = 0;
        
        // Calculate duration in hours (simplified)
        const start = schedule.startTime.split(':');
        const end = schedule.endTime.split(':');
        const duration = (parseInt(end[0]) * 60 + parseInt(end[1]) - 
                         (parseInt(start[0]) * 60 + parseInt(start[1]))) / 60;
        hours[key] += duration;
      }
    });
    
    return hours;
  }, [schedules, tempSchedules]);

  // Handlers for schedule operations
  const handleBatchSave = useCallback(async (changes: ScheduleChange[]) => {
    if (!canCreate && !canUpdate && !canDelete) {
      toast.error('No tienes permisos para guardar cambios');
      return { success: false };
    }

    setIsSaving(true);
    try {
      // Process deletes
      const deletes = changes.filter(c => c.action === 'delete');
      for (const change of deletes) {
        if (canDelete && typeof change.schedule.id === 'number') {
          await deleteScheduleItem(change.schedule.id);
        }
      }

      // Process updates
      const updates = changes.filter(c => c.action === 'update');
      for (const change of updates) {
        if (canUpdate && typeof change.schedule.id === 'number') {
          await updateScheduleItem(change.schedule.id, {
            courseAssignmentId: change.schedule.courseAssignmentId!,
            dayOfWeek: change.schedule.dayOfWeek,
            startTime: change.schedule.startTime,
            endTime: change.schedule.endTime,
            classroom: change.schedule.classroom || undefined,
          });
        }
      }

      // Process creates
      const creates = changes.filter(c => c.action === 'create');
      if (creates.length > 0 && canCreate) {
        const schedulesToCreate = creates.map(change => ({
          courseAssignmentId: change.schedule.courseAssignmentId!,
          dayOfWeek: change.schedule.dayOfWeek,
          startTime: change.schedule.startTime,
          endTime: change.schedule.endTime,
          classroom: change.schedule.classroom || undefined,
        }));
        
        await batchSave(schedulesToCreate);
      }

      // Clear temp schedules and pending changes
      setTempSchedules([]);
      setPendingChanges([]);
      
      toast.success('Cambios guardados exitosamente');
      return { success: true };
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Error al guardar cambios');
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  }, [canCreate, canUpdate, canDelete, deleteScheduleItem, updateScheduleItem, batchSave]);

  const handleSectionChange = useCallback((value: string) => {
    const newSectionId = parseInt(value);
    
    if (pendingChanges.length > 0) {
      if (confirm('Tienes cambios sin guardar. ¿Deseas descartarlos?')) {
        setTempSchedules([]);
        setPendingChanges([]);
        setSelectedSection(newSectionId);
      }
    } else {
      setSelectedSection(newSectionId);
    }
  }, [pendingChanges]);

  const handleDiscardChanges = useCallback(() => {
    setTempSchedules([]);
    setPendingChanges([]);
    toast.info('Cambios descartados');
  }, []);

  // Handle drag & drop from sidebar to grid
  const handleDrop = useCallback((item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => {
    if (item.type !== 'courseAssignment') return;
    if (!selectedSection || selectedSection === 0) return;

    console.log('🎯 Drop:', { item, day, timeSlot });

    // Find the course assignment
    const assignment = courseAssignments.find(ca => ca.id === item.id);
    if (!assignment) {
      toast.error('Asignación no encontrada');
      return;
    }

    // Check if there's already a schedule in this slot
    const key = `${day}-${timeSlot.start}`;
    const existingSchedules = [...schedules, ...tempSchedules].filter(
      s => s.dayOfWeek === day && s.startTime === timeSlot.start
    );

    if (existingSchedules.length > 0) {
      const existingCourse = existingSchedules[0];
      const courseName = existingCourse.courseAssignmentId 
        ? courseAssignments.find(ca => ca.id === existingCourse.courseAssignmentId)?.course?.name || 'Curso'
        : 'Curso';
      
      toast.error(`Ya hay una clase programada en este horario: ${courseName}`, {
        description: 'Elimina la clase existente o elige otro horario',
        duration: 4000,
      });
      return;
    }

    // Check if the same assignment is already scheduled at this exact time
    const duplicateSchedule = [...schedules, ...tempSchedules].find(
      s => s.courseAssignmentId === assignment.id && 
           s.dayOfWeek === day && 
           s.startTime === timeSlot.start
    );

    if (duplicateSchedule) {
      toast.error(`Este curso ya está programado en este horario`, {
        duration: 3000,
      });
      return;
    }

    // Create a new temp schedule
    const newTempSchedule: TempSchedule = {
      id: `temp_${Date.now()}`,
      courseAssignmentId: assignment.id,
      teacherId: assignment.teacherId,
      sectionId: selectedSection,
      dayOfWeek: day,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      classroom: undefined,
      isPending: true,
    };

    // Add to temp schedules
    setTempSchedules(prev => [...prev, newTempSchedule]);

    // Add to pending changes
    const change: ScheduleChange = {
      action: 'create',
      schedule: newTempSchedule,
    };
    setPendingChanges(prev => [...prev, change]);

    toast.success(`${assignment.course?.name || 'Curso'} agregado`, {
      description: `${timeSlot.start}-${timeSlot.end}`,
    });
  }, [selectedSection, courseAssignments, schedules, tempSchedules]);

  // Handle config save
  const handleConfigSave = useCallback(async (configData: ScheduleConfig) => {
    if (!selectedSection || selectedSection === 0) return;

    try {
      setIsSaving(true);
      
      if (config?.id) {
        // Update existing config
        const result = await updateConfig(config.id, {
          workingDays: configData.workingDays,
          startTime: configData.startTime,
          endTime: configData.endTime,
          classDuration: configData.classDuration,
          breakSlots: configData.breakSlots,
        });
        
        if (result) {
          toast.success('Configuración actualizada');
          // Reload config
          await loadConfig(selectedSection);
          setShowConfigModal(false);
        }
      } else {
        // Create new config
        const result = await createConfig({
          sectionId: selectedSection,
          workingDays: configData.workingDays,
          startTime: configData.startTime,
          endTime: configData.endTime,
          classDuration: configData.classDuration,
          breakSlots: configData.breakSlots,
        });
        
        if (result) {
          toast.success('Configuración creada');
          // Reload config
          await loadConfig(selectedSection);
          setShowConfigModal(false);
        }
      }
    } catch (error: any) {
      console.error('Error saving config:', error);
      
      // Show detailed error message
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        // Show main error message
        toast.error(errorData.message || 'Error al guardar configuración');
        
        // Show detailed errors if available
        if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
          errorData.details.forEach((detail: string, index: number) => {
            setTimeout(() => {
              toast.error(detail, { duration: 5000 });
            }, index * 100);
          });
        }
        
        // Show field errors if available
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorData.errors.forEach((err: any, index: number) => {
            setTimeout(() => {
              toast.error(`${err.field}: ${err.message}`, { duration: 5000 });
            }, index * 100);
          });
        }
      } else {
        toast.error('Error al guardar configuración');
      }
    } finally {
      setIsSaving(false);
    }
  }, [selectedSection, config, updateConfig, createConfig, loadConfig]);

  const hasUnsavedChanges = pendingChanges.length > 0;

  // Compute stats
  const stats = {
    totalSchedules: schedules.length,
    totalSections: sections.length,
    totalAssignments: courseAssignments.length,
  };

  // ✅ Check permissions
  if (!canRead) {
    return (
      <ProtectedContent
        requiredPermission={{ module: 'schedule', action: 'read' }}
      >
        <></>
      </ProtectedContent>
    );
  }

  // ✅ Loading state
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

  // ✅ No active cycle
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
        <Card className={`border-2 shadow-lg ${
          isDark 
            ? 'border-red-800 bg-red-950/50' 
            : 'border-red-200 bg-red-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <AlertCircle className={`h-5 w-5 flex-shrink-0 ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`} />
                <p className={`text-sm ${
                  isDark ? 'text-red-200' : 'text-red-800'
                }`}>
                  {error}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearError}
                className={isDark ? 'hover:bg-red-900/50' : 'hover:bg-red-100'}
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header with stats */}
      <Card className={`shadow-lg ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700' 
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
      }`}>
        <CardHeader className={`border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-blue-900/50' : 'bg-blue-100'
              }`}>
                <Calendar className={`h-5 w-5 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Gestión de Horarios</h1>
                <p className={`text-sm font-normal ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Sistema de programación académica
                </p>
              </div>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={isLoading}
                className={`flex items-center gap-2 ${
                  isDark 
                    ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-750' : 'bg-gray-50'
            }`}>
              <div className={`text-sm mb-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Horarios
              </div>
              <div className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.totalSchedules}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-750' : 'bg-gray-50'
            }`}>
              <div className={`text-sm mb-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Secciones
              </div>
              <div className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.totalSections}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-750' : 'bg-gray-50'
            }`}>
              <div className={`text-sm mb-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Asignaciones
              </div>
              <div className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.totalAssignments}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDark 
                ? hasUnsavedChanges 
                  ? 'bg-orange-900/30 border-2 border-orange-800' 
                  : 'bg-gray-750'
                : hasUnsavedChanges 
                  ? 'bg-orange-50 border-2 border-orange-200' 
                  : 'bg-gray-50'
            }`}>
              <div className={`text-sm mb-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Cambios Pendientes
              </div>
              <div className={`text-2xl font-bold ${
                hasUnsavedChanges
                  ? isDark ? 'text-orange-400' : 'text-orange-600'
                  : isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {pendingChanges.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Calendar View */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Calendar Grid */}
        <div className="flex-1 space-y-4">
          <ScheduleHeader
            selectedSection={selectedSection}
            sections={sections}
            totalSchedules={schedules.length}
            pendingChanges={pendingChanges.length}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            currentConfig={config}
            onSectionChange={handleSectionChange}
            onSaveAll={() => handleBatchSave(pendingChanges)}
            onDiscardChanges={handleDiscardChanges}
            onConfigSave={handleConfigSave}
          />

          {selectedSection > 0 ? (
            <ScheduleGrid
              schedules={schedules}
              tempSchedules={tempSchedules}
              timeSlots={timeSlots}
              workingDays={config?.workingDays || [1, 2, 3, 4, 5]}
              courseAssignments={courseAssignments}
              onDrop={handleDrop}
              onScheduleUpdate={(updatedTemp: TempSchedule[], changes: ScheduleChange[]) => {
                setTempSchedules(updatedTemp);
                setPendingChanges(prev => [...prev, ...changes]);
              }}
              onScheduleClick={(schedule) => {
                console.log('Schedule clicked:', schedule);
                // TODO: Open edit modal
              }}
              canEdit={canUpdate}
              canDelete={canDelete}
            />
          ) : (
            <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-12 text-center">
                <Calendar className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Selecciona una sección para ver y gestionar su horario
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar with Course Assignments */}
        {selectedSection > 0 && (
          <div className="w-full lg:w-80 xl:w-96">
            <ScheduleSidebar
              courseAssignments={courseAssignments}
              assignmentHours={assignmentHours}
              pendingChanges={pendingChanges}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </div>
        )}
      </div>

      {/* Loading overlay for save operations */}
      {isSaving && (
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

      {/* Schedule Config Modal */}
      {selectedSection > 0 && (
        <ScheduleConfigModal
          isOpen={showConfigModal}
          sectionId={selectedSection}
          sectionName={sections.find(s => s.id === selectedSection)?.name || ''}
          currentConfig={config}
          onSave={handleConfigSave}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  );
}
