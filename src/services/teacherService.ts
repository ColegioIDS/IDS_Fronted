// src/services/teacherService.ts - Con nombres corregidos
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { User } from '@/types/user';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🎯 Tipos específicos para profesores
export interface TeacherAvailabilityResponse {
  available: User[];
  assigned: User[];
  current?: User;
  stats: {
    total: number;
    available: number;
    assigned: number;
  };
}

// 🔥 FUNCIÓN PRINCIPAL: Obtener availability data de profesores
export const fetchTeacherAvailabilityData = async (excludeSectionId?: number): Promise<TeacherAvailabilityResponse> => {
  try {
    const url = excludeSectionId 
      ? `/api/teachers/available?excludeSection=${excludeSectionId}`
      : '/api/teachers/available';
    
    console.log('🌐 Fetching teacher availability from URL:', url);
    
    const response = await apiClient.get<ApiResponse<TeacherAvailabilityResponse>>(url);
    
    console.log('📡 Raw response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener availability de profesores');
    }
    
    const availabilityData = response.data.data;
    console.log('✅ Availability data received:', availabilityData);
    
    // Validaciones
    if (!availabilityData || typeof availabilityData !== 'object') {
      throw new Error('Datos de availability inválidos');
    }
    
    if (!Array.isArray(availabilityData.available)) {
      throw new Error('Array de profesores disponibles inválido');
    }
    
    if (!Array.isArray(availabilityData.assigned)) {
      throw new Error('Array de profesores asignados inválido');
    }
    
    return availabilityData;
    
  } catch (error) {
    console.error('💥 Error in fetchTeacherAvailabilityData:', error);
    handleApiError(error, 'Error al obtener availability de profesores');
  }
};

// 🎯 Obtener todos los profesores
export const getAllTeachers = async (): Promise<User[]> => {
  try {
    console.log('🌐 Fetching all teachers from /api/teachers');
    
    const response = await apiClient.get<ApiResponse<User[]>>('/api/teachers');
    console.log('📥 All teachers response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener profesores');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('💥 Error fetching all teachers:', error);
    handleApiError(error, 'Error al obtener profesores');
  }
};

// 🎯 Obtener profesores por sección específica
// 🎯 Obtener profesores por sección específica
export const getTeachersBySection = async (sectionId: number | string): Promise<any> => {
  try {
    console.log(`🌐 Fetching teachers for section ${sectionId} from /api/teachers/section/${sectionId}`);
    
    const response = await apiClient.get<ApiResponse<any>>(`/api/teachers/section/${sectionId}`);
    console.log('📥 Teachers by section response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || `Error al obtener profesores de la sección ${sectionId}`);
    }
    
    // El endpoint devuelve una estructura con titular, all, otherTitular, specialists
    const data = response.data.data;
    
    // Validación de la estructura esperada
    if (!data || typeof data !== 'object') {
      throw new Error('Datos de profesores inválidos - estructura incorrecta');
    }
    
    // Validar que tenga las propiedades esperadas
    if (!Array.isArray(data.all)) {
      throw new Error('Datos de profesores inválidos - se esperaba array "all"');
    }
    
    return data; // Retornar la estructura completa
  } catch (error) {
    console.error(`💥 Error fetching teachers for section ${sectionId}:`, error);
    handleApiError(error, `Error al obtener profesores de la sección ${sectionId}`);
  }
};



// 🎯 Obtener estadísticas de profesores
export const getTeacherStats = async (): Promise<any> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>('/api/teachers/stats');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener estadísticas de profesores');
    }
    
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener estadísticas de profesores');
  }
};

// 🎯 Obtener carga de trabajo de un profesor
export const getTeacherWorkload = async (teacherId: number): Promise<any> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(`/api/teachers/${teacherId}/workload`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener carga de trabajo del profesor');
    }
    
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener carga de trabajo del profesor');
  }
};

// 🎯 Asignar profesor a sección
export const assignTeacherToSection = async (teacherId: number, sectionId: number): Promise<any> => {
  try {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/api/teachers/${teacherId}/assign/${sectionId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al asignar profesor a sección');
    }
    
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Error al asignar profesor a sección');
  }
};

// 🎯 Remover profesor de sección
export const removeTeacherFromSection = async (sectionId: number): Promise<any> => {
  try {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/api/teachers/remove/${sectionId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al remover profesor de sección');
    }
    
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Error al remover profesor de sección');
  }
};

// 🔧 Función reutilizable para manejar errores
function handleApiError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || fallbackMessage;
    const details = error.response?.data?.details || [];
    
    const err = new Error(message);
    (err as any).details = details;
    throw err;
  }
  
  if (error instanceof Error) {
    throw error;
  }
  
  throw new Error(fallbackMessage);
}

// 🔄 MANTENER COMPATIBILIDAD (deprecated)
export const getAvailableTeachers = fetchTeacherAvailabilityData;
export const getTeachers = getAllTeachers;