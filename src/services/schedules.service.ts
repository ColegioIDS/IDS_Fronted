// src/services/schedules.service.ts
// ============================================================================
// 📅 Schedules Service (Consolidated)
// ============================================================================
// Unified service for all Schedule and ScheduleConfig operations.
// Single point of entry for all schedule-related API calls.
// ============================================================================

import axios, { AxiosError } from 'axios';
import { api } from '@/config/api';
import {
  // Config types
  ScheduleConfig,
  CreateScheduleConfigDto,
  UpdateScheduleConfigDto,
  ScheduleConfigQuery,
  PaginatedScheduleConfigs,
  // Schedule types
  Schedule,
  ScheduleFormValues,
  ScheduleFilters,
  // Form/Availability types
  ScheduleFormData,
  TeacherAvailability,
  // Response types
  ApiScheduleResponse,
  PaginationMeta,
  BatchSaveResult,
} from '@/types/schedules.types';
import { ApiResponse } from '@/types/api';

// ============================================================================
// API CLIENT SETUP
// ============================================================================

// Use the configured API client from config
const apiClient = api;

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Unified error handler for API calls
 */
function handleApiError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || fallbackMessage;
    const details = error.response?.data?.details || [];
    const err = new Error(message);
    (err as any).details = details;
    (err as any).status = error.response?.status;
    throw err;
  }
  if (error instanceof Error) throw error;
  throw new Error(fallbackMessage);
}

// ============================================================================
// 📋 SCHEDULE CONFIG OPERATIONS
// ============================================================================

/**
 * Get paginated list of ScheduleConfigs
 */
export const getScheduleConfigs = async (
  query: ScheduleConfigQuery = {}
): Promise<PaginatedScheduleConfigs> => {
  try {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const { data } = await apiClient.get<ApiResponse<PaginatedScheduleConfigs>>(
      `/api/schedule-configs?${params.toString()}`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener configuraciones de horarios');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener configuraciones de horarios');
  }
};

/**
 * Get ScheduleConfig by ID
 */
export const getScheduleConfigById = async (id: number): Promise<ScheduleConfig> => {
  try {
    const { data } = await apiClient.get<ApiResponse<ScheduleConfig>>(
      `/api/schedule-configs/${id}`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener la configuración');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la configuración de horario');
  }
};

/**
 * Get ScheduleConfig for a specific section
 */
export const getScheduleConfigBySection = async (
  sectionId: number
): Promise<ScheduleConfig | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<ScheduleConfig>>(
      `/api/schedule-configs/section/${sectionId}`
    );

    if (!data.success) {
      return null;
    }

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    handleApiError(error, 'Error al obtener configuración de sección');
  }
};

/**
 * Create a new ScheduleConfig
 */
export const createScheduleConfig = async (
  dto: CreateScheduleConfigDto
): Promise<ScheduleConfig> => {
  try {
    const { data } = await apiClient.post<ApiResponse<ScheduleConfig>>(
      '/api/schedule-configs',
      dto
    );

    if (!data.success) {
      const err = new Error(data.message || 'Error al crear configuración');
      (err as any).details = data.details || [];
      throw err;
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear configuración de horario');
  }
};

/**
 * Update a ScheduleConfig
 */
export const updateScheduleConfig = async (
  id: number,
  dto: UpdateScheduleConfigDto
): Promise<ScheduleConfig> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<ScheduleConfig>>(
      `/api/schedule-configs/${id}`,
      dto
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al actualizar configuración');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar configuración de horario');
  }
};

/**
 * Delete a ScheduleConfig
 */
export const deleteScheduleConfig = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `/api/schedule-configs/${id}`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al eliminar configuración');
    }
  } catch (error) {
    handleApiError(error, 'Error al eliminar configuración de horario');
  }
};

// ============================================================================
// 📚 SCHEDULE OPERATIONS
// ============================================================================

/**
 * Get schedules with optional filters
 */
