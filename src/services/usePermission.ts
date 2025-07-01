// src/services/usePermission.ts
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { Permission } from '@/types/permission';

import { ApiResponse } from '@/types/api';

// Definimos el tipo para la respuesta de la API

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Obtiene la lista de permisos desde el backend
 * @returns Promise con el array de permisos
 * @throws Error con mensaje descriptivo del problema
 */
export const getPermissions = async (): Promise<Permission[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Permission[]>>('/api/permissions');
    
    if (!data.success) {
      throw new Error(data.message || 'La operación no fue exitosa');
    }
    
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage = axiosError.response?.data?.message 
        || axiosError.message 
        || 'Error al obtener los permisos';
      throw new Error(errorMessage);
    }
    
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    
    throw new Error('Error inesperado al obtener los permisos');
  }
};