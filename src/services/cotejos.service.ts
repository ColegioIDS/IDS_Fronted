/**
 * Servicio para el módulo de Cotejos
 * Gestión de consolidación de calificaciones
 */

import { api } from '@/config/api';
import {
  CascadeResponse,
  CotejoResponse,
  GenerateCotejoResponse,
  UpdateActitudinalResponse,
  UpdateDeclarativoResponse,
  SubmitCotejoResponse,
  CotejoBySectionResponse,
  GenerateCotejoDTO,
  UpdateActitudinalDTO,
  UpdateDeclarativoDTO,
  SubmitCotejoDTO,
  GetStudentsResponse,
  StudentEnrollmentData,
  CotejosStudentsFiltersResponse,
  CotejosStudentsFiltersQuery,
} from '@/types/cotejos.types';
import { extractCotejosError } from '@/utils/cotejos-error.utils';

const BASE_URL = '/api/cotejos';

// ==================== VALIDACIÓN DE RESPUESTAS ====================

/**
 * Valida que la respuesta de la API sea exitosa
 * Si success es false, lanza el error
 */
const validateApiResponse = (response: any): void => {
  if (response && response.success === false) {
    // Crear un error que pueda ser procesado por extractCotejosError
    const error: any = new Error(response.message);
    error.response = {
      data: response,
      status: 200,
    };
    error.isApiError = true;
    throw error;
  }
};

// ==================== CASCADA ====================

/**
 * Obtiene la estructura completa de ciclo, bimestres, grados, secciones y cursos
 */
export const getCascadeData = async (includeInactive: boolean = false): Promise<CascadeResponse> => {
  try {
    const response = await api.get<CascadeResponse>(`${BASE_URL}/cascade`, {
      params: {
        includeInactive: includeInactive ? 'true' : 'false',
      },
    });
    validateApiResponse(response.data);
    return response.data;
  } catch (error) {
    throw extractCotejosError(error);
  }
};

// ==================== GENERAR COTEJO ====================

/**
 * Genera o recalcula un cotejo para un estudiante en un curso
 * Calcula automáticamente ERICA y TAREAS
 */
export const generateCotejo = async (
  enrollmentId: number,
  courseId: number,
  bimesterId: number,
  cycleId: number,
  data: GenerateCotejoDTO,
): Promise<CotejoResponse> => {
  try {
    const response = await api.post<GenerateCotejoResponse>(
      `${BASE_URL}/${enrollmentId}/course/${courseId}/generate`,
      data,
      {
        params: {
          bimesterId,
          cycleId,
        },
      },
    );
    validateApiResponse(response.data);
    return response.data.data;
  } catch (error) {
    throw extractCotejosError(error);
  }
};

// ==================== OBTENER COTEJO ====================

/**
 * Obtiene los detalles completos de un cotejo específico
 */
export const getCotejo = async (id: number): Promise<CotejoResponse> => {
  try {
    const response = await api.get<{ data: CotejoResponse }>(`${BASE_URL}/${id}`);
    validateApiResponse(response.data);
    return response.data.data;
  } catch (error) {
    throw extractCotejosError(error);
  }
};

// ==================== COTEJOS POR SECCIÓN ====================

/**
 * Obtiene todos los cotejos de una sección para un curso y bimestre
 */
export const getCotejosBySection = async (
  sectionId: number,
  courseId: number,
  bimesterId: number,
  cycleId: number,
): Promise<CotejoBySectionResponse> => {
  try {
    const response = await api.get<{ data: CotejoResponse[] }>(
      `${BASE_URL}/section/${sectionId}/course/${courseId}`,
      {
        params: {
          bimesterId,
          cycleId,
        },
      },
    );
    validateApiResponse(response.data);
    
    // El endpoint retorna un array directo, lo convertimos al formato esperado
    const cotejos = response.data.data || [];
    return {
      sectionId,
      courseId,
      bimesterId,
      cycleId,
      total: cotejos.length,
      cotejos,
    };
  } catch (error) {
    throw extractCotejosError(error);
  }
};

// ==================== ACTUALIZAR ACTITUDINAL ====================

/**
 * Actualiza la puntuación de comportamiento (0-20 pts)
 */
export const updateActitudinal = async (
  id: number,
  data: UpdateActitudinalDTO,
): Promise<CotejoResponse> => {
  try {
    const response = await api.patch<UpdateActitudinalResponse>(
      `${BASE_URL}/${id}/actitudinal`,
      data,
    );
    validateApiResponse(response.data);
    return response.data.data;
  } catch (error) {
    throw extractCotejosError(error);
  }
};

// ==================== ACTUALIZAR DECLARATIVO ====================

/**
 * Actualiza la puntuación de conocimiento (0-30 pts)
 */
export const updateDeclarativo = async (
  id: number,
  data: UpdateDeclarativoDTO,
): Promise<CotejoResponse> => {
  try {
    const response = await api.patch<UpdateDeclarativoResponse>(
      `${BASE_URL}/${id}/declarativo`,
      data,
    );
    validateApiResponse(response.data);
    return response.data.data;
  } catch (error) {
    throw extractCotejosError(error);
  }
};

// ==================== SUBMIT COTEJO ====================

/**
 * Finaliza el cotejo: calcula el total y cambia estado a COMPLETED
 * Requiere que todos los componentes hayan sido ingresados
 */
export const submitCotejo = async (
  id: number,
  data: SubmitCotejoDTO,
): Promise<CotejoResponse> => {
  try {
    const response = await api.patch<SubmitCotejoResponse>(
      `${BASE_URL}/${id}/submit`,
      data,
    );
    validateApiResponse(response.data);
    return response.data.data;
  } catch (error) {
    throw extractCotejosError(error);
  }
};

// ==================== BATCH OPERATIONS ====================

/**
 * Genera cotejos para múltiples estudiantes de una sección en un curso
 */
export const generateCotejosBatch = async (
  enrollmentIds: number[],
  courseId: number,
  bimesterId: number,
  cycleId: number,
): Promise<CotejoResponse[]> => {
  try {
    const promises = enrollmentIds.map((enrollmentId) =>
      generateCotejo(enrollmentId, courseId, bimesterId, cycleId, {}),
    );
    return await Promise.all(promises);
  } catch (error) {
    throw extractCotejosError(error);
  }
};

// ==================== ESTUDIANTES ====================

/**
 * Obtiene lista de estudiantes con sus datos de inscripción
 */
export const getStudents = async (status: 'all' | 'active' | 'inactive' = 'all') => {
  try {
    const response = await api.get<{ data: GetStudentsResponse }>(`${BASE_URL}/students`, {
      params: { status },
    });
    validateApiResponse(response.data);
    return response.data.data;
  } catch (error) {
    throw extractCotejosError(error);
  }
};

/**
 * Obtiene estudiantes filtrados por ciclo, grado, sección y curso
 * GET /api/cotejos/students/filters?cycleId=1&gradeId=2&sectionId=3&courseId=5
 */
export const getStudentsByFilters = async (query: CotejosStudentsFiltersQuery) => {
  try {
    const response = await api.get<CotejosStudentsFiltersResponse>(`${BASE_URL}/students/filters`, {
      params: query,
    });
    validateApiResponse(response.data);
    return response.data.data;
  } catch (error) {
    throw extractCotejosError(error);
  }
};