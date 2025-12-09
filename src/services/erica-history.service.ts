// src/services/erica-history.service.ts

import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { ericaEvaluationsService } from './erica-evaluations.service';
import { 
  EricaHistoryFilters, 
  EricaHistoryFilterResponse, 
  EricaHistoryReport,
  BimesterCompleteResponse,
  BimesterCompleteReport,
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
 * Reutiliza el cascade de evaluations
 */
export const getCascadeData = async () => {
  return ericaEvaluationsService.getCascadeData();
};

// ==================== REPORTS ENDPOINT ====================

/**
 * Obtener evaluaciones filtradas por diversos criterios
 * Las evaluaciones se agrupan por semana académica con estadísticas completas
 *
 * @param filters - Filtros opcionales (bimesterId, courseId, sectionId, weekId, teacherId)
 * @returns Evaluaciones agrupadas por semana con estadísticas
 */
export const getEvaluationsByFilters = async (
  filters: EricaHistoryFilters
): Promise<EricaHistoryFilterResponse> => {
  try {
    const params = new URLSearchParams();

    // Mapear los IDs correctamente
    if (filters.bimesterId) params.append('bimesterId', filters.bimesterId.toString());
    if (filters.courseId) params.append('courseId', filters.courseId.toString());
    if (filters.sectionId) params.append('sectionId', filters.sectionId.toString());
    if (filters.weekId) params.append('weekId', filters.weekId.toString());
    if (filters.gradeId) params.append('gradeId', filters.gradeId.toString());
    if (filters.teacherId) params.append('teacherId', filters.teacherId.toString());

    const queryString = params.toString();
    const url = `/api/erica-evaluations/reports/by-filters${queryString ? `?${queryString}` : ''}`;

    const { data } = await apiClient.get<EricaHistoryReport>(url);

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener evaluaciones');
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

// ==================== EXPORT SERVICE ====================

export const ericaHistoryService = {
  getCascadeData,
  getEvaluationsByFilters,
  getBimesterComplete,
};
