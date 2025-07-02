// src/services/usePermission.ts
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { Role } from '@/types/role';

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
export const getRoles = async (): Promise<Role[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Role[]>>('/api/roles');
    
    if (!data.success) {
      throw new Error(data.message || 'La operación no fue exitosa');
    }
    
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage = axiosError.response?.data?.message 
        || axiosError.message 
        || 'Error al obtener los roles';
      throw new Error(errorMessage);
    }
    
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    
    throw new Error('Error inesperado al obtener los roles');
  }
};