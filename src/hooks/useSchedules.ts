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
      
      // Update schedules with new data
      if (result.created.length > 0) {
        setSchedules((prev) => [...prev, ...result.created]);
      }
      if (result.updated.length > 0) {
        setSchedules((prev) =>
          prev.map((s) => {
            const updated = result.updated.find((u) => u.id === s.id);
            return updated || s;
          })
        );
      }
      if (result.deleted.length > 0) {
        setSchedules((prev) =>
          prev.filter((s) => !result.deleted.includes(s.id))
        );
      }

      const message = `${result.created.length} creados, ${result.updated.length} actualizados, ${result.deleted.length} eliminados`;
      handleSuccess(message);
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
