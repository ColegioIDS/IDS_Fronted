// src/services/ericaEvaluationService.ts
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  EricaEvaluation,
  EricaEvaluationWithRelations,
  CreateEricaEvaluationRequest,
  UpdateEricaEvaluationRequest,
  SaveGridRequest,
  BulkCreateEvaluationsRequest,
  EvaluationFilters,
  GetGridFilters,
  EvaluationGridResponse,
  TopicStats,
  TopicSummary,
  TeacherAnalytics,
  PendingTopic,
  EvaluationResponse,
  ValidationResult,
  SaveGridResult
} from '@/types/erica-evaluations';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== GRID DE EVALUACIÓN - ENDPOINTS PRINCIPALES ====================

// Obtener grid de evaluación para un tema
export const getEvaluationGrid = async (
  topicId: number, 
  includeEmpty: boolean = false
): Promise<EvaluationGridResponse> => {
  try {
    const params = new URLSearchParams();
    if (includeEmpty) params.append('includeEmpty', includeEmpty.toString());
    
    const url = `/api/erica-evaluations/grid/topic/${topicId}${params.toString() ? `?${params.toString()}` : ''}`;
    const { data } = await apiClient.get<ApiResponse<EvaluationGridResponse>>(url);
    
    if (!data.success) throw new Error(data.message || 'Error al obtener el grid de evaluación');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el grid de evaluación');
  }
};

// Guardar grid de evaluación
export const saveEvaluationGrid = async (gridData: SaveGridRequest): Promise<SaveGridResult> => {
  try {
    const { topicId, ...body } = gridData;
    const { data } = await apiClient.post<ApiResponse<SaveGridResult>>(
      `/api/erica-evaluations/grid/topic/${topicId}`, 
      body
    );
    
    if (!data.success) {
      const error = new Error(data.message || 'Error al guardar el grid de evaluación');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al guardar el grid de evaluación');
  }
};

// Obtener resumen de evaluaciones de un tema
export const getTopicSummary = async (topicId: number): Promise<TopicSummary> => {
  try {
    const { data } = await apiClient.get<ApiResponse<TopicSummary>>(
      `/api/erica-evaluations/grid/topic/${topicId}/summary`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener el resumen del tema');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el resumen del tema');
  }
};

// Obtener estadísticas de un tema
export const getTopicStats = async (topicId: number): Promise<TopicStats> => {
  try {
    const { data } = await apiClient.get<ApiResponse<TopicStats>>(
      `/api/erica-evaluations/grid/topic/${topicId}/stats`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener estadísticas del tema');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener estadísticas del tema');
  }
};

// ==================== CRUD INDIVIDUAL ====================

// Crear evaluación individual
export const createEricaEvaluation = async (
  evaluationData: CreateEricaEvaluationRequest
): Promise<EricaEvaluationWithRelations> => {
  try {
    const { data } = await apiClient.post<ApiResponse<EricaEvaluationWithRelations>>(
      '/api/erica-evaluations', 
      evaluationData
    );
    
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear evaluación');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear evaluación');
  }
};

// Crear evaluaciones en lote
export const createBulkEvaluations = async (
  bulkData: BulkCreateEvaluationsRequest
): Promise<EricaEvaluationWithRelations[]> => {
  try {
    const { data } = await apiClient.post<ApiResponse<EricaEvaluationWithRelations[]>>(
      '/api/erica-evaluations/bulk', 
      bulkData
    );
    
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear evaluaciones en lote');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear evaluaciones en lote');
  }
};

// Obtener todas las evaluaciones (con filtros opcionales)
export const getEricaEvaluations = async (
  filters?: EvaluationFilters
): Promise<EricaEvaluationWithRelations[] | EvaluationResponse> => {
  try {
    let url = '/api/erica-evaluations';
    
    // Si hay filtros, construir query string
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const { data } = await apiClient.get<ApiResponse<EricaEvaluationWithRelations[] | EvaluationResponse>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener evaluaciones');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener evaluaciones');
  }
};

// Obtener evaluación por ID
export const getEricaEvaluationById = async (id: number): Promise<EricaEvaluationWithRelations> => {
  try {
    const { data } = await apiClient.get<ApiResponse<EricaEvaluationWithRelations>>(
      `/api/erica-evaluations/${id}`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener la evaluación');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la evaluación');
  }
};

// Actualizar evaluación
export const updateEricaEvaluation = async (
  id: number,
  evaluationData: UpdateEricaEvaluationRequest
): Promise<EricaEvaluationWithRelations> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<EricaEvaluationWithRelations>>(
      `/api/erica-evaluations/${id}`, 
      evaluationData
    );
    
    if (!data.success) throw new Error(data.message || 'Error al actualizar evaluación');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar evaluación');
  }
};

