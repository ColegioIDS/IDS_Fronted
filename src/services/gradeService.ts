import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  Grade, 
  GradeFormValues, 
  CreateGradeRequest, 
  UpdateGradeRequest, 
  GradeFilters, 
  GradeResponse, 
  GradeStats,
  GradeLevel 
} from '@/types/grades';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== GRADES ====================

// Obtener todos los grados (con filtros opcionales)
export const getGrades = async (filters?: GradeFilters): Promise<Grade[] | GradeResponse> => {
  try {
    let url = '/api/grades';
    
    // Si hay filtros, construir query string
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
    
    const { data } = await apiClient.get<ApiResponse<Grade[] | GradeResponse>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener grados');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener grados');
  }
};

// Obtener grado por ID
export const getGradeById = async (id: number): Promise<Grade> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Grade>>(`/api/grades/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener el grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el grado');
  }
};

// Crear grado
export const createGrade = async (gradeData: CreateGradeRequest): Promise<Grade> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Grade>>('/api/grades', gradeData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear grado');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear grado');
  }
};

// Actualizar grado
export const updateGrade = async (
  id: number,
  gradeData: UpdateGradeRequest
): Promise<Grade> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<Grade>>(`/api/grades/${id}`, gradeData);
    if (!data.success) throw new Error(data.message || 'Error al actualizar grado');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar grado');
  }
};

// Eliminar grado
export const deleteGrade = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/grades/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar grado');
  } catch (error) {
    handleApiError(error, 'Error al eliminar grado');
  }
};

// Obtener grados por nivel
export const getGradesByLevel = async (
  level: GradeLevel, 
  filters?: Omit<GradeFilters, 'level'>
): Promise<GradeResponse> => {
  try {
    const allFilters = { ...filters, level };
    const result = await getGrades(allFilters);
    
    // Si getGrades devuelve un array simple, convertirlo a GradeResponse
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
    handleApiError(error, 'Error al obtener grados por nivel');
  }
};

// Obtener grados activos
export const getActiveGrades = async (filters?: GradeFilters): Promise<GradeResponse> => {
  try {
    const allFilters = { ...filters, isActive: true };
    const result = await getGrades(allFilters);
    
    // Si getGrades devuelve un array simple, convertirlo a GradeResponse
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
    handleApiError(error, 'Error al obtener grados activos');
  }
};

// Obtener estadísticas de grados
export const getGradeStats = async (): Promise<GradeStats> => {
  try {
    const { data } = await apiClient.get<ApiResponse<GradeStats>>('/api/grades/stats');
    if (!data.success) throw new Error(data.message || 'Error al obtener estadísticas');
    return data.data;
  } catch (error) {
    // Si no existe el endpoint de stats, generar estadísticas básicas
    try {
      const grades = await getGrades();
      const gradesArray = Array.isArray(grades) ? grades : grades.data;
      
      const stats: GradeStats = {
        totalGrades: gradesArray.length,
        activeGrades: gradesArray.filter(g => g.isActive).length,
        inactiveGrades: gradesArray.filter(g => !g.isActive).length,
        gradesByLevel: [
          { level: 'Kinder', count: gradesArray.filter(g => g.level === 'Kinder').length },
          { level: 'Primaria', count: gradesArray.filter(g => g.level === 'Primaria').length },
          { level: 'Secundaria', count: gradesArray.filter(g => g.level === 'Secundaria').length },
        ]
      };
      
      return stats;
    } catch (fallbackError) {
      handleApiError(error, 'Error al obtener estadísticas de grados');
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