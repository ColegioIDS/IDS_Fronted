// services/erica-topics.ts
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  EricaTopic,
  EricaTopicFormValues,
  CreateEricaTopicRequest,
  UpdateEricaTopicRequest,
  BulkCreateEricaTopicsRequest,
  EricaTopicFilters,
  EricaTopicResponse,
  EricaTopicWithEvaluations,
  SectionWeekTopics,
  TeacherPendingTopics,
  SectionCoursePlanning,
  TeacherTopicStats,
  MarkCompleteRequest,
  DuplicateTopicRequest,
  DuplicateTopicResponse,
  EvaluationGridData
} from '@/types/erica-topics';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== CRUD BÁSICO ====================

// Obtener todos los temas (con filtros opcionales)
export const getEricaTopics = async (filters?: EricaTopicFilters): Promise<EricaTopic[] | EricaTopicResponse> => {
  try {
    let url = '/api/erica-topics';
    
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
    
    const { data } = await apiClient.get<ApiResponse<EricaTopic[] | EricaTopicResponse>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener temas');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener temas');
  }
};

// Obtener tema por ID
export const getEricaTopicById = async (id: number): Promise<EricaTopic> => {
  try {
    const { data } = await apiClient.get<ApiResponse<EricaTopic>>(`/api/erica-topics/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener el tema');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el tema');
  }
};

// Obtener tema con evaluaciones
export const getEricaTopicWithEvaluations = async (id: number): Promise<EricaTopicWithEvaluations> => {
  try {
    const { data } = await apiClient.get<ApiResponse<EricaTopicWithEvaluations>>(`/api/erica-topics/${id}/with-evaluations`);
    if (!data.success) throw new Error(data.message || 'Error al obtener el tema con evaluaciones');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el tema con evaluaciones');
  }
};

// Crear tema
export const createEricaTopic = async (topicData: CreateEricaTopicRequest): Promise<EricaTopic> => {
  try {
    const { data } = await apiClient.post<ApiResponse<EricaTopic>>('/api/erica-topics', topicData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear tema');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear tema');
  }
};

// Crear temas en lote
export const createEricaTopicsBulk = async (bulkData: BulkCreateEricaTopicsRequest): Promise<EricaTopic[]> => {
  try {
    const { data } = await apiClient.post<ApiResponse<EricaTopic[]>>('/api/erica-topics/bulk', bulkData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear temas en lote');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear temas en lote');
  }
};

// Actualizar tema
export const updateEricaTopic = async (
  id: number,
  topicData: UpdateEricaTopicRequest
): Promise<EricaTopic> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<EricaTopic>>(`/api/erica-topics/${id}`, topicData);
    if (!data.success) throw new Error(data.message || 'Error al actualizar tema');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar tema');
  }
};

// Marcar como completado/incompleto
export const markEricaTopicComplete = async (
  id: number,
  markData: MarkCompleteRequest
): Promise<EricaTopic> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<EricaTopic>>(`/api/erica-topics/${id}/complete`, markData);
    if (!data.success) throw new Error(data.message || 'Error al marcar tema como completado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al marcar tema como completado');
  }
};

// Eliminar tema
export const deleteEricaTopic = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/erica-topics/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar tema');
  } catch (error) {
    handleApiError(error, 'Error al eliminar tema');
  }
};

// Duplicar tema
export const duplicateEricaTopic = async (
  id: number,
  duplicateData: DuplicateTopicRequest
): Promise<DuplicateTopicResponse> => {
  try {
    const { data } = await apiClient.post<ApiResponse<DuplicateTopicResponse>>(
      `/api/erica-topics/${id}/duplicate`,
      duplicateData
    );
    if (!data.success) throw new Error(data.message || 'Error al duplicar tema');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al duplicar tema');
  }
};

// ==================== CONSULTAS ESPECÍFICAS ====================

// Obtener temas por sección y semana
export const getTopicsBySectionAndWeek = async (
  sectionId: number,
  weekId: number,
  courseId?: number
): Promise<SectionWeekTopics> => {
  try {
    let url = `/api/erica-topics/section/${sectionId}/week/${weekId}`;
    if (courseId) {
      url += `?courseId=${courseId}`;
    }
    
    const { data } = await apiClient.get<ApiResponse<SectionWeekTopics>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener temas de la sección');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener temas de la sección');
  }
};

// Obtener temas pendientes por maestro
export const getPendingTopicsByTeacher = async (
  teacherId: number,
  bimesterId?: number
): Promise<TeacherPendingTopics> => {
  try {
    let url = `/api/erica-topics/teacher/${teacherId}/pending`;
    if (bimesterId) {
      url += `?bimesterId=${bimesterId}`;
    }
    
    const { data } = await apiClient.get<ApiResponse<TeacherPendingTopics>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener temas pendientes');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener temas pendientes');
  }
};

// Obtener planificación de sección por curso
export const getSectionCoursePlanning = async (
  sectionId: number,
  courseId: number,
  bimesterId?: number
): Promise<SectionCoursePlanning> => {
  try {
    let url = `/api/erica-topics/section/${sectionId}/course/${courseId}/planning`;
    if (bimesterId) {
      url += `?bimesterId=${bimesterId}`;
    }
    
    const { data } = await apiClient.get<ApiResponse<SectionCoursePlanning>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener planificación');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener planificación');
  }
};

// Obtener estadísticas de maestro
export const getTeacherTopicStats = async (
  teacherId: number,
  bimesterId?: number
): Promise<TeacherTopicStats> => {
  try {
    let url = `/api/erica-topics/stats/teacher/${teacherId}`;
    if (bimesterId) {
      url += `?bimesterId=${bimesterId}`;
    }
    
    const { data } = await apiClient.get<ApiResponse<TeacherTopicStats>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener estadísticas del maestro');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener estadísticas del maestro');
  }
};

// ==================== GRID DE EVALUACIÓN ====================

// Obtener grid de evaluación por tema
export const getEvaluationGrid = async (
  topicId: number,
  includeEmpty: boolean = false
): Promise<EvaluationGridData> => {
  try {
    let url = `/api/erica-evaluations/grid/${topicId}`;
    if (includeEmpty) {
      url += `?includeEmpty=true`;
    }
    
    const { data } = await apiClient.get<ApiResponse<EvaluationGridData>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener grid de evaluación');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener grid de evaluación');
  }
};

// ==================== FILTROS Y BÚSQUEDAS AVANZADAS ====================

// Obtener temas activos
export const getActiveEricaTopics = async (filters?: EricaTopicFilters): Promise<EricaTopic[]> => {
  try {
    const allFilters = { ...filters, isActive: true };
    const result = await getEricaTopics(allFilters);
    
    // Si getEricaTopics devuelve un array simple, devolverlo tal como está
    if (Array.isArray(result)) {
      return result;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener temas activos');
  }
};

// Obtener temas completados
export const getCompletedEricaTopics = async (filters?: EricaTopicFilters): Promise<EricaTopic[]> => {
  try {
    const allFilters = { ...filters, isCompleted: true };
    const result = await getEricaTopics(allFilters);
    
    if (Array.isArray(result)) {
      return result;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener temas completados');
  }
};

// Obtener temas pendientes
export const getPendingEricaTopics = async (filters?: EricaTopicFilters): Promise<EricaTopic[]> => {
  try {
    const allFilters = { ...filters, isCompleted: false, isActive: true };
    const result = await getEricaTopics(allFilters);
    
    if (Array.isArray(result)) {
      return result;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener temas pendientes');
  }
};

// Buscar temas por texto
export const searchEricaTopics = async (
  searchTerm: string,
  filters?: Omit<EricaTopicFilters, 'search'>
): Promise<EricaTopic[]> => {
  try {
    const allFilters = { ...filters, search: searchTerm };
    const result = await getEricaTopics(allFilters);
    
    if (Array.isArray(result)) {
      return result;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'Error al buscar temas');
  }
};

// Obtener temas por rango de fechas
export const getEricaTopicsByDateRange = async (
  dateFrom: Date,
  dateTo: Date,
  filters?: Omit<EricaTopicFilters, 'dateFrom' | 'dateTo'>
): Promise<EricaTopic[]> => {
  try {
    const allFilters = { ...filters, dateFrom, dateTo };
    const result = await getEricaTopics(allFilters);
    
    if (Array.isArray(result)) {
      return result;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener temas por rango de fechas');
  }
};

// ==================== UTILIDADES DE FILTROS ====================

// Obtener temas por curso
export const getEricaTopicsByCourse = async (
  courseId: number,
  filters?: Omit<EricaTopicFilters, 'courseId'>
): Promise<EricaTopic[]> => {
  try {
    const allFilters = { ...filters, courseId };
    const result = await getEricaTopics(allFilters);
    
    if (Array.isArray(result)) {
      return result;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener temas por curso');
  }
};

// Obtener temas por sección
export const getEricaTopicsBySection = async (
  sectionId: number,
  filters?: Omit<EricaTopicFilters, 'sectionId'>
): Promise<EricaTopic[]> => {
  try {
    const allFilters = { ...filters, sectionId };
    const result = await getEricaTopics(allFilters);
    
    if (Array.isArray(result)) {
      return result;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener temas por sección');
  }
};

// Obtener temas por maestro
export const getEricaTopicsByTeacher = async (
  teacherId: number,
  filters?: Omit<EricaTopicFilters, 'teacherId'>
): Promise<EricaTopic[]> => {
  try {
    const allFilters = { ...filters, teacherId };
    const result = await getEricaTopics(allFilters);
    
    if (Array.isArray(result)) {
      return result;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener temas por maestro');
  }
};

// Obtener temas por bimestre
export const getEricaTopicsByBimester = async (
  bimesterId: number,
  filters?: Omit<EricaTopicFilters, 'bimesterId'>
): Promise<EricaTopic[]> => {
  try {
    const allFilters = { ...filters, bimesterId };
    const result = await getEricaTopics(allFilters);
    
    if (Array.isArray(result)) {
      return result;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener temas por bimestre');
  }
};

// ==================== OPERACIONES BATCH ====================

// Marcar múltiples temas como completados
export const markMultipleTopicsComplete = async (
  topicIds: number[],
  isCompleted: boolean,
  notes?: string
): Promise<EricaTopic[]> => {
  try {
    const promises = topicIds.map(id => 
      markEricaTopicComplete(id, { isCompleted, notes })
    );
    
    return await Promise.all(promises);
  } catch (error) {
    handleApiError(error, 'Error al marcar múltiples temas como completados');
  }
};

// Actualizar múltiples temas
export const updateMultipleTopics = async (
  updates: { id: number; data: UpdateEricaTopicRequest }[]
): Promise<EricaTopic[]> => {
  try {
    const promises = updates.map(update => 
      updateEricaTopic(update.id, update.data)
    );
    
    return await Promise.all(promises);
  } catch (error) {
    handleApiError(error, 'Error al actualizar múltiples temas');
  }
};

// Eliminar múltiples temas
export const deleteMultipleTopics = async (topicIds: number[]): Promise<void> => {
  try {
    const promises = topicIds.map(id => deleteEricaTopic(id));
    await Promise.all(promises);
  } catch (error) {
    handleApiError(error, 'Error al eliminar múltiples temas');
  }
};

// ==================== VALIDACIONES DEL LADO CLIENTE ====================

// Validar si se puede crear un tema en una semana/sección específica
export const validateTopicCreation = async (
  courseId: number,
  academicWeekId: number,
  sectionId: number
): Promise<{ canCreate: boolean; message?: string }> => {
  try {
    // Verificar si ya existe un tema para esta combinación
    const existingTopics = await getEricaTopics({
      courseId,
      academicWeekId,
      sectionId,
      limit: 1
    });
    
    const topics = Array.isArray(existingTopics) ? existingTopics : existingTopics.data;
    
    if (topics.length > 0) {
      return {
        canCreate: false,
        message: 'Ya existe un tema para este curso en esta semana y sección'
      };
    }
    
    return { canCreate: true };
  } catch (error) {
    return {
      canCreate: false,
      message: 'Error al validar la creación del tema'
    };
  }
};

// Validar si se puede marcar un tema como completado
export const validateTopicCompletion = async (topicId: number): Promise<{ canComplete: boolean; message?: string }> => {
  try {
    const topicWithEvaluations = await getEricaTopicWithEvaluations(topicId);
    
    if (!topicWithEvaluations.evaluations || topicWithEvaluations.evaluations.length === 0) {
      return {
        canComplete: false,
        message: 'No se puede marcar como completado un tema sin evaluaciones'
      };
    }
    
    return { canComplete: true };
  } catch (error) {
    return {
      canComplete: false,
      message: 'Error al validar la finalización del tema'
    };
  }
};

// ==================== UTILIDADES ====================

// Formatear tema para mostrar
export const formatTopicDisplay = (topic: EricaTopic): string => {
  const course = topic.course?.name || 'Curso';
  const week = topic.academicWeek?.number || 'Semana';
  const section = topic.section?.name || 'Sección';
  
  return `${course} - Semana ${week} - ${section}: ${topic.title}`;
};

// Obtener estado del tema
export const getTopicStatus = (topic: EricaTopic): 'completed' | 'pending' | 'inactive' => {
  if (!topic.isActive) return 'inactive';
  if (topic.isCompleted) return 'completed';
  return 'pending';
};

// Obtener color del estado
export const getTopicStatusColor = (topic: EricaTopic): string => {
  const status = getTopicStatus(topic);
  
  switch (status) {
    case 'completed': return 'green';
    case 'pending': return 'orange';
    case 'inactive': return 'gray';
    default: return 'gray';
  }
};

// Calcular progreso de evaluación
export const calculateEvaluationProgress = (topic: EricaTopicWithEvaluations): number => {
  if (!topic.evaluations || topic.evaluations.length === 0) return 0;
  
  // Asumiendo que hay 5 categorías ERICA y necesitamos evaluar a todos los estudiantes
  // Este cálculo puede ajustarse según los requerimientos específicos
  const expectedEvaluations = topic.evaluations.length; // Simplificado
  const completedEvaluations = topic.evaluations.filter(evaluation => evaluation.points > 0).length;
  
  return expectedEvaluations > 0 ? (completedEvaluations / expectedEvaluations) * 100 : 0;
};

// ==================== MANEJO DE ERRORES ====================
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