export const getSchedules = async (filters?: ScheduleFilters): Promise<Schedule[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.sectionId) params.append('sectionId', filters.sectionId.toString());
    if (filters?.courseAssignmentId)
      params.append('courseAssignmentId', filters.courseAssignmentId.toString());
    if (filters?.teacherId) params.append('teacherId', filters.teacherId.toString());
    if (filters?.dayOfWeek) params.append('dayOfWeek', filters.dayOfWeek.toString());

    const { data } = await apiClient.get<ApiResponse<Schedule[]>>(
      `/api/schedules?${params.toString()}`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener horarios');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener horarios');
  }
};

/**
 * Get a specific schedule by ID
 */
export const getScheduleById = async (id: number): Promise<Schedule> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Schedule>>(`/api/schedules/${id}`);

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener el horario');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el horario');
  }
};

/**
 * Get all schedules for a specific section
 */
export const getSchedulesBySection = async (sectionId: number): Promise<Schedule[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Schedule[]>>(
      `/api/schedules/section/${sectionId}`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener horarios de la sección');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener horarios de la sección');
  }
};

/**
 * Get all schedules for a specific teacher
 */
export const getSchedulesByTeacher = async (teacherId: number): Promise<Schedule[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Schedule[]>>(
      `/api/schedules/teacher/${teacherId}`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener horarios del maestro');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener horarios del maestro');
  }
};

/**
 * Create a new schedule
 * CRITICAL: Must include courseAssignmentId
 */
export const createSchedule = async (dto: ScheduleFormValues): Promise<Schedule> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Schedule>>('/api/schedules', dto);

    if (!data.success) {
      const err = new Error(data.message || 'Error al crear horario');
      (err as any).details = data.details || [];
      throw err;
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear horario');
  }
};

/**
 * Update an existing schedule
 */
export const updateSchedule = async (
  id: number,
  dto: Partial<ScheduleFormValues>
): Promise<Schedule> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<Schedule>>(
      `/api/schedules/${id}`,
      dto
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al actualizar horario');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar horario');
  }
};

/**
 * Delete a schedule
 */
export const deleteSchedule = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/schedules/${id}`);

    if (!data.success) {
      throw new Error(data.message || 'Error al eliminar horario');
    }
  } catch (error) {
    handleApiError(error, 'Error al eliminar horario');
  }
};

/**
 * Delete all schedules for a section, optionally keeping specific IDs
 */
export const deleteSchedulesBySection = async (
  sectionId: number,
  keepIds: number[] = []
): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `/api/schedules/section/${sectionId}`,
      {
        data: { keepIds },
      }
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al limpiar horarios');
    }
  } catch (error) {
    handleApiError(error, 'Error al limpiar horarios de la sección');
  }
};

// ============================================================================
// 🔄 BATCH OPERATIONS
// ============================================================================

/**
 * Batch save multiple schedules
 */
export const batchSaveSchedules = async (
  schedules: ScheduleFormValues[]
): Promise<BatchSaveResult> => {
  try {
    const { data } = await apiClient.post<ApiResponse<BatchSaveResult>>(
      '/api/schedules/batch',
      { schedules }
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al guardar horarios');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al guardar horarios masivamente');
  }
};

// ============================================================================
// 📊 FORM DATA & UTILITIES
// ============================================================================

/**
 * Get consolidated form data for schedule module
 */
export const getScheduleFormData = async (): Promise<ScheduleFormData> => {
  try {
    const { data } = await apiClient.get<ApiResponse<ScheduleFormData>>(
      '/api/schedules/form-data'
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener datos del formulario');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener datos del formulario');
  }
};

/**
 * Get teacher availability/conflicts
 */
export const getTeacherAvailability = async (): Promise<TeacherAvailability> => {
  try {
    const { data } = await apiClient.get<ApiResponse<TeacherAvailability>>(
      '/api/schedules/teacher-availability'
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener disponibilidad');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener disponibilidad de maestros');
  }
};

// ============================================================================
// ✨ SERVICE EXPORT
// ============================================================================

/**
 * Unified schedules service
 * Provides all schedule-related operations
 */
export const schedulesService = {
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

  // Batch operations
  batchSaveSchedules,

  // Utilities
  getScheduleFormData,
  getTeacherAvailability,
};