// Eliminar evaluación
export const deleteEricaEvaluation = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/erica-evaluations/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar evaluación');
  } catch (error) {
    handleApiError(error, 'Error al eliminar evaluación');
  }
};

// ==================== CONSULTAS ESPECÍFICAS ====================

// Obtener evaluaciones de un estudiante para un tema específico
export const getStudentTopicEvaluations = async (
  studentId: number, 
  topicId: number
): Promise<EricaEvaluationWithRelations[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<EricaEvaluationWithRelations[]>>(
      `/api/erica-evaluations/student/${studentId}/topic/${topicId}`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener evaluaciones del estudiante');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener evaluaciones del estudiante');
  }
};

// Obtener evaluaciones de un estudiante para un curso en un bimestre
export const getStudentCourseEvaluations = async (
  studentId: number,
  courseId: number,
  bimesterId: number
): Promise<EricaEvaluationWithRelations[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<EricaEvaluationWithRelations[]>>(
      `/api/erica-evaluations/student/${studentId}/course/${courseId}/bimester/${bimesterId}`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener evaluaciones del curso');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener evaluaciones del curso');
  }
};

// Obtener evaluaciones de una sección para una semana específica
export const getSectionWeekEvaluations = async (
  sectionId: number,
  courseId: number,
  weekId: number
): Promise<EricaEvaluationWithRelations[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<EricaEvaluationWithRelations[]>>(
      `/api/erica-evaluations/section/${sectionId}/course/${courseId}/week/${weekId}`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener evaluaciones de la sección');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener evaluaciones de la sección');
  }
};

// Obtener evaluaciones pendientes de un maestro
export const getPendingEvaluationsByTeacher = async (
  teacherId: number,
  bimesterId?: number
): Promise<PendingTopic[]> => {
  try {
    let url = `/api/erica-evaluations/teacher/${teacherId}/pending`;
    if (bimesterId) {
      url += `?bimesterId=${bimesterId}`;
    }
    
    const { data } = await apiClient.get<ApiResponse<PendingTopic[]>>(url);
    
    if (!data.success) throw new Error(data.message || 'Error al obtener evaluaciones pendientes');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener evaluaciones pendientes');
  }
};

// ==================== UTILIDADES Y VALIDACIONES ====================

// Validar datos de evaluación
export const validateEvaluationData = async (
  enrollmentId: number,
  topicId: number,
  categoryId: number,
  teacherId: number
): Promise<ValidationResult> => {
  try {
    const { data } = await apiClient.post<ApiResponse<ValidationResult>>(
      '/api/erica-evaluations/validate',
      { enrollmentId, topicId, categoryId, teacherId }
    );
    
    if (!data.success) throw new Error(data.message || 'Error al validar datos');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al validar datos de evaluación');
  }
};

