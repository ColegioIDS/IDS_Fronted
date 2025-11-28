// src/hooks/useSchedules.ts
// ============================================================================
// 📅 Unified Schedules Hook
// ============================================================================
// Consolidated hook combining useSchedule and useScheduleConfig functionality.
// Provides state management for all schedule-related operations.
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  // Config
  ScheduleConfig,
  CreateScheduleConfigDto,
  UpdateScheduleConfigDto,
  // Schedule
  Schedule,
  ScheduleFormValues,
  ScheduleFilters,
  // Form data
  ScheduleFormData,
  TeacherAvailability,
  // Utilities
  BatchSaveResult,
} from '@/types/schedules.types';
import {
  // Config operations
  getScheduleConfigs,
  getScheduleConfigById,
  getScheduleConfigBySection,
  createScheduleConfig,
  updateScheduleConfig,
  deleteScheduleConfig,
  // Schedule operations
  getSchedules,
  getScheduleById,
  getSchedulesBySection,
  getSchedulesByTeacher,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  deleteSchedulesBySection,
  batchSaveSchedules,
  // Utilities
  getScheduleFormData,
  getTeacherAvailability,
  schedulesService,
} from '@/services/schedules.service';

// ============================================================================
// HOOK OPTIONS & RETURN TYPES
// ============================================================================

/**
 * Options for useSchedules hook
 */
export interface UseSchedulesOptions {
  autoLoadFormData?: boolean;
  autoLoadAvailability?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

/**
 * Return type for useSchedules hook
 */
export interface UseSchedulesReturn {
  // Data - Config
  config: ScheduleConfig | null;
  configs: ScheduleConfig[];
  isLoadingConfigs: boolean;

  // Data - Schedule
  schedules: Schedule[];
  isLoadingSchedules: boolean;

  // Data - Form
  formData: ScheduleFormData | null;
  isLoadingFormData: boolean;

  // Data - Availability
  teacherAvailability: TeacherAvailability | null;
  isLoadingAvailability: boolean;

  // General loading state
  isLoading: boolean;
  isSubmitting: boolean;

  // Error state
  error: string | null;

  // Config actions
  loadConfig: (sectionId: number) => Promise<void>;
  loadConfigs: (limit?: number) => Promise<void>;
  createConfig: (dto: CreateScheduleConfigDto) => Promise<ScheduleConfig | null>;
  updateConfig: (id: number, dto: UpdateScheduleConfigDto) => Promise<ScheduleConfig | null>;
  deleteConfig: (id: number) => Promise<boolean>;

  // Schedule actions
  loadSchedules: (filters?: ScheduleFilters) => Promise<void>;
  loadSchedulesBySection: (sectionId: number) => Promise<void>;
  createScheduleItem: (dto: ScheduleFormValues) => Promise<Schedule | null>;
  updateScheduleItem: (id: number, dto: Partial<ScheduleFormValues>) => Promise<Schedule | null>;
  deleteScheduleItem: (id: number) => Promise<boolean>;
  batchSave: (schedules: ScheduleFormValues[]) => Promise<BatchSaveResult | null>;

  // Utility actions
  loadFormData: () => Promise<void>;
  loadAvailability: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Error handling
  clearError: () => void;

  // Validation actions
  validateConfigurationChange: (
    oldConfig: ScheduleConfig,
    newConfig: ScheduleConfig
  ) => Promise<any>;
  deleteInvalidSchedules: (scheduleIds: number[]) => Promise<any>;
  adjustInvalidSchedules: (oldConfig: ScheduleConfig, newConfig: ScheduleConfig) => Promise<any>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Consolidated hook for schedule management
 * Combines config and schedule operations
 */
export function useSchedules(options: UseSchedulesOptions = {}): UseSchedulesReturn {
  const {
    autoLoadFormData = true,
    autoLoadAvailability = false,
    onSuccess,
    onError,
  } = options;

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  // Config state
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [configs, setConfigs] = useState<ScheduleConfig[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);

  // Schedule state
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  // Form data
  const [formData, setFormData] = useState<ScheduleFormData | null>(null);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);

  // Availability
  const [teacherAvailability, setTeacherAvailability] = useState<TeacherAvailability | null>(
    null
  );
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // General states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent duplicate effect execution in StrictMode
  const hasInitialized = useRef(false);

