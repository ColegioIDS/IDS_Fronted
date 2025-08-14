import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { Grade, GradeFormValues } from '@/types/grades';
import { ScheduleConfig, CreateScheduleConfigDto, UpdateScheduleConfigDto } from '@/types/schedule-config';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== GRADES ====================
export const getGrades = async (): Promise<Grade[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Grade[]>>('/api/grades');
    if (!data.success) throw new Error(data.message || 'Error al obtener grados');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener grados');
  }
};

export const getGradeById = async (id: number): Promise<Grade> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Grade>>(`/api/grades/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener el grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el grado');
  }
};

export const createGrade = async (gradeData: GradeFormValues): Promise<Grade> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Grade>>('/api/grades', gradeData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear grado');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear grado');
  }
};

export const updateGrade = async (
  id: number,
  gradeData: Partial<GradeFormValues>
): Promise<Grade> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<Grade>>(`/api/grades/${id}`, gradeData);
    if (!data.success) throw new Error(data.message || 'Error al actualizar grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar grado');
  }
};

// ==================== SCHEDULE CONFIG ====================
export const getScheduleConfigs = async (): Promise<ScheduleConfig[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<ScheduleConfig[]>>('/api/schedule-configs');
    if (!data.success) throw new Error(data.message || 'Error al obtener configuraciones');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener configuraciones');
  }
};

export const getScheduleConfigById = async (id: number): Promise<ScheduleConfig> => {
  try {
    const { data } = await apiClient.get<ApiResponse<ScheduleConfig>>(`/api/schedule-configs/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener la configuración');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la configuración');
  }
};

export const getScheduleConfigBySection = async (sectionId: number): Promise<ScheduleConfig> => {
  try {
    const { data } = await apiClient.get<ApiResponse<ScheduleConfig>>(`/api/schedule-configs/by-section/${sectionId}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener la configuración por sección');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la configuración por sección');
  }
};

export const createScheduleConfig = async (
  configData: CreateScheduleConfigDto
): Promise<ScheduleConfig> => {
  try {
    const { data } = await apiClient.post<ApiResponse<ScheduleConfig>>('/api/schedule-configs', configData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear configuración');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear configuración');
  }
};

export const updateScheduleConfig = async (
  id: number,
  configData: UpdateScheduleConfigDto
): Promise<ScheduleConfig> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<ScheduleConfig>>(`/api/schedule-configs/${id}`, configData);
    if (!data.success) throw new Error(data.message || 'Error al actualizar configuración');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar configuración');
  }
};

export const deleteScheduleConfig = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/schedule-configs/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar configuración');
  } catch (error) {
    handleApiError(error, 'Error al eliminar configuración');
  }
};

// ==================== UTILS ====================
function handleApiError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || fallbackMessage;
    const details = error.response?.data?.details || [];
    const err = new Error(message);
    (err as any).details = details;
    throw err;
  }
  if (error instanceof Error) throw error;
  throw new Error(fallbackMessage);
}