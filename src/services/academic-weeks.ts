// services/academicWeekService.ts
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  AcademicWeek, 
  AcademicWeekFormValues, 
  UpdateAcademicWeekFormValues,
  AcademicWeekFilters,
  GenerateWeeksRequest,
  CurrentWeekResponse,
  WeekType
} from '@/types/academic-week.types';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== ACADEMIC WEEKS CRUD ====================

/**
 * Obtener todas las semanas académicas con filtros opcionales
 * @param filters - Filtros opcionales (bimesterId, number, weekType)
 */
export const getAcademicWeeks = async (filters?: AcademicWeekFilters): Promise<AcademicWeek[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.bimesterId) params.append('bimesterId', filters.bimesterId.toString());
    if (filters?.number) params.append('number', filters.number.toString());
    if (filters?.weekType) params.append('weekType', filters.weekType); // ✅ NUEVO
    
    const queryString = params.toString();
    const url = queryString ? `/api/academic-weeks?${queryString}` : '/api/academic-weeks';
    
    const { data } = await apiClient.get<ApiResponse<AcademicWeek[]>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener semanas académicas');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener semanas académicas');
  }
};

/**
 * Obtener una semana académica por ID
 */
export const getAcademicWeekById = async (id: number): Promise<AcademicWeek> => {
  try {
    const { data } = await apiClient.get<ApiResponse<AcademicWeek>>(`/api/academic-weeks/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener la semana académica');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la semana académica');
  }
};

/**
 * Crear una nueva semana académica
 */
export const createAcademicWeek = async (weekData: AcademicWeekFormValues): Promise<AcademicWeek> => {
  try {
    const { data } = await apiClient.post<ApiResponse<AcademicWeek>>('/api/academic-weeks', weekData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear semana académica');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear semana académica');
  }
};

/**
 * Actualizar una semana académica
 */
export const updateAcademicWeek = async (
  id: number,
  weekData: UpdateAcademicWeekFormValues
): Promise<AcademicWeek> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<AcademicWeek>>(`/api/academic-weeks/${id}`, weekData);
    if (!data.success) throw new Error(data.message || 'Error al actualizar semana académica');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar semana académica');
  }
};

/**
 * Eliminar una semana académica
 */
export const deleteAcademicWeek = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/academic-weeks/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar semana académica');
  } catch (error) {
    handleApiError(error, 'Error al eliminar semana académica');
  }
};

// ==================== ENDPOINTS POR BIMESTRE ====================

/**
 * Obtener todas las semanas académicas de un bimestre
 */
export const getAcademicWeeksByBimester = async (bimesterId: number): Promise<AcademicWeek[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<AcademicWeek[]>>(`/api/academic-weeks/bimester/${bimesterId}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener semanas del bimestre');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener semanas del bimestre');
  }
};

/**
 * ✅ NUEVO: Obtener solo las semanas regulares de un bimestre
 * Retorna semanas con weekType: 'REGULAR'
 */
export const getRegularWeeksByBimester = async (bimesterId: number): Promise<AcademicWeek[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<AcademicWeek[]>>(`/api/academic-weeks/bimester/${bimesterId}/regular`);
    if (!data.success) throw new Error(data.message || 'Error al obtener semanas regulares');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener semanas regulares');
  }
};

/**
 * ✅ NUEVO: Obtener la semana de evaluación de un bimestre
 * Retorna la semana con weekType: 'EVALUATION' o null si no existe
 */
export const getEvaluationWeekByBimester = async (bimesterId: number): Promise<AcademicWeek | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<AcademicWeek>>(`/api/academic-weeks/bimester/${bimesterId}/evaluation`);
    
    // Si el backend retorna un mensaje en lugar de datos, es porque no existe
    if (data.message && !data.data) {
      return null;
    }
    
    if (!data.success) throw new Error(data.message || 'Error al obtener semana de evaluación');
    return data.data;
  } catch (error) {
    // Si es 404, retornar null en lugar de lanzar error
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    handleApiError(error, 'Error al obtener semana de evaluación');
  }
};

/**
 * Obtener una semana específica por su número dentro de un bimestre
 */
