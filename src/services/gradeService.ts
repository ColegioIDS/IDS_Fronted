import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { Grade, GradeFormValues } from '@/types/grades';
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