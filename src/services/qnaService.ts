// ============================================
// 3. SERVICE - src/services/qnaService.ts
// ============================================

import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { ApiResponse } from '@/types/api';
import {
  EricaConfig,
  CalculatedResult,
  QnaGrid,
  CreateEricaConfigRequest,
  UpdateEricaConfigRequest,
  GetQnaGridRequest,
  RecalculateQnaRequest,
  StudentResultsResponse,
  BimesterCourseSummaryResponse,
  BimesterSectionStatsResponse,
  TeacherAnalyticsResponse,
  BimesterHealthResponse,
  ConfigFilters
} from '@/types/qna';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== CONFIGURACIONES ERICA ====================

// Crear configuración
export const createEricaConfig = async (configData: CreateEricaConfigRequest): Promise<EricaConfig> => {
  try {
    const { data } = await apiClient.post<ApiResponse<EricaConfig>>('/api/qna/configs', configData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear configuración');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear configuración ERICA');
  }
};

// Obtener todas las configuraciones
export const getEricaConfigs = async (filters?: ConfigFilters): Promise<EricaConfig[]> => {
  try {
    let url = '/api/qna/configs';
    
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
    
    const { data } = await apiClient.get<ApiResponse<EricaConfig[]>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener configuraciones');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener configuraciones ERICA');
  }
};

// Obtener configuración por clave
export const getEricaConfigByKey = async (configType: string, configKey: string): Promise<EricaConfig> => {
  try {
    const { data } = await apiClient.get<ApiResponse<EricaConfig>>(`/api/qna/configs/${configType}/${configKey}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener configuración');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener configuración ERICA');
  }
};

// Actualizar configuración
export const updateEricaConfig = async (
  id: number,
  configData: UpdateEricaConfigRequest
): Promise<EricaConfig> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<EricaConfig>>(`/api/qna/configs/${id}`, configData);
    if (!data.success) throw new Error(data.message || 'Error al actualizar configuración');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar configuración ERICA');
  }
};

// Eliminar configuración
export const deleteEricaConfig = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/qna/configs/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar configuración');
  } catch (error) {
    handleApiError(error, 'Error al eliminar configuración ERICA');
  }
};

// ==================== GRID QNA ====================

// Obtener grid QNA
/* export const getQnaGrid = async (params: GetQnaGridRequest): Promise<QnaGrid> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const { data } = await apiClient.get<ApiResponse<QnaGrid>>(`/api/qna/grid?${queryParams.toString()}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener grid QNA');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener grid QNA');
  }
}; */


export const getQnaGrid = async (params: GetQnaGridRequest): Promise<QnaGrid> => {
  try {
    const { data } = await apiClient.post<ApiResponse<QnaGrid>>(
      '/api/qna/grid',
      params // aquí se envía directamente el body
    );

    if (!data.success) throw new Error(data.message || 'Error al obtener grid QNA');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener grid QNA');
  }
};


// ==================== CÁLCULOS Y RECÁLCULOS ====================

// Recalcular resultados
export const recalculateQnaResults = async (recalculateData: RecalculateQnaRequest): Promise<{ success: boolean; calculatedResults: number; message: string }> => {
  try {
    const { data } = await apiClient.post<ApiResponse<{ success: boolean; calculatedResults: number; message: string }>>('/api/qna/recalculate', recalculateData);
    if (!data.success) throw new Error(data.message || 'Error al recalcular resultados');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al recalcular resultados QNA');
  }
};

// Recalcular bimestre completo
export const recalculateBimesterCourse = async (
  bimesterId: number,
  courseId: number,
  sectionId?: number
): Promise<{ success: boolean; calculatedResults: number; message: string }> => {
  try {
    let url = `/api/qna/recalculate/bimester/${bimesterId}/course/${courseId}`;
    if (sectionId) {
      url += `?sectionId=${sectionId}`;
    }
    
    const { data } = await apiClient.post<ApiResponse<{ success: boolean; calculatedResults: number; message: string }>>(url);
    if (!data.success) throw new Error(data.message || 'Error al recalcular bimestre');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al recalcular bimestre completo');
  }
};

// ==================== RESULTADOS CALCULADOS ====================

// Obtener resultados de estudiante
export const getStudentResults = async (
  enrollmentId: number,
  bimesterId: number,
  courseId: number,
  calculationType?: string
): Promise<StudentResultsResponse> => {
  try {
    let url = `/api/qna/results/enrollment/${enrollmentId}/bimester/${bimesterId}/course/${courseId}`;
    if (calculationType) {
      url += `?calculationType=${calculationType}`;
    }
    
    const { data } = await apiClient.get<ApiResponse<StudentResultsResponse>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener resultados del estudiante');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener resultados del estudiante');
  }
};

// Obtener resumen de bimestre y curso
export const getBimesterCourseSummary = async (
  bimesterId: number,
  courseId: number,
  sectionId?: number
): Promise<BimesterCourseSummaryResponse> => {
  try {
    let url = `/api/qna/results/bimester/${bimesterId}/course/${courseId}/summary`;
    if (sectionId) {
      url += `?sectionId=${sectionId}`;
    }
    
    const { data } = await apiClient.get<ApiResponse<BimesterCourseSummaryResponse>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener resumen del bimestre');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener resumen del bimestre');
  }
};

// ==================== ESTADÍSTICAS Y REPORTES ====================

// Obtener estadísticas de sección
export const getBimesterSectionStats = async (
  bimesterId: number,
  sectionId: number,
  courseId?: number
): Promise<BimesterSectionStatsResponse> => {
  try {
    let url = `/api/qna/stats/bimester/${bimesterId}/section/${sectionId}`;
    if (courseId) {
      url += `?courseId=${courseId}`;
    }
    
    const { data } = await apiClient.get<ApiResponse<BimesterSectionStatsResponse>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener estadísticas de la sección');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener estadísticas de la sección');
  }
};

// Obtener analíticas de profesor
export const getTeacherAnalytics = async (
  teacherId: number,
  bimesterId: number,
  courseId?: number,
  sectionId?: number
): Promise<TeacherAnalyticsResponse> => {
  try {
    let url = `/api/qna/analytics/teacher/${teacherId}/bimester/${bimesterId}`;
    const params = new URLSearchParams();
    
    if (courseId) params.append('courseId', courseId.toString());
    if (sectionId) params.append('sectionId', sectionId.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const { data } = await apiClient.get<ApiResponse<TeacherAnalyticsResponse>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener analíticas del profesor');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener analíticas del profesor');
  }
};

// ==================== UTILIDADES ====================

// Configurar valores por defecto
export const setupDefaultConfigs = async (): Promise<{ success: boolean; configsProcessed: number; message: string }> => {
  try {
    const { data } = await apiClient.post<ApiResponse<{ success: boolean; configsProcessed: number; message: string }>>('/api/qna/setup/default-configs');
    if (!data.success) throw new Error(data.message || 'Error al configurar valores por defecto');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al configurar valores por defecto');
  }
};

// Verificar salud del bimestre
export const checkBimesterHealth = async (bimesterId: number): Promise<BimesterHealthResponse> => {
  try {
    const { data } = await apiClient.get<ApiResponse<BimesterHealthResponse>>(`/api/qna/health/bimester/${bimesterId}`);
    if (!data.success) throw new Error(data.message || 'Error al verificar salud del bimestre');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al verificar salud del bimestre');
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