export const getAcademicWeekByNumber = async (bimesterId: number, number: number): Promise<AcademicWeek> => {
  try {
    const { data } = await apiClient.get<ApiResponse<AcademicWeek>>(`/api/academic-weeks/bimester/${bimesterId}/week/${number}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener la semana específica');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la semana específica');
  }
};

// ==================== ENDPOINTS ESPECIALES ====================

/**
 * Obtener la semana académica actual
 * Retorna la semana que corresponde a la fecha de hoy
 */
export const getCurrentWeek = async (): Promise<CurrentWeekResponse> => {
  try {
    const { data } = await apiClient.get<ApiResponse<CurrentWeekResponse>>('/api/academic-weeks/current');
    if (!data.success) throw new Error(data.message || 'Error al obtener la semana actual');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la semana actual');
  }
};

/**
 * Generar semanas automáticamente para un bimestre
 * @param bimesterId - ID del bimestre
 * @param options - Opciones de generación (weeksCount, includeEvaluationWeek)
 */
export const generateWeeksForBimester = async (
  bimesterId: number,
  options?: GenerateWeeksRequest
): Promise<AcademicWeek[]> => {
  try {
    const params = new URLSearchParams();
    if (options?.weeksCount) {
      params.append('weeksCount', options.weeksCount.toString());
    }
    if (options?.includeEvaluationWeek !== undefined) {
      params.append('includeEvaluationWeek', options.includeEvaluationWeek.toString()); // ✅ NUEVO
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `/api/academic-weeks/generate/${bimesterId}?${queryString}` 
      : `/api/academic-weeks/generate/${bimesterId}`;
    
    const { data } = await apiClient.post<ApiResponse<AcademicWeek[]>>(url);
    if (!data.success) {
      const error = new Error(data.message || 'Error al generar semanas académicas');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al generar semanas académicas');
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * ✅ NUEVO: Verificar si una semana permite el registro de ERICA
 * Las semanas REGULAR y REVIEW permiten ERICA
 * Las semanas EVALUATION NO permiten ERICA
 */
export const canFillErica = (week: AcademicWeek): boolean => {
  return week.weekType === 'REGULAR' || week.weekType === 'REVIEW';
};

/**
 * ✅ NUEVO: Verificar si una semana es de evaluación
 */
export const isEvaluationWeek = (week: AcademicWeek): boolean => {
  return week.weekType === 'EVALUATION';
};

/**
 * ✅ NUEVO: Verificar si una semana es regular
 */
export const isRegularWeek = (week: AcademicWeek): boolean => {
  return week.weekType === 'REGULAR';
};

/**
 * ✅ NUEVO: Obtener el label legible del tipo de semana
 */
export const getWeekTypeLabel = (weekType: WeekType): string => {
  const labels: Record<WeekType, string> = {
    REGULAR: 'Semana Regular',
    EVALUATION: 'Semana de Evaluación',
    REVIEW: 'Semana de Repaso',
  };
  return labels[weekType];
};

/**
 * ✅ NUEVO: Obtener las clases CSS para el badge según el tipo de semana
 */
export const getWeekTypeBadgeColor = (weekType: WeekType): string => {
  const colors: Record<WeekType, string> = {
    REGULAR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    EVALUATION: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  };
  return colors[weekType];
};

/**
 * ✅ NUEVO: Obtener el icono sugerido para el tipo de semana (nombre de icono de lucide-react)
 */
export const getWeekTypeIcon = (weekType: WeekType): string => {
  const icons: Record<WeekType, string> = {
    REGULAR: 'BookOpen',
    EVALUATION: 'ClipboardCheck',
    REVIEW: 'RefreshCw',
  };
  return icons[weekType];
};

/**
 * ✅ NUEVO: Verificar si el número de semana es válido para el tipo
 */
export const isValidWeekNumber = (number: number, weekType: WeekType): boolean => {
  if (weekType === 'EVALUATION') {
    return number === 9; // La evaluación debe ser semana 9
  }
  return number >= 1 && number <= 8; // Regulares y review son 1-8
};

/**
 * ✅ NUEVO: Obtener el rango de fechas formateado
 */
export const getWeekDateRange = (week: AcademicWeek, locale: string = 'es-ES'): string => {
  const start = new Date(week.startDate);
  const end = new Date(week.endDate);
  
  const startStr = start.toLocaleDateString(locale, { 
    day: '2-digit', 
    month: 'short' 
  });
  const endStr = end.toLocaleDateString(locale, { 
    day: '2-digit', 
    month: 'short',
    year: 'numeric'
  });
  
  return `${startStr} - ${endStr}`;
};

// ==================== UTILS ====================

/**
 * Manejador centralizado de errores de API
 */
function handleApiError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || fallbackMessage;
    const details = error.response?.data?.details || [];
    const err = new Error(message);
    (err as any).details = details;
    throw err;
  }
  if (error instanceof Error) throw error;
  throw new Error(fallbackMessage);
}