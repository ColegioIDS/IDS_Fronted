//src\services\useCourses.ts
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { Course, CourseFormValues, CourseFilters, CourseGradeRelation } from '@/types/courses';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== COURSES ====================
export const getCourses = async (filters?: CourseFilters): Promise<Course[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }
    
    if (filters?.area) {
      params.append('area', filters.area);
    }
    
    if (filters?.searchQuery) {
      params.append('search', filters.searchQuery);
    }

    const { data } = await apiClient.get<ApiResponse<Course[]>>('/api/courses', { params });
    if (!data.success) throw new Error(data.message || 'Error al obtener cursos');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener cursos');
  }
};

export const getCourseById = async (id: number): Promise<Course> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Course>>(`/api/courses/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener el curso');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el curso');
  }
};

export const createCourse = async (courseData: CourseFormValues): Promise<Course> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Course>>('/api/courses', courseData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear curso');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear curso');
  }
};

export const updateCourse = async (
  id: number,
  courseData: Partial<CourseFormValues>
): Promise<Course> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<Course>>(`/api/courses/${id}`, courseData);
    if (!data.success) throw new Error(data.message || 'Error al actualizar curso');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar curso');
  }
};

export const deleteCourse = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/courses/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar curso');
  } catch (error) {
    handleApiError(error, 'Error al eliminar curso');
  }
};

// ==================== COURSE GRADES ====================
export const getCourseGrades = async (courseId: number): Promise<CourseGradeRelation[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<CourseGradeRelation[]>>(
      `/api/courses/${courseId}`
    );
    if (!data.success) throw new Error(data.message || 'Error al obtener grados del curso');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener grados del curso');
  }
};

export const addCourseGrade = async (
  courseId: number,
  gradeId: number,
  isCore: boolean = true
): Promise<CourseGradeRelation> => {
  try {
    const { data } = await apiClient.post<ApiResponse<CourseGradeRelation>>(
      `/api/courses/${courseId}/grades`,
      { gradeId, isCore }
    );
    if (!data.success) throw new Error(data.message || 'Error al agregar grado al curso');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al agregar grado al curso');
  }
};

export const updateCourseGrade = async (
  courseId: number,
  gradeId: number,
  isCore: boolean
): Promise<CourseGradeRelation> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<CourseGradeRelation>>(
      `/api/courses/${courseId}/grades/${gradeId}`,
      { isCore }
    );
    if (!data.success) throw new Error(data.message || 'Error al actualizar relación curso-grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar relación curso-grado');
  }
};

export const removeCourseGrade = async (courseId: number, gradeId: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `/api/courses/${courseId}/grades/${gradeId}`
    );
    if (!data.success) throw new Error(data.message || 'Error al remover grado del curso');
  } catch (error) {
    handleApiError(error, 'Error al remover grado del curso');
  }
};

// ==================== NUEVOS ENDPOINTS PARA COURSE ASSIGNMENTS ====================

/**
 * Obtener cursos de un grado específico (desde el módulo de cursos)
 * Endpoint: GET /api/courses/by-grade/:gradeId
 * Alternativa a getGradeCourses desde gradeService
 */
export const getCoursesByGrade = async (gradeId: number) => {
  try {
    const { data } = await apiClient.get(`/api/courses/by-grade/${gradeId}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener cursos del grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener cursos del grado');
  }
};

/**
 * CORREGIR: Esta función ya existe pero está mal implementada
 * Debe obtener cursos de UN GRADO, no de UN CURSO
 */
// Reemplaza tu función getCourseGrades existente con esta:
export const getCourseGradesID = async (gradeId: number) => {
  try {
    // Usar el endpoint de grades que es más semánticamente correcto
    const { data } = await apiClient.get(`/api/grades/${gradeId}/courses`);
    if (!data.success) throw new Error(data.message || 'Error al obtener cursos del grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener cursos del grado');
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