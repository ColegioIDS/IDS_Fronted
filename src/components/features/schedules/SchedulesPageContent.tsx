'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, RefreshCw, AlertCircle, CalendarDays, BookOpen, Home, Settings, Zap, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import ProtectedContent from '@/components/common/ProtectedContent';

import { useSchedules } from '@/hooks/useSchedules';
import { usePermissions } from '@/hooks/usePermissions';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

// Import calendar components
import { ScheduleHeader } from './calendar/ScheduleHeader';
import { ScheduleSidebar } from './calendar/ScheduleSidebar';
import { ScheduleGrid } from './calendar/ScheduleGrid';
import { ScheduleConfigModal } from './calendar/ScheduleConfigModal';
import { ConfigurationChangeModal } from './modals/ConfigurationChangeModal';
import { DeleteScheduleDialog } from './modals/DeleteScheduleDialog';

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

interface SchedulesPageContentProps {
  className?: string;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canConfigure?: boolean;
}

export default function SchedulesPageContent({
  className = '',
  canView = true,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  canConfigure = true,
}: SchedulesPageContentProps = {}) {
  // Permission checks
  const { hasPermission } = usePermissions();
  const canReadLocal = hasPermission('schedule', 'read');
  const canCreateLocal = canCreate && hasPermission('schedule', 'create');
  const canUpdateLocal = canEdit && hasPermission('schedule', 'update');
  const canDeleteLocal = canDelete && hasPermission('schedule', 'delete');
  const canConfigureLocal = canConfigure && hasPermission('schedule', 'configure');
  
  // Schedule Config permissions
  const canCreateScheduleConfig = hasPermission(
    MODULES_PERMISSIONS.SCHEDULE_CONFIG.CREATE.module,
    MODULES_PERMISSIONS.SCHEDULE_CONFIG.CREATE.action
  );

  // State
  const [selectedCycle, setSelectedCycle] = useState<number>(0);
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [tempSchedules, setTempSchedules] = useState<TempSchedule[]>([]);
  const [pendingChanges, setPendingChanges] = useState<ScheduleChange[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [operationErrors, setOperationErrors] = useState<Array<{ itemId: string | number; error: string }>>([]);
  const [showConfigChangeModal, setShowConfigChangeModal] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    schedule: TempSchedule | any;
    isOpen: boolean;
  }>({ schedule: null, isOpen: false });
  const [isDeleting, setIsDeleting] = useState(false);

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
    loadFormData,
    validateConfigurationChange,
    deleteInvalidSchedules,
    adjustInvalidSchedules,
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
    }
  };

  // Load schedules when section changes
  useEffect(() => {
    if (selectedSection > 0) {
      loadSchedulesBySection(selectedSection);
      loadConfig(selectedSection);
    }
  }, [selectedSection, loadSchedulesBySection, loadConfig]);

  // Reset section when grade changes
  useEffect(() => {
    setSelectedSection(0);
  }, [selectedGrade]);

  // Extract sections from formData
  const sections = useMemo(() => {
    if (!formData?.sections) return [];
    return formData.sections.map(section => ({
      id: section.id,
      name: section.name,
    }));
  }, [formData?.sections]);

  // Extract cycles from formData
  const cycles = useMemo(() => {
    if (!formData?.cycles) return [];
    return formData.cycles;
  }, [formData?.cycles]);

  // Extract and filter grades by selected cycle
  const gradesForCycle = useMemo(() => {
    if (!formData?.cycles || !formData?.gradeCycles || !formData?.grades || selectedCycle === 0) return [];
    
    // Find all gradeIds that belong to this cycle
    const gradeIds = formData.gradeCycles
      .filter(gc => gc.cycleId === selectedCycle)
      .map(gc => gc.gradeId);
    
    // Return grades that match these IDs
    return formData.grades.filter(g => gradeIds.includes(g.id));
  }, [formData, selectedCycle]);

  // Filter sections by selected grade
  const filteredSections = useMemo(() => {
    if (!formData?.sections || selectedGrade === 0) return [];
    return formData.sections
      .filter(section => section.gradeId === selectedGrade)
      .map(section => ({
        id: section.id,
        name: section.name,
      }));
  }, [formData?.sections, selectedGrade]);

  // Extract courseAssignments for selected section from nested structure
  const courseAssignments = useMemo((): CourseAssignment[] => {
    if (!formData?.sections || selectedSection === 0) return [];
    
    // Get the selected section
    const selectedSectionData = formData.sections.find(s => s.id === selectedSection);
    
    // Return nested courseAssignments or empty array
    return selectedSectionData?.courseAssignments ?? [];
  }, [formData?.sections, selectedSection]);

  // Generate time slots from config or use defaults
  const timeSlots = useMemo((): TimeSlot[] => {
    if (!config || selectedSection === 0) {
      return DEFAULT_TIME_SLOTS;
    }

    try {
      return ScheduleTimeGenerator.generateTimeSlots(config);
    } catch (error) {
      return DEFAULT_TIME_SLOTS;
    }
  }, [config, selectedSection]);

  // Calculate assignment hours (how many hours each assignment has been scheduled)
  const assignmentHours = useMemo(() => {
    const hours: { [key: number]: number } = {};
    
    [...schedules, ...tempSchedules]
      .filter((schedule): schedule is typeof schedules[0] => schedule !== undefined && schedule !== null)
      .forEach(schedule => {
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
    if (!canCreateLocal && !canUpdateLocal && !canDeleteLocal) {
      toast.error('No tienes permisos para guardar cambios');
      return { success: false };
    }

    setIsSaving(true);
    try {
      let hasErrors = false;
      const operationResults = {
        deleted: 0,
        updated: 0,
        created: 0,
      };

      // Process deletes
      const deletes = changes.filter(c => c.action === 'delete');
      for (const change of deletes) {
        if (canDeleteLocal && typeof change.schedule.id === 'number') {
          try {
            await deleteScheduleItem(change.schedule.id);
            operationResults.deleted++;
          } catch (err) {
            hasErrors = true;
          }
        }
      }

      // Process updates
      const updates = changes.filter(c => c.action === 'update');
      for (const change of updates) {
        if (canUpdateLocal && typeof change.schedule.id === 'number') {
          try {
            await updateScheduleItem(change.schedule.id, {
              courseAssignmentId: change.schedule.courseAssignmentId!,
              dayOfWeek: change.schedule.dayOfWeek,
              startTime: change.schedule.startTime,
              endTime: change.schedule.endTime,
              classroom: change.schedule.classroom || undefined,
            });
            operationResults.updated++;
          } catch (err) {
            hasErrors = true;
          }
        }
      }

      // Process creates
      const creates = changes.filter(c => c.action === 'create');
      let batchResult = null;
      let batchError: any = null;
      
      if (creates.length > 0 && canCreateLocal) {
        const schedulesToCreate = creates.map(change => ({
          courseAssignmentId: change.schedule.courseAssignmentId!,
          dayOfWeek: change.schedule.dayOfWeek,
          startTime: change.schedule.startTime,
          endTime: change.schedule.endTime,
          classroom: change.schedule.classroom || undefined,
        }));

        
        try {
          batchResult = await batchSave(schedulesToCreate);

          
          // Ensure batchResult has the expected structure
          if (!batchResult) {
            hasErrors = true;
          } else if (!batchResult.data) {
            // Fallback: if batchResult IS the data (not wrapped), treat it specially
            if ((batchResult as any).stats && (batchResult as any).items) {
              batchResult = {
                success: false,
                message: 'Operación completada',
                data: batchResult as any
              };
            }
          }
          
          // Check batch result for errors (new structure with stats and items)
          if (batchResult && !batchResult.success) {
            const stats = batchResult.data?.stats;
            if (stats && stats.errors > 0) {
              hasErrors = true;
              operationResults.created = stats.created;
              operationResults.updated = stats.updated;
              operationResults.deleted = stats.deleted;
            }
          } else if (batchResult) {
            const stats = batchResult.data?.stats;
            operationResults.created = stats?.created || 0;
            operationResults.updated = stats?.updated || 0;
            operationResults.deleted = stats?.deleted || 0;
          }
        } catch (error: any) {
          hasErrors = true;
          batchError = error;
        }
      }

      // Clear temp schedules and pending changes
      setTempSchedules([]);
      setPendingChanges([]);
      
     
      
      // Show appropriate toast based on results
      if (hasErrors || (batchResult && !batchResult.success)) {
        // Extract errors from new structure
        let errors = batchResult?.data?.items?.errors || [];
        const batchStats = batchResult?.data?.stats ?? { created: 0, updated: 0, deleted: 0, errors: 0 };
        
       
        
        // If no errors found in the expected location, check if backend sent them differently
        if (!errors || errors.length === 0) {
          // Maybe the backend is returning errors in a different format
          if (batchResult?.data && typeof batchResult.data === 'object') {
          }
        }
        
        // Store errors to display in UI
        if (errors.length > 0) {
          setOperationErrors(errors.map((err: any) => ({
            itemId: err.itemId,
            error: err.error,
          })));
        }
        
        // Handle different error scenarios
        
        // Scenario 1: Batch error (network/connection issue, not validation errors)
        if (batchError && !errors.length) {
          const errorMessage = batchError.message || 'Error al guardar horarios';
          const errorDetails = batchError.details || [];
          
          toast.error(errorMessage, {
            description: errorDetails.length > 0 ? errorDetails[0] : 'Operación completada con errores',
            duration: 6000,
          });
          
          // Show additional details if available
          if (errorDetails.length > 1) {
            errorDetails.slice(1).forEach((detail: string, index: number) => {
              setTimeout(() => {
                toast.error(detail, { duration: 5000 });
              }, (index + 1) * 200);
            });
          }
        }
        // Scenario 2: Validation errors from backend (errors in items)
        else if (errors.length > 0) {
          // Show all errors clearly with their details
          
          errors.forEach((err: any, errorIndex: number) => {
            // Determine delay for sequential display
            const baseDelay = errorIndex * 400; // Increased delay for better visibility
            
            // Main error message
            
            const errorDescription = err.details && err.details.length > 0 
              ? err.details[0] 
              : (err.itemId ? `ID: ${err.itemId}` : 'Error de validación');
            
            setTimeout(() => {
              toast.error(err.error, {
                description: errorDescription,
                duration: 6000,
              });
            }, baseDelay);
            
            // Show each detail of this error (starting from second detail)
            if (err.details && err.details.length > 1) {
              err.details.slice(1).forEach((detail: string, detailIndex: number) => {
                setTimeout(() => {
                  toast.info(detail, { duration: 5000 });
                }, baseDelay + (detailIndex + 1) * 250);
              });
            }
          });
        } else {
          toast.error('Operación completada con errores', {
            duration: 5000,
          });
        }
        
        return { success: false };
      }
      
      // Clear errors on success
      setOperationErrors([]);
      
      // Show success toast only if no errors
      if (batchResult?.data?.stats?.created || batchResult?.data?.stats?.updated || batchResult?.data?.stats?.deleted) {
        const stats = batchResult.data.stats;
        const message = [
          stats.created ? `${stats.created} creado${stats.created > 1 ? 's' : ''}` : null,
          stats.updated ? `${stats.updated} actualizado${stats.updated > 1 ? 's' : ''}` : null,
          stats.deleted ? `${stats.deleted} eliminado${stats.deleted > 1 ? 's' : ''}` : null,
        ]
          .filter(Boolean)
          .join(', ');
        
        toast.success(`Cambios guardados exitosamente: ${message}`);
      }
      
      return { success: true };
    } catch (error: any) {
      
      const errorMessage = error?.message || 'Error al guardar cambios';
      const errorDetails = error?.details || [];
      
      toast.error(errorMessage, {
        description: errorDetails.length > 0 ? errorDetails[0] : 'Intenta de nuevo',
        duration: 5000,
      });
      
      // Show additional details if available
      if (errorDetails.length > 1) {
        errorDetails.slice(1).forEach((detail: string, index: number) => {
          setTimeout(() => {
            toast.error(detail, { duration: 5000 });
          }, (index + 1) * 200);
        });
      }
      
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  }, [canCreateLocal, canUpdateLocal, canDeleteLocal, deleteScheduleItem, updateScheduleItem, batchSave]);

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

      const oldConfig = config;

      if (config?.id) {
        // Update existing config - validate changes first
        const newConfigData: ScheduleConfig = {
          ...config,
          workingDays: configData.workingDays,
          startTime: configData.startTime,
          endTime: configData.endTime,
          classDuration: configData.classDuration,
          breakSlots: configData.breakSlots,
        };

        // Validate against existing schedules
        if (oldConfig && oldConfig.id === config.id) {
          const validation = await validateConfigurationChange(oldConfig, newConfigData);

          if (validation && !validation.isValid) {
            setValidationResult(validation);
            setShowConfigChangeModal(true);
            setIsSaving(false);
            return;
          }
        }

        // If validation passed or no conflicts, save the config
        const result = await updateConfig(config.id, {
          workingDays: configData.workingDays,
          startTime: configData.startTime,
          endTime: configData.endTime,
          classDuration: configData.classDuration,
          breakSlots: configData.breakSlots,
        });

        if (result) {
          toast.success('Configuración actualizada exitosamente');
          await loadConfig(selectedSection);
          await loadFormData();
          setShowConfigModal(false);
        }
      } else {
        // Create new config - no validation needed yet
        const result = await createConfig({
          sectionId: selectedSection,
          workingDays: configData.workingDays,
          startTime: configData.startTime,
          endTime: configData.endTime,
          classDuration: configData.classDuration,
          breakSlots: configData.breakSlots,
        });

        if (result) {
          toast.success('Configuración creada exitosamente');
          await loadConfig(selectedSection);
          await loadFormData();
          setShowConfigModal(false);
        }
      }
    } catch (error: any) {

      const errorMessage = error?.message || 'Error al guardar configuración';
      const errorDetails = error?.details || error?.response?.data?.details || [];

      toast.error(errorMessage, {
        description: errorDetails.length > 0 ? errorDetails[0] : undefined,
        duration: 5000,
      });

      if (errorDetails.length > 1) {
        errorDetails.slice(1).forEach((detail: string, index: number) => {
          setTimeout(() => {
            toast.error(detail, { duration: 5000 });
          }, (index + 1) * 200);
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [config, selectedSection, updateConfig, createConfig, loadConfig, loadFormData, validateConfigurationChange]);

  const handleConfigChangeApplyAndDelete = useCallback(async () => {
    if (!validationResult) return;
    try {
      const scheduleIds = validationResult.affectedSchedules.map((s: any) => s.id);
      await deleteInvalidSchedules(scheduleIds);
      setShowConfigChangeModal(false);
      setValidationResult(null);
      
      // Refresh schedules
      await loadSchedulesBySection(selectedSection);
      toast.success('Cambios aplicados y horarios inválidos eliminados');
    } catch (error) {
      toast.error('Error al procesar cambios');
    }
  }, [validationResult, deleteInvalidSchedules, selectedSection, loadSchedulesBySection]);

  const handleConfigChangeApplyAndAdjust = useCallback(async () => {
    if (!validationResult || !config) return;
    try {
      const oldConfig = config;
      const newConfig: ScheduleConfig = {
        ...config,
        ...validationResult.changesSummary.newValues,
      };
      
      await adjustInvalidSchedules(oldConfig, newConfig);
      setShowConfigChangeModal(false);
      setValidationResult(null);
      
      // Actually save the config now that issues are resolved
      const result = await updateConfig(config.id, {
        workingDays: newConfig.workingDays,
        startTime: newConfig.startTime,
        endTime: newConfig.endTime,
        classDuration: newConfig.classDuration,
        breakSlots: newConfig.breakSlots,
      });
      
      if (result) {
        await loadConfig(selectedSection);
        await loadFormData();
        setShowConfigModal(false);
        toast.success('Configuración actualizada y horarios ajustados');
      }
    } catch (error) {
      toast.error('Error al ajustar horarios');
    }
  }, [validationResult, config, adjustInvalidSchedules, updateConfig, loadConfig, selectedSection, loadFormData]);

  const handleConfigChangeCancel = useCallback(() => {
    setShowConfigChangeModal(false);
    setValidationResult(null);
  }, []);

  // Delete Dialog Handlers
  const handleOpenDeleteDialog = useCallback((schedule: TempSchedule | any) => {
    setDeleteDialog({ schedule, isOpen: true });
  }, []);

  const handleDeleteNow = useCallback(async () => {
    if (!deleteDialog.schedule) return;
    
    setIsDeleting(true);
    try {
      const schedule = deleteDialog.schedule;
      const isTemp = 'isPending' in schedule;

      if (isTemp) {
        // Para schedules temporales, remover del estado local y de pendingChanges
        setTempSchedules(prev => prev.filter(s => s.id !== schedule.id));
        
        // También remover cualquier cambio pendiente relacionado a este schedule
        setPendingChanges(prev => prev.filter(change => change.schedule.id !== schedule.id));
        
        toast.success('✅ Horario temporal eliminado');
      } else {
        // Para schedules guardados, eliminar en el servidor
        const success = await deleteScheduleItem(schedule.id);
        if (success) {
          toast.success('✅ Horario eliminado correctamente');
        } else {
          toast.error('❌ Error al eliminar el horario');
        }
      }

      setDeleteDialog({ schedule: null, isOpen: false });
    } catch (error) {
      toast.error('❌ Error al eliminar el horario');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteDialog.schedule, deleteScheduleItem]);

  const handleMarkForDeletion = useCallback(() => {
    if (!deleteDialog.schedule) return;

    const schedule = deleteDialog.schedule;
    const isTemp = 'isPending' in schedule;

    // Si es un schedule temporal (nunca guardado), no agregar 'delete' a pendingChanges
    // Solo remover de tempSchedules
    if (isTemp) {
      setTempSchedules(prev => prev.filter(s => s.id !== schedule.id));
      // También remover el 'create' original de pendingChanges
      setPendingChanges(prev => prev.filter(change => change.schedule.id !== schedule.id));
      toast.info('✅ Horario temporal descartado');
    } else {
      // Si es un schedule guardado, agregar a cambios pendientes para eliminar
      const deleteChange: ScheduleChange = {
        action: 'delete',
        schedule: schedule
      };

      setPendingChanges(prev => [...prev, deleteChange]);
      toast.info('⏳ Horario marcado para eliminar. Haz click en "Guardar Todos" para confirmar');
    }

    setDeleteDialog({ schedule: null, isOpen: false });
  }, [deleteDialog.schedule]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialog({ schedule: null, isOpen: false });
  }, []);

  const hasUnsavedChanges = pendingChanges.length > 0;

  // Compute UI stats
  const uiStats = {
    totalSchedules: schedules.length,
    totalSections: sections.length,
    totalAssignments: courseAssignments.length,
  };

  // Create Set of IDs marked for deletion
  const markedForDeletionIds = useMemo(() => {
    const ids = new Set<string | number>();
    pendingChanges.forEach(change => {
      if (change.action === 'delete') {
        const scheduleId = change.schedule.id;
        ids.add(scheduleId);
        // Also add as string in case of type mismatch
        ids.add(String(scheduleId));
      }
    });
    return ids;
  }, [pendingChanges]);

  // ✅ Check permissions
  if (!canReadLocal) {
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
        <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-gray-900 dark:text-white">
              Cargando datos...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Render principal
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cascade Selectors: Cycle → Grade → Section */}
      <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-2 border-blue-200 dark:border-slate-700 shadow-lg">
        <CardHeader className="pb-4 border-b-2 border-blue-100 dark:border-slate-700 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-300">
                Gestionar Horarios Académicos
              </CardTitle>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Selecciona ciclo escolar, grado y sección para comenzar
              </p>
            </div>
          </div>
          <Link href="/schedules/view">
            <Button 
              variant="outline" 
              size="sm" 
              className="whitespace-nowrap border-blue-300 dark:border-slate-600 hover:bg-blue-100 dark:hover:bg-slate-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Horarios
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Selectors Row - Cycle, Grade, Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Cycle Selector */}
            <div className="space-y-2 p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                  <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Ciclo Escolar
                </label>
              </div>
              <Combobox
                options={cycles.map(cycle => ({
                  label: cycle.name,
                  value: cycle.id,
                }))}
                value={selectedCycle}
                onValueChange={(value) => {
                  setSelectedCycle(Number(value));
                  setSelectedGrade(0);
                  setSelectedSection(0);
                }}
                placeholder="Selecciona un ciclo..."
                searchPlaceholder="Buscar ciclo..."
                emptyText="No hay ciclos disponibles"
              />
            </div>

            {/* Grade Selector */}
            <div className="space-y-2 p-4 bg-white dark:bg-slate-800 rounded-lg border border-amber-100 dark:border-slate-700 hover:border-amber-300 dark:hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded">
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Grado
                </label>
              </div>
              <Combobox
                options={gradesForCycle.map(grade => ({
                  label: grade.name,
                  value: grade.id,
                }))}
                value={selectedGrade}
                onValueChange={(value) => {
                  setSelectedGrade(Number(value));
                  setSelectedSection(0);
                }}
                placeholder="Selecciona un grado..."
                searchPlaceholder="Buscar grado..."
                emptyText="Selecciona un ciclo primero"
                disabled={selectedCycle === 0}
              />
            </div>

            {/* Section Selector */}
            <div className="space-y-2 p-4 bg-white dark:bg-slate-800 rounded-lg border border-green-100 dark:border-slate-700 hover:border-green-300 dark:hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
                  <Home className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Sección
                </label>
              </div>
              <Combobox
                options={filteredSections.map(section => ({
                  label: section.name,
                  value: section.id,
                }))}
                value={selectedSection}
                onValueChange={(value) => setSelectedSection(Number(value))}
                placeholder="Selecciona una sección..."
                searchPlaceholder="Buscar sección..."
                emptyText="Selecciona un grado primero"
                disabled={selectedGrade === 0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show message if no section selected */}
      {selectedSection === 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
          <CardContent className="p-6 text-center">
            <p className="text-blue-700 dark:text-blue-300">
              Selecciona un ciclo, grado y sección para comenzar a gestionar horarios.
            </p>
          </CardContent>
        </Card>
      )}
      {/* Error display */}
      {error && (
        <Card className="border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearError}
                className="hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operation Errors display */}
      {operationErrors.length > 0 && (
        <Card className="border-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 shadow-lg">
          <CardHeader className="pb-3 border-b border-amber-200 dark:border-amber-800">
            <CardTitle className="flex items-center gap-2 text-base text-amber-900 dark:text-amber-200">
              <AlertCircle className="h-5 w-5" />
              Errores en la Operación
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {operationErrors.map((err, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
                  <div className="text-xs font-mono text-amber-700 dark:text-amber-300">
                    ID: {err.itemId}
                  </div>
                  <div className="text-sm mt-1 text-amber-800 dark:text-amber-100">
                    {err.error}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setOperationErrors([])}
              className="mt-4 hover:bg-amber-100 dark:hover:bg-amber-900/50"
            >
              Cerrar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Calendar Content - Only show if section is selected */}
      {selectedSection > 0 && (
        <>
      {/* Header with stats */}
      <Card className="shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Horarios</h1>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
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
                className="flex items-center gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-300"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
              <div className="text-sm mb-1 text-gray-700 dark:text-gray-300">
                Horarios
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {uiStats.totalSchedules}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
              <div className="text-sm mb-1 text-gray-700 dark:text-gray-300">
                Secciones
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {uiStats.totalSections}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
              <div className="text-sm mb-1 text-gray-700 dark:text-gray-300">
                Asignaciones
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {uiStats.totalAssignments}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              hasUnsavedChanges 
                ? 'bg-orange-100 dark:bg-orange-900/50 border-2 border-orange-300 dark:border-orange-700' 
                : 'bg-gray-100 dark:bg-gray-700'
              }`}>
              <div className="text-sm mb-1 text-gray-600 dark:text-gray-400">
                Cambios Pendientes
              </div>
              <div className={`text-2xl font-bold ${
                hasUnsavedChanges
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {pendingChanges.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Calendar View */}
      <div className="flex gap-6">
        {/* Main Calendar Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
          <div className="space-y-4 min-w-0">
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
            // Check if section has ScheduleConfig configured
            !config ? (
              <Card className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/40 dark:via-amber-950/40 dark:to-yellow-950/40 border-2 border-orange-300 dark:border-orange-700 shadow-lg">
                <CardContent className="p-8 text-center space-y-6">
                  <div>
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full">
                        <Zap className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-200 mb-3">
                      Configuración Requerida
                    </h3>
                    <p className="text-orange-800 dark:text-orange-300 mb-3">
                      La sección <span className="font-semibold">{sections.find(s => s.id === selectedSection)?.name}</span> aún no tiene configuración de horario.
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                      Debes configurar los horarios de inicio/fin, duración de períodos y recreos antes de crear un horario.
                    </p>
                  </div>
                  {canCreateScheduleConfig && (
                    <Button
                      onClick={() => setShowConfigModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                    >
                      <Settings className="h-5 w-5" />
                      Configurar Horario
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
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
                  // TODO: Open edit modal
                }}
                onScheduleDelete={handleOpenDeleteDialog}
                canEdit={canUpdateLocal}
                canDelete={canDeleteLocal}
                markedForDeletionIds={markedForDeletionIds}
              />
            )
          ) : (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Selecciona una sección para ver y gestionar su horario
                </p>
              </CardContent>
            </Card>
          )}
          </div>
        </div>

        {/* Sidebar with Course Assignments - Sticky */}
        {/* Only show sidebar if section is selected AND has config */}
        {selectedSection > 0 && config && (
          <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-40 w-80 h-fit max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300 border border-border rounded-lg bg-background p-4">
              <ScheduleSidebar
                courseAssignments={courseAssignments}
                assignmentHours={assignmentHours}
                pendingChanges={pendingChanges}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar - shown on small screens */}
      {selectedSection > 0 && config && (
        <div className="lg:hidden">
          <ScheduleSidebar
            courseAssignments={courseAssignments}
            assignmentHours={assignmentHours}
            pendingChanges={pendingChanges}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>
      )}

        </> 
      )}

      {/* Loading overlay for save operations */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="text-gray-900 dark:text-white">
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

      {/* Configuration Change Modal */}
      {validationResult && (
        <ConfigurationChangeModal
          isOpen={showConfigChangeModal}
          validation={validationResult}
          onApplyAndDelete={handleConfigChangeApplyAndDelete}
          onApplyAndAdjust={handleConfigChangeApplyAndAdjust}
          onCancel={handleConfigChangeCancel}
          isLoading={isSaving}
        />
      )}

      {/* Delete Schedule Dialog */}
      <DeleteScheduleDialog
        isOpen={deleteDialog.isOpen}
        schedule={deleteDialog.schedule}
        isDeleting={isDeleting}
        onDeleteNow={handleDeleteNow}
        onMarkForDeletion={handleMarkForDeletion}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