  // =========================================================================
  // DERIVED STATE
  // =========================================================================

  const isLoading =
    isLoadingFormData || isLoadingSchedules || isLoadingConfigs || isLoadingAvailability;

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initialize = async () => {
      try {
        if (autoLoadFormData) {
          await loadFormDataInternal();
        }
        if (autoLoadAvailability) {
          await loadAvailabilityInternal();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al inicializar';
        setError(message);
        onError?.(message);
      }
    };

    initialize();
  }, []);

  // =========================================================================
  // INTERNAL HELPER FUNCTIONS
  // =========================================================================

  const handleSuccess = useCallback((message: string) => {
    onSuccess?.(message);
  }, [onSuccess]);

  const handleError = useCallback((err: unknown, context: string) => {
    let message = context;
    if (err instanceof Error) {
      message = err.message;
    }
    setError(message);
    onError?.(message);
    toast.error(message);
  }, [onError]);

  // =========================================================================
  // CONFIG OPERATIONS
  // =========================================================================

  const loadConfig = useCallback(async (sectionId: number) => {
    setIsLoadingConfigs(true);
    try {
      const data = await getScheduleConfigBySection(sectionId);
      setConfig(data);
    } catch (err) {
      handleError(err, 'Error al cargar configuración');
    } finally {
      setIsLoadingConfigs(false);
    }
  }, []);

  const loadConfigs = useCallback(async (limit = 50) => {
    setIsLoadingConfigs(true);
    try {
      const result = await getScheduleConfigs({ limit });
      setConfigs(result.data);
    } catch (err) {
      handleError(err, 'Error al cargar configuraciones');
    } finally {
      setIsLoadingConfigs(false);
    }
  }, []);

