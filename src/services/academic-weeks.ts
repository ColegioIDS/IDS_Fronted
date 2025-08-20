import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  AcademicWeek, 
  AcademicWeekFormValues, 
  UpdateAcademicWeekFormValues,
  AcademicWeekFilters,
  GenerateWeeksRequest,
  CurrentWeekResponse
} from '@/types/academic-week.types';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== ACADEMIC WEEKS ====================

// Obtener todas las semanas académicas con filtros opcionales
export const getAcademicWeeks = async (filters?: AcademicWeekFilters): Promise<AcademicWeek[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.bimesterId) params.append('bimesterId', filters.bimesterId.toString());
    if (filters?.number) params.append('number', filters.number.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/api/academic-weeks?${queryString}` : '/api/academic-weeks';
    
    const { data } = await apiClient.get<ApiResponse<AcademicWeek[]>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener semanas académicas');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener semanas académicas');
  }
};

// Obtener una semana académica por ID
export const getAcademicWeekById = async (id: number): Promise<AcademicWeek> => {
  try {
    const { data } = await apiClient.get<ApiResponse<AcademicWeek>>(`/api/academic-weeks/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener la semana académica');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la semana académica');
  }
};

// Obtener semanas académicas por bimestre
export const getAcademicWeeksByBimester = async (bimesterId: number): Promise<AcademicWeek[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<AcademicWeek[]>>(`/api/academic-weeks/bimester/${bimesterId}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener semanas del bimestre');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener semanas del bimestre');
  }
};

// Obtener semana específica por bimestre y número
export const getAcademicWeekByNumber = async (bimesterId: number, number: number): Promise<AcademicWeek> => {
  try {
    const { data } = await apiClient.get<ApiResponse<AcademicWeek>>(`/api/academic-weeks/bimester/${bimesterId}/week/${number}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener la semana específica');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la semana específica');
  }
};

// Obtener la semana académica actual
export const getCurrentWeek = async (): Promise<CurrentWeekResponse> => {
  try {
    const { data } = await apiClient.get<ApiResponse<CurrentWeekResponse>>('/api/academic-weeks/current');
    if (!data.success) throw new Error(data.message || 'Error al obtener la semana actual');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la semana actual');
  }
};

// Crear una nueva semana académica
export const createAcademicWeek = async (weekData: AcademicWeekFormValues): Promise<AcademicWeek> => {
  try {
    const { data } = await apiClient.post<ApiResponse<AcademicWeek>>('/api/academic-weeks', weekData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear semana académica');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear semana académica');
  }
};

// Actualizar una semana académica
export const updateAcademicWeek = async (
  id: number,
  weekData: UpdateAcademicWeekFormValues
): Promise<AcademicWeek> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<AcademicWeek>>(`/api/academic-weeks/${id}`, weekData);
    if (!data.success) throw new Error(data.message || 'Error al actualizar semana académica');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar semana académica');
  }
};

// Eliminar una semana académica
export const deleteAcademicWeek = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/academic-weeks/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar semana académica');
  } catch (error) {
    handleApiError(error, 'Error al eliminar semana académica');
  }
};

// Generar semanas automáticamente para un bimestre
export const generateWeeksForBimester = async (
  bimesterId: number,
  options?: GenerateWeeksRequest
): Promise<AcademicWeek[]> => {
  try {
    const params = new URLSearchParams();
    if (options?.weeksCount) params.append('weeksCount', options.weeksCount.toString());
    
    const queryString = params.toString();
    const url = queryString 
      ? `/api/academic-weeks/generate/${bimesterId}?${queryString}` 
      : `/api/academic-weeks/generate/${bimesterId}`;
    
    const { data } = await apiClient.post<ApiResponse<AcademicWeek[]>>(url);
    if (!data.success) {
      const error = new Error(data.message || 'Error al generar semanas académicas');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al generar semanas académicas');
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