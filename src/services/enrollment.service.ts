import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  EnrollmentResponse,
  EnrollmentDetailResponse,
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
  EnrollmentFilterDto,
  EnrollmentStatsResponse,
  EnrollmentQueryParams,
  EnrollmentStatsQueryParams,
  EnrollmentFormDataResponse 
} from '@/types/enrollment.types';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== ENROLLMENT ====================

/**
 * Obtiene todas las matrículas con filtros opcionales
 */
export const getEnrollments = async (params?: EnrollmentQueryParams): Promise<EnrollmentResponse[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.studentId) queryParams.append('studentId', params.studentId);
    if (params?.cycleId) queryParams.append('cycleId', params.cycleId);
    if (params?.gradeId) queryParams.append('gradeId', params.gradeId);
    if (params?.sectionId) queryParams.append('sectionId', params.sectionId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.includeRelations !== undefined) {
      queryParams.append('includeRelations', params.includeRelations.toString());
    }

    const url = `/api/enrollment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const { data } = await apiClient.get<ApiResponse<EnrollmentResponse[]>>(url);
    
    if (!data.success) throw new Error(data.message || 'Error al obtener matrículas');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener matrículas');
  }
};

/**
 * Obtiene una matrícula por ID
 */
export const getEnrollmentById = async (
  id: number, 
  includeRelations: boolean = true
): Promise<EnrollmentDetailResponse> => {
  try {
    const queryParams = includeRelations ? '' : '?includeRelations=false';
    const { data } = await apiClient.get<ApiResponse<EnrollmentDetailResponse>>(
      `/api/enrollment/${id}${queryParams}`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener la matrícula');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la matrícula');
  }
};

/**
 * Obtiene las matrículas de un estudiante específico
 */
export const getEnrollmentsByStudent = async (studentId: number): Promise<EnrollmentResponse[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<EnrollmentResponse[]>>(
      `/api/enrollment/student/${studentId}`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener matrículas del estudiante');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener matrículas del estudiante');
  }
};

/**
 * Obtiene las matrículas de un ciclo específico
 */
export const getEnrollmentsByCycle = async (cycleId: number): Promise<EnrollmentResponse[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<EnrollmentResponse[]>>(
      `/api/enrollment/cycle/${cycleId}`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener matrículas del ciclo');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener matrículas del ciclo');
  }
};

/**
 * Obtiene las matrículas de una sección específica
 */
export const getEnrollmentsBySection = async (sectionId: number): Promise<EnrollmentResponse[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<EnrollmentResponse[]>>(
      `/api/enrollment/section/${sectionId}`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener matrículas de la sección');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener matrículas de la sección');
  }
};

/**
 * Obtiene solo las matrículas activas, opcionalmente filtradas por ciclo
 */
export const getActiveEnrollments = async (cycleId?: number): Promise<EnrollmentResponse[]> => {
  try {
    const queryParams = cycleId ? `?cycleId=${cycleId}` : '';
    const { data } = await apiClient.get<ApiResponse<EnrollmentResponse[]>>(
      `/api/enrollment/active${queryParams}`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener matrículas activas');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener matrículas activas');
  }
};

/**
 * Obtiene estadísticas de matrículas
 */
export const getEnrollmentStats = async (params?: EnrollmentStatsQueryParams): Promise<EnrollmentStatsResponse> => {
  try {
    const queryParams = params?.cycleId ? `?cycleId=${params.cycleId}` : '';
    const { data } = await apiClient.get<ApiResponse<EnrollmentStatsResponse>>(
      `/api/enrollment/stats${queryParams}`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener estadísticas');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener estadísticas');
  }
};

/**
 * Crea una nueva matrícula
 */
export const createEnrollment = async (enrollmentData: CreateEnrollmentDto): Promise<EnrollmentResponse> => {
  try {
    const { data } = await apiClient.post<ApiResponse<EnrollmentResponse>>(
      '/api/enrollment', 
      enrollmentData
    );
    
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear matrícula');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear matrícula');
  }
};

/**
 * Actualiza una matrícula existente
 */
export const updateEnrollment = async (
  id: number,
  enrollmentData: UpdateEnrollmentDto
): Promise<EnrollmentResponse> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<EnrollmentResponse>>(
      `/api/enrollment/${id}`, 
      enrollmentData
    );
    
    if (!data.success) throw new Error(data.message || 'Error al actualizar matrícula');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar matrícula');
  }
};

/**
 * Elimina una matrícula
 */
export const deleteEnrollment = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/enrollment/${id}`);
    
    if (!data.success) throw new Error(data.message || 'Error al eliminar matrícula');
  } catch (error) {
    handleApiError(error, 'Error al eliminar matrícula');
  }
};

