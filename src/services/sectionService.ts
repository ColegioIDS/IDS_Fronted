import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { Section, SectionFormValues } from '@/types/sections';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== SECTIONS ====================
export const getSections = async (gradeId?: number): Promise<Section[]> => {
  try {
    const url = gradeId ? `/api/sections?gradeId=${gradeId}` : '/api/sections';
    const { data } = await apiClient.get<ApiResponse<Section[]>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener secciones');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener secciones');
  }
};

export const getSectionById = async (id: number): Promise<Section> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Section>>(`/api/sections/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener la sección');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la sección');
  }
};

export const createSection = async (sectionData: SectionFormValues): Promise<Section> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Section>>('/api/sections', sectionData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear sección');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear sección');
  }
};

export const updateSection = async (
  id: number,
  sectionData: Partial<SectionFormValues>
): Promise<Section> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<Section>>(
      `/api/sections/${id}`,
      sectionData
    );
    if (!data.success) throw new Error(data.message || 'Error al actualizar sección');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar sección');
  }
};

export const deleteSection = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/sections/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar sección');
  } catch (error) {
    handleApiError(error, 'Error al eliminar sección');
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