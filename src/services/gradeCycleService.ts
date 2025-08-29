// ==========================================
// src/services/gradeCycleService.ts
// ==========================================

import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  GradeCycle,
  GradeCycleWithSections,
  CycleStats,
  CycleSummary,
  CourseForCycle,
  CreateGradeCycleRequest,
  BulkCreateGradeCycleRequest,
  GradeCycleFilters
} from '@/types/gradeCycles';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== GRADE CYCLES CRUD ====================

/**
 * Crear una relación grado-ciclo individual
 */
export const createGradeCycle = async (data: CreateGradeCycleRequest): Promise<GradeCycle> => {
  try {
    const { data: response } = await apiClient.post<ApiResponse<GradeCycle>>('/api/grade-cycles', data);
    if (!response.success) {
      const error = new Error(response.message || 'Error al crear relación grado-ciclo');
      (error as any).details = response.details ?? [];
      throw error;
    }
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al crear relación grado-ciclo');
  }
};

/**
 * Configurar múltiples grados para un ciclo (usado al crear/editar ciclo)
 */
export const bulkCreateGradeCycles = async (data: BulkCreateGradeCycleRequest): Promise<GradeCycle[]> => {
  try {
    const { data: response } = await apiClient.post<ApiResponse<GradeCycle[]>>('/api/grade-cycles/bulk', data);
    if (!response.success) {
      const error = new Error(response.message || 'Error al configurar grados del ciclo');
      (error as any).details = response.details ?? [];
      throw error;
    }
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al configurar grados del ciclo');
  }
};

/**
 * Obtener todos los grados de un ciclo específico
 */
export const getGradeCyclesByCycle = async (cycleId: number): Promise<GradeCycle[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<GradeCycle[]>>(`/api/grade-cycles/by-cycle/${cycleId}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener grados del ciclo');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener grados del ciclo');
  }
};

/**
 * Obtener todos los ciclos de un grado específico (historial)
 */
export const getGradeCyclesByGrade = async (gradeId: number): Promise<GradeCycle[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<GradeCycle[]>>(`/api/grade-cycles/by-grade/${gradeId}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener historial del grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener historial del grado');
  }
};

/**
 * Eliminar un grado de un ciclo
 */
export const deleteGradeCycle = async (cycleId: number, gradeId: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/grade-cycles/${cycleId}/${gradeId}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar grado del ciclo');
  } catch (error) {
    handleApiError(error, 'Error al eliminar grado del ciclo');
  }
};

// ==================== ENDPOINTS PARA FORMULARIOS ====================

/**
 * Obtener grados disponibles para matrícula en un ciclo
 * Para formulario de matrícula - incluye capacidad y espacios disponibles
 */
export const getAvailableGradesForEnrollment = async (cycleId: number): Promise<GradeCycleWithSections[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<GradeCycleWithSections[]>>(
      `/api/grade-cycles/${cycleId}/available-grades`
    );
    if (!data.success) throw new Error(data.message || 'Error al obtener grados disponibles');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener grados disponibles para matrícula');
  }
};

/**
 * Obtener cursos disponibles para grados activos en un ciclo
 * Para formulario de asignación de profesores
 */
export const getAvailableCoursesForCycle = async (cycleId: number): Promise<CourseForCycle[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<CourseForCycle[]>>(
      `/api/grade-cycles/${cycleId}/available-courses`
    );
    if (!data.success) throw new Error(data.message || 'Error al obtener cursos disponibles');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener cursos disponibles para el ciclo');
  }
};

// ==================== REPORTES Y ESTADÍSTICAS ====================

/**
 * Obtener estadísticas del ciclo (capacidad, matrícula, etc.)
 */
export const getCycleStats = async (cycleId: number): Promise<CycleStats[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<CycleStats[]>>(`/api/grade-cycles/${cycleId}/stats`);
    if (!data.success) throw new Error(data.message || 'Error al obtener estadísticas del ciclo');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener estadísticas del ciclo');
  }
};

/**
 * Obtener resumen de configuración del ciclo
 */
export const getCycleSummary = async (cycleId: number): Promise<CycleSummary> => {
  try {
    const { data } = await apiClient.get<ApiResponse<CycleSummary>>(`/api/grade-cycles/${cycleId}/summary`);
    if (!data.success) throw new Error(data.message || 'Error al obtener resumen del ciclo');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener resumen del ciclo');
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