// src/services/schedules.service.ts
// ============================================================================
// 📅 Schedules Service (Consolidated & Clean)
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

const apiClient = api;

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Extract error details from response or axios error
 */
function extractErrorDetails(error: unknown): { message: string; details: string[] } {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || 'Error en la solicitud';
    const details = error.response?.data?.details || [];
    return { message, details };
  }
  
  if (error instanceof Error) {
    return { message: error.message, details: [] };
  }
  
  return { message: 'Error desconocido', details: [] };
}

/**
 * Throw error with details attached
 */
function throwWithDetails(message: string, details: string[] = []): never {
  const err = new Error(message);
  (err as any).details = details;
  throw err;
}

// ============================================================================
// 📋 SCHEDULE CONFIG OPERATIONS
// ============================================================================

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

    return data.data;
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const getScheduleConfigById = async (id: number): Promise<ScheduleConfig> => {
  try {
    const { data } = await apiClient.get<ApiResponse<ScheduleConfig>>(
      `/api/schedule-configs/${id}`
    );

    return data.data;
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const getScheduleConfigBySection = async (
  sectionId: number
): Promise<ScheduleConfig | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<ScheduleConfig>>(
      `/api/schedule-configs/section/${sectionId}`
    );

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const createScheduleConfig = async (
  dto: CreateScheduleConfigDto
): Promise<ScheduleConfig> => {
  try {
    const { data } = await apiClient.post<ApiResponse<ScheduleConfig>>(
      '/api/schedule-configs',
      dto
    );

    return data.data;
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const updateScheduleConfig = async (
  id: number,
  dto: UpdateScheduleConfigDto
): Promise<ScheduleConfig> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<ScheduleConfig>>(
      `/api/schedule-configs/${id}`,
      dto
    );

    return data.data;
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const deleteScheduleConfig = async (id: number): Promise<void> => {
  try {
    await apiClient.delete<ApiResponse<void>>(
      `/api/schedule-configs/${id}`
    );
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

// ============================================================================
// 📚 SCHEDULE OPERATIONS
// ============================================================================

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

    return data.data;
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const getScheduleById = async (id: number): Promise<Schedule> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Schedule>>(`/api/schedules/${id}`);

    return data.data;
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const getSchedulesBySection = async (sectionId: number): Promise<Schedule[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Schedule[]>>(
      `/api/schedules/section/${sectionId}`
    );

    return data.data;
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const getSchedulesByTeacher = async (teacherId: number): Promise<Schedule[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Schedule[]>>(
      `/api/schedules/teacher/${teacherId}`
    );

    return data.data;
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const createSchedule = async (dto: ScheduleFormValues): Promise<Schedule> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Schedule>>('/api/schedules', dto);

    return data.data;
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const updateSchedule = async (
  id: number,
  dto: Partial<ScheduleFormValues>
): Promise<Schedule> => {
  try {
    // Remove fields that shouldn't be updated (courseAssignmentId is immutable after creation)
    const { courseAssignmentId, ...updateData } = dto;
    
    const { data } = await apiClient.patch<ApiResponse<Schedule>>(
      `/api/schedules/${id}`,
      updateData
    );

    return data.data;
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const deleteSchedule = async (id: number): Promise<void> => {
  try {
    await apiClient.delete<ApiResponse<void>>(`/api/schedules/${id}`);
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const deleteSchedulesBySection = async (
  sectionId: number,
  keepIds: number[] = []
): Promise<void> => {
  try {
    await apiClient.delete<ApiResponse<void>>(
      `/api/schedules/section/${sectionId}`,
      {
        data: { keepIds },
      }
    );
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

// ============================================================================
// 🔄 BATCH OPERATIONS
// ============================================================================

/**
 * Batch save multiple schedules
 * 
 * Returns FULL response even when success=false
 * Allows access to data.items.errors and data.stats
 * 
 * CRITICAL: This function NEVER throws for valid server responses.
 * It always returns the server's response data, even when success=false,
 * so the caller can access error details via data.items.errors and data.stats
 */
export const batchSaveSchedules = async (
  schedules: ScheduleFormValues[]
): Promise<BatchSaveResult> => {
  try {
    const { data } = await apiClient.post<ApiResponse<BatchSaveResult>>(
      '/api/schedules/batch',
      { schedules }
    );

    console.log('✅ Batch response received:', data);
    
    // The response from the API is wrapped as { success, message, data: {...} }
    // The complete BatchSaveResult should be: { success, message, data: { stats, items } }
    const batchResult: BatchSaveResult = {
      success: data.success ?? true,  // Default to true if not specified
      message: data.message || 'Operación completada',
      data: (data.data || {
        stats: { created: 0, updated: 0, deleted: 0, errors: 0 },
        items: { created: [], updated: [], deleted: [], errors: [] }
      }) as any
    };
    
    console.log('✅ Returning BatchSaveResult:', batchResult);
    return batchResult;
  } catch (error: any) {
    console.log('❌ Batch error caught:', {
      isAxiosError: axios.isAxiosError(error),
      status: error.response?.status,
      errorData: error.response?.data,
      message: error.message,
    });

    // If it's an axios error, try to extract the response data
    if (axios.isAxiosError(error)) {
      // Case 1: Backend returned wrapped response { success, message, data: {...} }
      if (error.response?.data?.data && error.response.data.data.stats) {
        console.log('✅ Case 1: Found error.response.data.data with proper structure');
        return error.response.data.data;
      }
      
      // Case 2: Backend returned flat structure { success, message, stats, items }
      if (error.response?.data?.stats && error.response?.data?.items) {
        console.log('✅ Case 2: Found flat structure in error.response.data');
        return {
          success: error.response.data.success ?? false,
          message: error.response.data.message || 'Error en batch',
          data: {
            stats: error.response.data.stats,
            items: error.response.data.items
          }
        };
      }
      
      // Case 3: Backend might have nested differently
      if (error.response?.data?.items?.errors && error.response?.data?.stats) {
        console.log('✅ Case 3: Found items and stats separately');
        return {
          success: error.response.data.success ?? false,
          message: error.response.data.message || 'Operación completada con errores',
          data: {
            stats: error.response.data.stats,
            items: error.response.data.items
          }
        };
      }
      
      // Case 4: Only have items, construct stats from it
      if (error.response?.data?.items?.errors) {
        console.log('✅ Case 4: Found only items.errors, constructing minimal response');
        return {
          success: false,
          message: error.response.data.message || 'Operación completada con errores',
          data: {
            stats: error.response.data.stats || { 
              created: 0, 
              updated: 0, 
              deleted: 0, 
              errors: error.response.data.items.errors.length 
            },
            items: error.response.data.items
          }
        };
      }
      
      // Case 5: Generic error - create minimal batch result
      const message = error.response?.data?.message || error.message || 'Error al guardar horarios';
      const details = error.response?.data?.details || [];
      
      console.log('⚠️ Case 5: Generic error, creating minimal result');
      
      return {
        success: false,
        message,
        data: {
          stats: { created: 0, updated: 0, deleted: 0, errors: 1 },
          items: {
            created: [],
            updated: [],
            deleted: [],
            errors: [{ itemId: 0, error: message, details }]
          }
        }
      };
    }
    
    // If it's not an axios error, throw
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

// ============================================================================
// 📊 FORM DATA & UTILITIES
// ============================================================================

/**
 * Get consolidated form data for schedule module
 * 
 * Expected response structure (B+ format):
 * {
 *   activeCycle: {...},
 *   cycles: [...],
 *   grades: [...],
 *   sections: [{ id, name, capacity, gradeId, teacherId, courseAssignments: [...] }],
 *   scheduleConfigs: [...],
 *   existingSchedules: [...]
 * }
 * 
 * Allows flexible cascading filters:
 * - Ciclo → Grado → Sección
 * - Grado → Sección (skip cycle)
 * - Sección directo
 */
export const getScheduleFormData = async (): Promise<ScheduleFormData> => {
  try {
    const { data } = await apiClient.get<ApiResponse<ScheduleFormData>>(
      '/api/schedules/form-data'
    );

    return data.data;
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

export const getTeacherAvailability = async (): Promise<TeacherAvailability> => {
  try {
    const { data } = await apiClient.get<ApiResponse<TeacherAvailability>>(
      '/api/schedules/teacher-availability'
    );

    return data.data;
  } catch (error) {
    const { message, details } = extractErrorDetails(error);
    throwWithDetails(message, details);
  }
};

// ============================================================================
// ✨ SERVICE EXPORT
// ============================================================================

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
