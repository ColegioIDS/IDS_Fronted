import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  CourseGrade, 
  CourseGradeWithRelations,
  CourseGradeFormValues,
  CourseGradeFilters
} from '@/types/course-grade.types';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== COURSE GRADES ====================

/**
 * Obtiene todas las relaciones curso-grado
 * @param filters Filtros opcionales (courseId, gradeId, isCore)
 */
export const getCourseGrades = async (
  filters?: CourseGradeFilters
): Promise<CourseGradeWithRelations[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId.toString());
    if (filters?.gradeId) params.append('gradeId', filters.gradeId.toString());
    if (filters?.isCore !== undefined) params.append('isCore', filters.isCore.toString());

    const { data } = await apiClient.get<ApiResponse<CourseGradeWithRelations[]>>(
      '/api/course-grades',
      { params }
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener relaciones curso-grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener relaciones curso-grado');
  }
};

/**
 * Obtiene una relación curso-grado por ID
 */
export const getCourseGradeById = async (id: number): Promise<CourseGradeWithRelations> => {
  try {
    const { data } = await apiClient.get<ApiResponse<CourseGradeWithRelations>>(
      `/api/course-grades/${id}`
    );
    if (!data.success) throw new Error(data.message || 'Error al obtener la relación curso-grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la relación curso-grado');
  }
};

/**
 * Crea una nueva relación curso-grado
 */
export const createCourseGrade = async (
  courseGradeData: CourseGradeFormValues
): Promise<CourseGradeWithRelations> => {
  try {
    const { data } = await apiClient.post<ApiResponse<CourseGradeWithRelations>>(
      '/api/course-grades', 
      courseGradeData
    );
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear relación curso-grado');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear relación curso-grado');
  }
};

/**
 * Actualiza una relación curso-grado
 */
export const updateCourseGrade = async (
  id: number,
  courseGradeData: Partial<CourseGradeFormValues>
): Promise<CourseGradeWithRelations> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<CourseGradeWithRelations>>(
      `/api/course-grades/${id}`, 
      courseGradeData
    );
    if (!data.success) throw new Error(data.message || 'Error al actualizar relación curso-grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar relación curso-grado');
  }
};

/**
 * Elimina una relación curso-grado
 */
export const deleteCourseGrade = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/course-grades/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar relación curso-grado');
  } catch (error) {
    handleApiError(error, 'Error al eliminar relación curso-grado');
  }
};

/**
 * Obtiene relaciones por curso
 */
export const getCourseGradesByCourse = async (
  courseId: number
): Promise<CourseGradeWithRelations[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<CourseGradeWithRelations[]>>(
      `/api/course-grades/by-course/${courseId}`
    );
    if (!data.success) throw new Error(data.message || 'Error al obtener relaciones por curso');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener relaciones por curso');
  }
};

/**
 * Obtiene relaciones por grado
 */
export const getCourseGradesByGrade = async (
  gradeId: number
): Promise<CourseGradeWithRelations[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<CourseGradeWithRelations[]>>(
      `/api/course-grades/by-grade/${gradeId}`
    );
    if (!data.success) throw new Error(data.message || 'Error al obtener relaciones por grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener relaciones por grado');
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