// src/services/useRole.ts
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

export const createRole = async (role: Role): Promise<Role> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Role>>('/api/roles', role);

    if (!data.success) {
      const error = new Error(data.message || 'La operación no fue exitosa');
      (error as any).details = data.details ?? []; // ✅ asignamos los detalles
      throw error;
    }

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || error.message || 'Error al crear el rol';
      const details = error.response?.data?.details || [];

      const err = new Error(message);
      (err as any).details = details; // ✅ propagamos los detalles
      throw err;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Error inesperado al crear el rol');
  }
};


export const deleteRole = async (roleId: string): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/api/roles/${roleId}`);

    if (!data.success) {
      throw new Error(data.message || 'La operación no fue exitosa');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || error.message || 'Error al eliminar el rol';
      throw new Error(message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Error inesperado al eliminar el rol');
  }
}


export const updateRole = async (
  roleId: string,
  updates: Partial<Role>
): Promise<Role> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<Role>>(`/api/roles/${roleId}`, updates);

    if (!data.success) {
      const error = new Error(data.message || 'La operación no fue exitosa');
      (error as any).details = data.details ?? [];
      throw error;
    }

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || error.message || 'Error al actualizar el rol';
      const details = error.response?.data?.details || [];

      const err = new Error(message);
      (err as any).details = details;
      throw err;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Error inesperado al actualizar el rol');
  }
};