// ==================== STATUS ACTIONS ====================

/**
 * Gradúa una matrícula (cambia status a 'graduated')
 */
export const graduateEnrollment = async (id: number): Promise<EnrollmentResponse> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<EnrollmentResponse>>(
      `/api/enrollment/${id}/graduate`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al graduar matrícula');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al graduar matrícula');
  }
};

/**
 * Transfiere una matrícula (cambia status a 'transferred')
 */
export const transferEnrollment = async (id: number): Promise<EnrollmentResponse> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<EnrollmentResponse>>(
      `/api/enrollment/${id}/transfer`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al transferir matrícula');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al transferir matrícula');
  }
};

/**
 * Reactiva una matrícula (cambia status a 'active')
 */
export const reactivateEnrollment = async (id: number): Promise<EnrollmentResponse> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<EnrollmentResponse>>(
      `/api/enrollment/${id}/reactivate`
    );
    
    if (!data.success) throw new Error(data.message || 'Error al reactivar matrícula');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al reactivar matrícula');
  }
};

// ==================== BULK OPERATIONS ====================

/**
 * Operaciones en lote - Actualizar múltiples matrículas
 */
export const bulkUpdateEnrollments = async (
  ids: number[],
  updateData: UpdateEnrollmentDto
): Promise<EnrollmentResponse[]> => {
  try {
    const promises = ids.map(id => updateEnrollment(id, updateData));
    return await Promise.all(promises);
  } catch (error) {
    handleApiError(error, 'Error en actualización masiva');
  }
};

/**
 * Graduación en lote
 */
export const bulkGraduateEnrollments = async (ids: number[]): Promise<EnrollmentResponse[]> => {
  try {
    const promises = ids.map(id => graduateEnrollment(id));
    return await Promise.all(promises);
  } catch (error) {
    handleApiError(error, 'Error en graduación masiva');
  }
};

/**
 * Transferencia en lote
 */
export const bulkTransferEnrollments = async (ids: number[]): Promise<EnrollmentResponse[]> => {
  try {
    const promises = ids.map(id => transferEnrollment(id));
    return await Promise.all(promises);
  } catch (error) {
    handleApiError(error, 'Error en transferencia masiva');
  }
};

// ==================== FORM DATA CONSOLIDADO ====================

/**
 * Obtiene todos los datos necesarios para el formulario de matrícula
 */
export const getEnrollmentFormData = async (): Promise<EnrollmentFormDataResponse> => {
  try {
    const { data } = await apiClient.get<ApiResponse<EnrollmentFormDataResponse>>(
      '/api/enrollment/form-data'
    );
    
    if (!data.success) throw new Error(data.message || 'Error al obtener datos del formulario');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener datos del formulario de matrícula');
  }
}

// ==================== UTILS ====================

/**
 * Maneja errores de la API de manera consistente
 */
function handleApiError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || fallbackMessage;
    const details = error.response?.data?.details || [];
    const err = new Error(message);
    (err as any).details = details;
    (err as any).status = error.response?.status;
    throw err;
  }
  if (error instanceof Error) throw error;
  throw new Error(fallbackMessage);
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Construye filtros para consultas
 */
export const buildEnrollmentFilters = (filters: EnrollmentFilterDto): EnrollmentQueryParams => {
  const params: EnrollmentQueryParams = {};
  
  if (filters.studentId) params.studentId = filters.studentId.toString();
  if (filters.cycleId) params.cycleId = filters.cycleId.toString();
  if (filters.gradeId) params.gradeId = filters.gradeId.toString();
  if (filters.sectionId) params.sectionId = filters.sectionId.toString();
  if (filters.status) params.status = filters.status;
  
  return params;
};

/**
 * Verifica si una matrícula puede ser editada
 */
export const canEditEnrollment = (enrollment: EnrollmentResponse): boolean => {
  return enrollment.status === 'active';
};

/**
 * Verifica si una matrícula puede ser eliminada
 */
export const canDeleteEnrollment = (enrollment: EnrollmentDetailResponse): boolean => {
  return enrollment.attendances.length === 0 && enrollment.grades.length === 0;
};



/**
 * Obtiene el label en español para un status
 */
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: 'Activo',
    graduated: 'Graduado',
    transferred: 'Transferido'
  };
  return labels[status] || status;
};