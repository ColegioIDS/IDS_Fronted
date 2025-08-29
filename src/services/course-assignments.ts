// ==================== SERVICES ====================
// services/course-assignments.ts

import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  CourseAssignment,
  TeacherCourse,
  GradeCourseConfig,
  CreateCourseAssignmentRequest,
  UpdateCourseAssignmentRequest,
  BulkUpdateRequest,
  CourseAssignmentFilters,
  CourseAssignmentResponse,
  CourseAssignmentStats,
  AssignmentType  
} from '@/types/course-assignments';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== COURSE ASSIGNMENTS ====================

// Obtener todas las asignaciones (con filtros opcionales)
export const getCourseAssignments = async (
  filters?: CourseAssignmentFilters
): Promise<CourseAssignment[] | CourseAssignmentResponse> => {
  try {
    let url = '/api/course-assignments';
    
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const { data } = await apiClient.get<ApiResponse<CourseAssignment[]>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener asignaciones');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener asignaciones de cursos');
  }
};

// Obtener asignación por ID
export const getCourseAssignmentById = async (id: number): Promise<CourseAssignment> => {
  try {
    const { data } = await apiClient.get<ApiResponse<CourseAssignment>>(`/api/course-assignments/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener la asignación');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la asignación');
  }
};

// Crear asignación
export const createCourseAssignment = async (
  assignmentData: CreateCourseAssignmentRequest
): Promise<CourseAssignment> => {
  try {
    const { data } = await apiClient.post<ApiResponse<CourseAssignment>>(
      '/api/course-assignments', 
      assignmentData
    );
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear asignación');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear asignación');
  }
};

// Actualizar asignación
export const updateCourseAssignment = async (
  id: number,
  assignmentData: UpdateCourseAssignmentRequest
): Promise<CourseAssignment> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<CourseAssignment>>(
      `/api/course-assignments/${id}`, 
      assignmentData
    );
    if (!data.success) throw new Error(data.message || 'Error al actualizar asignación');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar asignación');
  }
};

// Eliminar asignación
export const deleteCourseAssignment = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/course-assignments/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar asignación');
  } catch (error) {
    handleApiError(error, 'Error al eliminar asignación');
  }
};

// Actualización masiva (para el configurador)
export const bulkUpdateCourseAssignments = async (
  bulkData: BulkUpdateRequest
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      '/api/course-assignments/bulk-update', 
      bulkData
    );
    console.log("Resultado de la actualización masiva:", data);
    if (!data.success) throw new Error(data.message || 'Error en actualización masiva');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error en actualización masiva');
  }
};

// Obtener configuración de cursos por grado
export const getGradeCourseConfig = async (gradeId: number): Promise<GradeCourseConfig[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<GradeCourseConfig[]>>(
      `/api/course-assignments/grade/${gradeId}`
    );
    if (!data.success) throw new Error(data.message || 'Error al obtener configuración del grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener configuración del grado');
  }
};

// Obtener cursos de un maestro
export const getTeacherCourses = async (
  teacherId: number, 
  sectionId?: number
): Promise<TeacherCourse[]> => {
  try {
    let url = `/api/course-assignments/teacher/${teacherId}/courses`;
    if (sectionId) {
      url += `?sectionId=${sectionId}`;
    }
    
    const { data } = await apiClient.get<ApiResponse<TeacherCourse[]>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener cursos del maestro');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener cursos del maestro');
  }
};

// Obtener asignaciones por sección
export const getSectionAssignments = async (sectionId: number): Promise<CourseAssignment[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<CourseAssignment[]>>(
      `/api/course-assignments/section/${sectionId}`
    );
    if (!data.success) throw new Error(data.message || 'Error al obtener asignaciones de la sección');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener asignaciones de la sección');
  }
};

// Inicializar asignaciones (poblar datos iniciales)
export const initializeCourseAssignments = async (): Promise<{
  success: boolean;
  message: string;
  totalAssignments: number;
}> => {
  try {
    const { data } = await apiClient.post<ApiResponse<{
      success: boolean;
      message: string;
      totalAssignments: number;
    }>>('/api/course-assignments/initialize');
    if (!data.success) throw new Error(data.message || 'Error al inicializar asignaciones');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al inicializar asignaciones');
  }
};

// Obtener estadísticas de asignaciones
export const getCourseAssignmentStats = async (): Promise<CourseAssignmentStats> => {
  try {
    const { data } = await apiClient.get<ApiResponse<CourseAssignmentStats>>(
      '/api/course-assignments/stats'
    );
    if (!data.success) throw new Error(data.message || 'Error al obtener estadísticas');
    return data.data;
  } catch (error) {
    // Si no existe el endpoint de stats, generar estadísticas básicas
    try {
      const assignments = await getCourseAssignments();
      const assignmentsArray = Array.isArray(assignments) ? assignments : assignments.data;
      
      const stats: CourseAssignmentStats = {
        totalAssignments: assignmentsArray.length,
        titularAssignments: assignmentsArray.filter(a => a.assignmentType === 'titular').length,
        specialistAssignments: assignmentsArray.filter(a => a.assignmentType === 'specialist').length,
        activeAssignments: assignmentsArray.filter(a => a.isActive).length,
        inactiveAssignments: assignmentsArray.filter(a => !a.isActive).length,
        assignmentsByType: [
          { 
            type: 'titular' as AssignmentType, 
            count: assignmentsArray.filter(a => a.assignmentType === 'titular').length 
          },
          { 
            type: 'specialist' as AssignmentType, 
            count: assignmentsArray.filter(a => a.assignmentType === 'specialist').length 
          },
        ],
        teachersWithSpecialties: new Set(
          assignmentsArray
            .filter(a => a.assignmentType === 'specialist')
            .map(a => a.teacherId)
        ).size
      };
      
      return stats;
    } catch (fallbackError) {
      handleApiError(error, 'Error al obtener estadísticas de asignaciones');
    }
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