// Recalcular puntos de un tema
export const recalculateTopicPoints = async (topicId: number): Promise<void> => {
  try {
    const { data } = await apiClient.post<ApiResponse<void>>(
      `/api/erica-evaluations/recalculate/topic/${topicId}`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al recalcular puntos');
  } catch (error) {
    handleApiError(error, 'Error al recalcular puntos del tema');
  }
};

// Obtener analíticas de un maestro
export const getTeacherAnalytics = async (
  teacherId: number,
  filters?: { bimesterId?: number; courseId?: number }
): Promise<TeacherAnalytics> => {
  try {
    let url = `/api/erica-evaluations/analytics/teacher/${teacherId}`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.bimesterId) params.append('bimesterId', filters.bimesterId.toString());
      if (filters.courseId) params.append('courseId', filters.courseId.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const { data } = await apiClient.get<ApiResponse<TeacherAnalytics>>(url);
    
    if (!data.success) throw new Error(data.message || 'Error al obtener analíticas del maestro');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener analíticas del maestro');
  }
};

// ==================== FUNCIONES AUXILIARES ESPECÍFICAS ====================

// Obtener evaluaciones activas (filtro por estado activo del tema)
export const getActiveEvaluations = async (filters?: EvaluationFilters): Promise<EvaluationResponse> => {
  try {
    const allFilters = { ...filters, isActive: true };
    const result = await getEricaEvaluations(allFilters);
    
    // Si getEricaEvaluations devuelve un array simple, convertirlo a EvaluationResponse
    if (Array.isArray(result)) {
      return {
        data: result,
        meta: {
          total: result.length,
          page: 1,
          limit: result.length,
          totalPages: 1
        }
      };
    }
    
    return result;
  } catch (error) {
    handleApiError(error, 'Error al obtener evaluaciones activas');
  }
};

// Obtener evaluaciones por bimestre
export const getEvaluationsByBimester = async (
  bimesterId: number, 
  filters?: Omit<EvaluationFilters, 'bimesterId'>
): Promise<EvaluationResponse> => {
  try {
    const allFilters = { ...filters, bimesterId };
    const result = await getEricaEvaluations(allFilters);
    
    // Si getEricaEvaluations devuelve un array simple, convertirlo a EvaluationResponse
    if (Array.isArray(result)) {
      return {
        data: result,
        meta: {
          total: result.length,
          page: 1,
          limit: result.length,
          totalPages: 1
        }
      };
    }
    
    return result;
  } catch (error) {
    handleApiError(error, 'Error al obtener evaluaciones por bimestre');
  }
};

// Obtener evaluaciones por curso
export const getEvaluationsByCourse = async (
  courseId: number, 
  filters?: Omit<EvaluationFilters, 'courseId'>
): Promise<EvaluationResponse> => {
  try {
    const allFilters = { ...filters, courseId };
    const result = await getEricaEvaluations(allFilters);
    
    // Si getEricaEvaluations devuelve un array simple, convertirlo a EvaluationResponse
    if (Array.isArray(result)) {
      return {
        data: result,
        meta: {
          total: result.length,
          page: 1,
          limit: result.length,
          totalPages: 1
        }
      };
    }
    
    return result;
  } catch (error) {
    handleApiError(error, 'Error al obtener evaluaciones por curso');
  }
};

// Obtener evaluaciones por sección
export const getEvaluationsBySection = async (
  sectionId: number, 
  filters?: Omit<EvaluationFilters, 'sectionId'>
): Promise<EvaluationResponse> => {
  try {
    const allFilters = { ...filters, sectionId };
    const result = await getEricaEvaluations(allFilters);
    
    // Si getEricaEvaluations devuelve un array simple, convertirlo a EvaluationResponse
    if (Array.isArray(result)) {
      return {
        data: result,
        meta: {
          total: result.length,
          page: 1,
          limit: result.length,
          totalPages: 1
        }
      };
    }
    
    return result;
  } catch (error) {
    handleApiError(error, 'Error al obtener evaluaciones por sección');
  }
};

// Obtener evaluaciones por maestro
export const getEvaluationsByTeacher = async (
  teacherId: number, 
  filters?: Omit<EvaluationFilters, 'teacherId'>
): Promise<EvaluationResponse> => {
  try {
    const allFilters = { ...filters, teacherId };
    const result = await getEricaEvaluations(allFilters);
    
    // Si getEricaEvaluations devuelve un array simple, convertirlo a EvaluationResponse
    if (Array.isArray(result)) {
      return {
        data: result,
        meta: {
          total: result.length,
          page: 1,
          limit: result.length,
          totalPages: 1
        }
      };
    }
    
    return result;
  } catch (error) {
    handleApiError(error, 'Error al obtener evaluaciones por maestro');
  }
};

// Obtener estadísticas generales de evaluaciones
export const getEvaluationStats = async (): Promise<{
  totalEvaluations: number;
  evaluationsByScale: Record<string, number>;
  evaluationsByCategory: Record<string, number>;
  averagePoints: number;
  evaluationsByBimester: Record<string, number>;
  topTeachers: Array<{ teacherId: number; teacherName: string; evaluationCount: number }>;
}> => {
  try {
    const { data } = await apiClient.get<ApiResponse<any>>('/api/erica-evaluations/stats');
    if (!data.success) throw new Error(data.message || 'Error al obtener estadísticas');
    return data.data;
  } catch (error) {
    // Si no existe el endpoint de stats, generar estadísticas básicas
    try {
      const evaluations = await getEricaEvaluations();
      const evaluationsArray = Array.isArray(evaluations) ? evaluations : evaluations.data;
      
      const stats = {
        totalEvaluations: evaluationsArray.length,
        evaluationsByScale: evaluationsArray.reduce((acc, e) => {
          acc[e.state] = (acc[e.state] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        evaluationsByCategory: evaluationsArray.reduce((acc, e) => {
          acc[e.dimension] = (acc[e.dimension] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        averagePoints: evaluationsArray.length > 0 
          ? evaluationsArray.reduce((sum, e) => sum + e.points, 0) / evaluationsArray.length 
          : 0,
        evaluationsByBimester: evaluationsArray.reduce((acc, e) => {
          acc[e.bimester.name] = (acc[e.bimester.name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        topTeachers: Object.entries(
          evaluationsArray.reduce((acc, e) => {
            const teacherName = `${e.teacher.givenNames} ${e.teacher.lastNames}`;
            const key = `${e.teacherId}-${teacherName}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([key, count]) => {
          const [teacherId, teacherName] = key.split('-');
          return {
            teacherId: parseInt(teacherId),
            teacherName: teacherName.replace(`${teacherId}-`, ''),
            evaluationCount: count
          };
        }).sort((a, b) => b.evaluationCount - a.evaluationCount).slice(0, 10)
      };
      
      return stats;
    } catch (fallbackError) {
      handleApiError(error, 'Error al obtener estadísticas de evaluaciones');
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