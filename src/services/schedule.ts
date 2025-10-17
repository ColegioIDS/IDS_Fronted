// src/services/schedule.ts

import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  Schedule, 
  ScheduleFormValues, 
  ScheduleFormData,        // ✅ NUEVO
  TeacherAvailability      // ✅ NUEVO
} from '@/types/schedules';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== NUEVOS ENDPOINTS CONSOLIDADOS ====================

// ✅ NUEVO: Obtener datos consolidados del formulario
export const getScheduleFormData = async (): Promise<ScheduleFormData> => {
  try {
    const { data } = await apiClient.get<ApiResponse<ScheduleFormData>>(
      '/api/schedules/form-data'
    );
    if (!data.success) throw new Error(data.message || 'Error al obtener datos del formulario');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener datos del formulario');
  }
};

// ✅ NUEVO: Obtener disponibilidad de maestros
export const getTeacherAvailability = async (): Promise<TeacherAvailability> => {
  try {
    const { data } = await apiClient.get<ApiResponse<TeacherAvailability>>(
      '/api/schedules/teacher-availability'
    );
    if (!data.success) throw new Error(data.message || 'Error al obtener disponibilidad');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener disponibilidad de maestros');
  }
};

// ==================== SCHEDULES ====================

export const getSchedules = async (filters?: {
  sectionId?: number;
  courseId?: number;
  teacherId?: number;
  dayOfWeek?: number;
}): Promise<Schedule[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Schedule[]>>('/api/schedules', {
      params: filters
    });
    if (!data.success) throw new Error(data.message || 'Error al obtener horarios');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener horarios');
  }
};

export const getScheduleById = async (id: number): Promise<Schedule> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Schedule>>(`/api/schedules/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener el horario');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el horario');
  }
};

export const getSchedulesBySection = async (sectionId: number): Promise<Schedule[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Schedule[]>>(`/api/schedules/section/${sectionId}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener horarios por sección');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener horarios por sección');
  }
};

export const getSchedulesByTeacher = async (teacherId: number): Promise<Schedule[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Schedule[]>>(`/api/schedules/teacher/${teacherId}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener horarios por profesor');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener horarios por profesor');
  }
};

export const createSchedule = async (scheduleData: ScheduleFormValues): Promise<Schedule> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Schedule>>('/api/schedules', scheduleData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear horario');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear horario');
  }
};

export const updateSchedule = async (
  id: number,
  scheduleData: Partial<ScheduleFormValues>
): Promise<Schedule> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<Schedule>>(
      `/api/schedules/${id}`,
      scheduleData
    );
    if (!data.success) throw new Error(data.message || 'Error al actualizar horario');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar horario');
  }
};

export const deleteSchedule = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/schedules/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar horario');
  } catch (error) {
    handleApiError(error, 'Error al eliminar horario');
  }
};

export const batchSaveSchedules = async (schedules: ScheduleFormValues[]): Promise<Schedule[]> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Schedule[]>>('/api/schedules/batch', {
      schedules
    });
    if (!data.success) throw new Error(data.message || 'Error al guardar horarios');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al guardar horarios masivamente');
  }
};

export const deleteSchedulesBySection = async (sectionId: number, keepIds: number[] = []): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/schedules/section/${sectionId}`, {
      data: { keepIds }
    });
    if (!data.success) throw new Error(data.message || 'Error al limpiar horarios');
  } catch (error) {
    handleApiError(error, 'Error al limpiar horarios de la sección');
  }
};

// ==================== UTILS ====================
function handleApiError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || fallbackMessage;
    const details = error.response?.data?.details || [];
    const err = new Error(message);
    (err as any).details = details;
    (err as any).response = error.response;
    throw err;
  }
  if (error instanceof Error) throw error;
  throw new Error(fallbackMessage);
}