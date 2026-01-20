// src/services/erica-evaluations.service.ts

import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import {
  EricaEvaluation,
  EricaDimension,
  CascadeResponse,
  EvaluationGridResponse,
  EvaluationGridData,
  SaveGridRequest,
  SaveGridResult,
  CreateEricaEvaluationRequest,
  UpdateEricaEvaluationRequest,
  TopicStats,
  EvaluationFilters,
  EricaEvaluationWithRelations,
} from '@/types/erica-evaluations';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const BASE_URL = '/api/erica-evaluations';

export const ericaEvaluationsService = {
  /**
   * Obtener datos en cascada (ciclo → bimestres → semanas → grados → secciones → cursos)
   * Este es el primer endpoint a llamar para inicializar la navegación
   */
  async getCascadeData(includeInactive = false): Promise<CascadeResponse> {
    const params = includeInactive ? '?includeInactive=true' : '';
    const response = await apiClient.get<ApiResponse<CascadeResponse>>(
      `${BASE_URL}/cascade${params}`
    );
    
    // Handle business logic errors (success: false with 200 status)
    if (!response.data.success) {
      const errorData = response.data as unknown as {
        success: false;
        errorCode?: string;
        errorType?: string;
        message?: string;
        detail?: string;
      };
      const error = new Error(errorData.message || 'Error al obtener datos');
      (error as Error & { errorCode?: string; errorType?: string; detail?: string }).errorCode = errorData.errorCode;
      (error as Error & { errorCode?: string; errorType?: string; detail?: string }).errorType = errorData.errorType;
      (error as Error & { errorCode?: string; errorType?: string; detail?: string }).detail = errorData.detail;
      throw error;
    }
    
    return response.data.data;
  },

  /**
   * Obtener grid de evaluación por enrollmentId y weekId
   */
  async getEvaluationGrid(enrollmentId: number, weekId: number): Promise<EvaluationGridResponse> {
    const response = await apiClient.get<ApiResponse<EvaluationGridResponse>>(
      `${BASE_URL}/grid/${enrollmentId}/${weekId}`
    );
    return response.data.data;
  },

  /**
   * Obtener grid de evaluación por topicId
   */
  async getGridByTopic(topicId: number, includeEmpty = false): Promise<EvaluationGridResponse> {
    const params = includeEmpty ? '?includeEmpty=true' : '';
    const response = await apiClient.get<ApiResponse<any>>(
      `${BASE_URL}/grid/topic/${topicId}${params}`
    );
    
    const rawData = response.data.data;
    
    // Transformar la estructura del backend al formato esperado
    const transformedStudents = (rawData.students || []).map((item: any) => {
      const enrollment = item.enrollment;
      const student = enrollment.student;
      const studentName = `${student.lastNames}, ${student.givenNames}`;
      
      // Crear objeto con evaluaciones mapeadas por dimensión
      const result: any = {
        enrollmentId: enrollment.id,
        studentName: studentName,
        EJECUTA: null,
        RETIENE: null,
        INTERPRETA: null,
        CONOCE: null,
        APLICA: null,
      };
      
      // Mapear evaluaciones por dimensión usando el code como clave
      if (item.evaluations && Array.isArray(item.evaluations)) {
        item.evaluations.forEach((evaluationItem: any) => {
          // El code es E, R, I, C, A - necesitamos mapear a EJECUTA, RETIENE, etc.
          const dimensionMap: Record<string, EricaDimension> = {
            'E': 'EJECUTA',
            'R': 'RETIENE',
            'I': 'INTERPRETA',
            'C': 'CONOCE',
            'A': 'APLICA',
          };
          
          const dimension = dimensionMap[evaluationItem.code];
          if (dimension && evaluationItem.evaluation) {
            result[dimension] = {
              state: evaluationItem.evaluation.state,
              points: evaluationItem.evaluation.points || 0,
              notes: evaluationItem.evaluation.notes,
            };
          }
        });
      }
      
      return result as EvaluationGridData;
    });
    
    return {
      ...rawData,
      students: transformedStudents,
    };
  },

  /**
   * Guardar grid de evaluación por tema
   * El backend extrae automáticamente courseId y bimesterId del topic
   */
  async saveEvaluationGridByTopic(topicId: number, data: SaveGridRequest): Promise<SaveGridResult> {
    try {
      const response = await apiClient.post<any>(
        `${BASE_URL}/grid/topic/${topicId}`,
        data
      );
      
     
      const responseData = response.data;
      
      // Manejar errores de negocio (success: false)
      if (!responseData.success) {
        const error = new Error(responseData.message || 'Error al guardar evaluaciones');
        if (responseData.details) {
          (error as any).details = responseData.details;
        }
        throw error;
      }
      
      // La respuesta viene como response.data directamente (no envuelta en .data)
      // Retornar el objeto completo que contiene success, evaluationsProcessed, message
      return responseData as SaveGridResult;
    } catch (err: any) {
      
      // Si es error de negocio ya formateado, re-lanzar
      if (err.details || err.message?.includes('evaluations')) {
        throw err;
      }
      
      // Si es error HTTP
      if (err.response?.data) {
        const errorData = err.response.data as any;
        const error = new Error(errorData.message || err.message || 'Error al guardar evaluaciones');
        if (errorData.details) {
          (error as any).details = errorData.details;
        }
        throw error;
      }
      
      // Error genérico
      throw err;
    }
  },

  /**
   * Crear evaluación individual
   */
  async createEvaluation(data: CreateEricaEvaluationRequest): Promise<EricaEvaluation> {
    const response = await apiClient.post<ApiResponse<EricaEvaluation>>(BASE_URL, data);
    return response.data.data;
  },

  /**
   * Actualizar evaluación
   */
  async updateEvaluation(id: number, data: UpdateEricaEvaluationRequest): Promise<EricaEvaluation> {
    const response = await apiClient.put<ApiResponse<EricaEvaluation>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  /**
   * Eliminar evaluación
   */
  async deleteEvaluation(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Obtener evaluaciones del estudiante por curso
   */
  async getEvaluationsByEnrollmentAndCourse(
    enrollmentId: number,
    courseId: number,
    filters?: Pick<EvaluationFilters, 'dimension' | 'startWeek' | 'endWeek'>
  ): Promise<EricaEvaluationWithRelations[]> {
    const params = new URLSearchParams();
    if (filters?.dimension) params.append('dimension', filters.dimension);
    if (filters?.startWeek) params.append('startWeek', filters.startWeek.toString());
    if (filters?.endWeek) params.append('endWeek', filters.endWeek.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<ApiResponse<EricaEvaluationWithRelations[]>>(
      `${BASE_URL}/enrollment/${enrollmentId}/course/${courseId}${queryString}`
    );
    return response.data.data;
  },

  /**
   * Obtener evaluaciones por sección y semana
   */
  async getEvaluationsBySectionAndWeek(
    sectionId: number,
    weekId: number
  ): Promise<EricaEvaluationWithRelations[]> {
    const response = await apiClient.get<ApiResponse<EricaEvaluationWithRelations[]>>(
      `${BASE_URL}/section/${sectionId}/week/${weekId}`
    );
    return response.data.data;
  },

  /**
   * Obtener estadísticas de tema
   */
  async getTopicStats(topicId: number): Promise<TopicStats> {
    const response = await apiClient.get<ApiResponse<TopicStats>>(
      `${BASE_URL}/topic/${topicId}/stats`
    );
    return response.data.data;
  },
};