  const createConfig = useCallback(
    async (dto: CreateScheduleConfigDto): Promise<ScheduleConfig | null> => {
      setIsSubmitting(true);
      try {
        const newConfig = await createScheduleConfig(dto);
        setConfig(newConfig);
        setConfigs((prev) => [...prev, newConfig]);
        handleSuccess('Configuración creada correctamente');
        return newConfig;
      } catch (err) {
        handleError(err, 'Error al crear configuración');
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const updateConfig = useCallback(
    async (id: number, dto: UpdateScheduleConfigDto): Promise<ScheduleConfig | null> => {
      setIsSubmitting(true);
      try {
        const updated = await updateScheduleConfig(id, dto);
        setConfig(updated);
        setConfigs((prev) =>
          prev.map((c) => (c.id === id ? updated : c))
        );
        handleSuccess('Configuración actualizada correctamente');
        return updated;
      } catch (err) {
        handleError(err, 'Error al actualizar configuración');
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const deleteConfig = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await deleteScheduleConfig(id);
      setConfigs((prev) => prev.filter((c) => c.id !== id));
      if (config?.id === id) {
        setConfig(null);
      }
      handleSuccess('Configuración eliminada correctamente');
      return true;
    } catch (err) {
      handleError(err, 'Error al eliminar configuración');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [config?.id]);

  // =========================================================================
  // SCHEDULE OPERATIONS
  // =========================================================================

  const loadSchedules = useCallback(async (filters?: ScheduleFilters) => {
    setIsLoadingSchedules(true);
    try {
      const data = await getSchedules(filters);
      setSchedules(data);
    } catch (err) {
      handleError(err, 'Error al cargar horarios');
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  const loadSchedulesBySection = useCallback(async (sectionId: number) => {
    setIsLoadingSchedules(true);
    try {
      const data = await getSchedulesBySection(sectionId);
      setSchedules(data);
    } catch (err) {
      handleError(err, 'Error al cargar horarios de la sección');
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  const createScheduleItem = useCallback(
    async (dto: ScheduleFormValues): Promise<Schedule | null> => {
      setIsSubmitting(true);
      try {
        const newSchedule = await createSchedule(dto);
        setSchedules((prev) => [...prev, newSchedule]);
        handleSuccess('Horario creado correctamente');
        return newSchedule;
      } catch (err) {
        handleError(err, 'Error al crear horario');
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const updateScheduleItem = useCallback(
    async (id: number, dto: Partial<ScheduleFormValues>): Promise<Schedule | null> => {
      setIsSubmitting(true);
      try {
        const updated = await updateSchedule(id, dto);
        setSchedules((prev) =>
          prev.map((s) => (s.id === id ? updated : s))
        );
        handleSuccess('Horario actualizado correctamente');
        return updated;
      } catch (err) {
        handleError(err, 'Error al actualizar horario');
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const deleteScheduleItem = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await deleteSchedule(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      handleSuccess('Horario eliminado correctamente');
      return true;
    } catch (err) {
      handleError(err, 'Error al eliminar horario');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const batchSave = useCallback(async (items: ScheduleFormValues[]): Promise<BatchSaveResult | null> => {
    setIsSubmitting(true);
    try {
      const result = await batchSaveSchedules(items);
      
      // Update schedules with new data from new structure
      // NOTE: result is BatchSaveResult which has { success, message, data: { stats, items } }
      const items_data = result?.data?.items;
      
      if (items_data?.created && items_data.created.length > 0) {
        setSchedules((prev) => [...prev, ...items_data.created]);
      }
      if (items_data?.updated && items_data.updated.length > 0) {
        setSchedules((prev) =>
          prev.map((s) => {
            const updated = items_data.updated.find((u: any) => u.id === s.id);
            return updated || s;
          })
        );
      }
      if (items_data?.deleted && items_data.deleted.length > 0) {
        setSchedules((prev) =>
          prev.filter((s) => !items_data.deleted.includes(s.id))
        );
      }

      // Return result without showing toasts - let caller handle notifications
      return result;
    } catch (err) {
      handleError(err, 'Error al guardar horarios');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // =========================================================================
  // UTILITY OPERATIONS
  // =========================================================================

  const loadFormDataInternal = useCallback(async () => {
    setIsLoadingFormData(true);
    try {
      const data = await getScheduleFormData();
      setFormData(data);
    } catch (err) {
      handleError(err, 'Error al cargar datos del formulario');
    } finally {
      setIsLoadingFormData(false);
    }
  }, []);

  const loadFormData = useCallback(async () => {
    await loadFormDataInternal();
  }, []);

  const loadAvailabilityInternal = useCallback(async () => {
    setIsLoadingAvailability(true);
    try {
      const data = await getTeacherAvailability();
      setTeacherAvailability(data);
    } catch (err) {
      handleError(err, 'Error al cargar disponibilidad');
    } finally {
      setIsLoadingAvailability(false);
    }
  }, []);

  const loadAvailability = useCallback(async () => {
    await loadAvailabilityInternal();
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadFormData(),
      loadSchedules(),
      loadConfigs(),
    ]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // =========================================================================
  // VALIDATION OPERATIONS
  // =========================================================================

  const validateConfigurationChange = useCallback(
    async (oldConfig: ScheduleConfig, newConfig: ScheduleConfig) => {
      try {
        const { ScheduleConfigValidator } = await import('@/utils/scheduleValidator');
        
        // Get schedules for this section
        const sectionSchedules = schedules.filter(s => s.sectionId === oldConfig.sectionId);
        
        // Validate
        const validation = ScheduleConfigValidator.validateSchedulesAgainstConfig(
          sectionSchedules,
          oldConfig,
          newConfig
        );
        
        return validation;
      } catch (err) {
        handleError(err, 'Error validando cambios de configuración');
        return null;
      }
    },
    [schedules]
  );

  const deleteInvalidSchedules = useCallback(
    async (scheduleIds: number[]) => {
      try {
        setIsSubmitting(true);
        
        let successCount = 0;
        const errors = [];
        
        for (const id of scheduleIds) {
          try {
            await deleteScheduleItem(id);
            successCount++;
          } catch (err) {
            errors.push({
              id,
              error: err instanceof Error ? err.message : 'Error desconocido'
            });
          }
        }
        
        setSchedules(prev => prev.filter(s => !scheduleIds.includes(s.id)));
        
        if (errors.length === 0) {
          handleSuccess(`${successCount} horario(s) eliminado(s) exitosamente`);
        } else {
          handleError(
            new Error(`Eliminados ${successCount}, Errores: ${errors.length}`),
            'Se eliminaron algunos horarios pero hubo errores'
          );
        }
        
        return { successCount, errors };
      } finally {
        setIsSubmitting(false);
      }
    },
    [deleteScheduleItem, handleSuccess, handleError]
  );

  const adjustInvalidSchedules = useCallback(
    async (oldConfig: ScheduleConfig, newConfig: ScheduleConfig) => {
      try {
        setIsSubmitting(true);
        const { ScheduleConfigValidator } = await import('@/utils/scheduleValidator');
        
        let adjustedCount = 0;
        const errors = [];
        
        const sectionSchedules = schedules.filter(s => s.sectionId === oldConfig.sectionId);
        
        for (const schedule of sectionSchedules) {
          const validation = ScheduleConfigValidator.validateSingleSchedule(schedule, newConfig);
          
          if (validation && !validation.isValid) {
            const suggestion = ScheduleConfigValidator.suggestValidTimeSlot(schedule, newConfig);
            
            if (suggestion) {
              try {
                await updateScheduleItem(schedule.id, {
                  courseAssignmentId: schedule.courseAssignmentId,
                  dayOfWeek: schedule.dayOfWeek,
                  startTime: suggestion.startTime,
                  endTime: suggestion.endTime,
                  classroom: schedule.classroom || undefined,
                });
                adjustedCount++;
              } catch (err) {
                errors.push({
                  scheduleId: schedule.id,
                  error: err instanceof Error ? err.message : 'Error desconocido'
                });
              }
            } else {
              errors.push({
                scheduleId: schedule.id,
                error: 'No se pudo encontrar un slot válido para este horario'
              });
            }
          }
        }
        
        if (adjustedCount > 0) {
          await loadSchedulesBySection(oldConfig.sectionId);
        }
        
        if (errors.length === 0) {
          handleSuccess(`${adjustedCount} horario(s) ajustado(s) automáticamente`);
        } else {
          handleError(
            new Error(`Ajustados ${adjustedCount}, Errores: ${errors.length}`),
            'Se ajustaron algunos horarios pero hubo errores'
          );
        }
        
        return { adjustedCount, errors };
      } finally {
        setIsSubmitting(false);
      }
    },
    [schedules, updateScheduleItem, loadSchedulesBySection, handleSuccess, handleError]
  );

  // =========================================================================
  // RETURN HOOK API
  // =========================================================================

  return {
    // Data - Config
    config,
    configs,
    isLoadingConfigs,

    // Data - Schedule
    schedules,
    isLoadingSchedules,

    // Data - Form
    formData,
    isLoadingFormData,

    // Data - Availability
    teacherAvailability,
    isLoadingAvailability,

    // General loading
    isLoading,
    isSubmitting,

    // Error
    error,

    // Config actions
    loadConfig,
    loadConfigs,
    createConfig,
    updateConfig,
    deleteConfig,

    // Schedule actions
    loadSchedules,
    loadSchedulesBySection,
    createScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    batchSave,

    // Utility actions
    loadFormData,
    loadAvailability,
    refreshAll,

    // Error handling
    clearError,

    // Validation actions
    validateConfigurationChange,
    deleteInvalidSchedules,
    adjustInvalidSchedules,
  };
}

// ============================================================================
// SPECIALIZED HOOK VARIANTS (FOR SPECIFIC USE CASES)
// ============================================================================

/**
 * Hook for loading schedule for a specific section
 */
export function useSchedulesBySection(sectionId: number) {
  const { schedules, isLoadingSchedules, error, loadSchedulesBySection } = useSchedules();

  useEffect(() => {
    if (sectionId) {
      loadSchedulesBySection(sectionId);
    }
  }, [sectionId, loadSchedulesBySection]);

  return { schedules, isLoading: isLoadingSchedules, error };
}

/**
 * Hook for managing schedule config only
 */
export function useScheduleConfig(sectionId?: number) {
  const { config, isLoadingConfigs, error, loadConfig } = useSchedules();

  useEffect(() => {
    if (sectionId) {
      loadConfig(sectionId);
    }
  }, [sectionId, loadConfig]);

  return { config, isLoading: isLoadingConfigs, error };
}
