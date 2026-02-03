// src/services/erica-history.service.ts

import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  EricaHistoryFilters, 
  EricaHistoryFilterResponse,
  BimesterCompleteResponse,
  BimesterCompleteReport,
  CascadeResponse,
} from '@/types/erica-history';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== ERROR HANDLING ====================

const handleApiError = (error: any, fallbackMessage: string) => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  if (error.message) {
    throw new Error(error.message);
  }
  throw new Error(fallbackMessage);
};

// ==================== CASCADE ENDPOINT ====================

/**
 * Obtener datos en cascada para ERICA History
 * Endpoint centralizado: GET /api/erica-history/cascade
 *
 * @param includeInactive - Incluir items inactivos en la respuesta
 * @returns Estructura de cascada con ciclo, bimestres, semanas, grados, secciones y cursos
 */
export const getCascadeData = async (includeInactive = false): Promise<CascadeResponse> => {
  try {
    const params = includeInactive ? '?includeInactive=true' : '';
    const { data } = await apiClient.get<ApiResponse<CascadeResponse>>(
      `/api/erica-history/cascade${params}`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener datos de cascada');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener datos de cascada de ERICA History');
    throw error;
  }
};

// ==================== REPORTS ENDPOINT ====================

/**
 * Obtener evaluaciones filtradas por diversos criterios
 * Nuevo endpoint que devuelve evaluaciones agrupadas por semana
 *
 * @param filters - Filtros (bimesterId, courseId, sectionId, gradeId, weekId)
 * @returns Evaluaciones agrupadas por semana con resumen
 */
export const getEvaluationsByFilters = async (
  filters: EricaHistoryFilters
): Promise<EricaHistoryFilterResponse> => {
  try {
    const params = new URLSearchParams();

    // Mapear los filtros
    if (filters.bimesterId) params.append('bimesterId', filters.bimesterId.toString());
    if (filters.courseId) params.append('courseId', filters.courseId.toString());
    if (filters.sectionId) params.append('sectionId', filters.sectionId.toString());
    if (filters.gradeId) params.append('gradeId', filters.gradeId.toString());
    if (filters.weekId) params.append('weekId', filters.weekId.toString());

    const queryString = params.toString();
    const url = `/api/erica-history/evaluations${queryString ? `?${queryString}` : ''}`;

    const { data } = await apiClient.get<{ success: boolean; data: EricaHistoryFilterResponse }>(url);

    if (!data.success) {
      throw new Error('Error al obtener evaluaciones');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener evaluaciones filtradas');
    throw error;
  }
};

/**
 * Obtener estructura completa de un bimestre con todas sus semanas y evaluaciones
 * Este endpoint se usa cuando el usuario quiere ver TODO el bimestre (no una semana específica)
 *
 * @param bimesterId - ID del bimestre
 * @param courseId - ID del curso
 * @param sectionId - ID de la sección
 * @returns Estructura completa del bimestre con semanas y evaluaciones
 */
export const getBimesterComplete = async (
  bimesterId: number,
  courseId: number,
  sectionId: number
): Promise<BimesterCompleteResponse> => {
  try {
    const url = `/api/erica-evaluations/by-bimestre/${bimesterId}/complete?courseId=${courseId}&sectionId=${sectionId}`;
    const { data } = await apiClient.get<BimesterCompleteReport>(url);

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener estructura del bimestre');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener estructura del bimestre');
    throw error;
  }
};

// ==================== COLOR ENDPOINTS ====================

/**
 * Obtener colores para dimensiones ERICA (E, R, I, C, A)
 * Endpoint: GET /api/erica-history/dimension-colors
 *
 * @returns Array de objetos con información de colores para cada dimensión
 */
export const getDimensionColors = async (): Promise<Array<{
  id: number;
  dimension: string;
  name: string;
  description: string;
  hexColor: string;
  isActive: boolean;
}>> => {
  try {
    const { data } = await apiClient.get<ApiResponse<any>>(
      `/api/erica-history/dimension-colors`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener colores de dimensiones');
    }

    return data.data.data || [];
  } catch (error) {
    handleApiError(error, 'Error al obtener colores de dimensiones');
    throw error;
  }
};

/**
 * Obtener colores para estados de evaluación (E, B, P, C, N)
 * Endpoint: GET /api/erica-history/state-colors
 *
 * @returns Array de objetos con información de colores para cada estado
 */
export const getStateColors = async (): Promise<Array<{
  id: number;
  state: string;
  name: string;
  description: string;
  hexColor: string;
  points: number;
  isActive: boolean;
}>> => {
  try {
    const { data } = await apiClient.get<ApiResponse<any>>(
      `/api/erica-history/state-colors`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener colores de estados');
    }

    return data.data.data || [];
  } catch (error) {
    handleApiError(error, 'Error al obtener colores de estados');
    throw error;
  }
};

// ==================== EXPORT SERVICE ====================

export const ericaHistoryService = {
  getCascadeData,
  getEvaluationsByFilters,
  getBimesterComplete,
  getDimensionColors,
  getStateColors,
};
