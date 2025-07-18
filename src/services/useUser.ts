//src\services\useUser.ts
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { User, CreateUserPayload } from '@/types/user';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUsers = async (): Promise<User[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/api/users');

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener los usuarios');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener los usuarios');
  }
};

export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<User>>(`/api/users/${userId}`);

    if (!data.success) {
      if (data.message === 'User not found') return null;
      throw new Error(data.message || 'Error al obtener el usuario');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el usuario');
  }
};

export const createUser = async (user: CreateUserPayload): Promise<User> => {
  try {
    const { data } = await apiClient.post<ApiResponse<User>>('/api/users', user);

    if (!data.success) {
      const error = new Error(data.message || 'Error al crear el usuario');
      (error as any).details = data.details ?? [];
      throw error;
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear el usuario');
  }
};

export const deleteUser = async (userId: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/api/users/${userId}`);

    if (!data.success) {
      throw new Error(data.message || 'Error al eliminar el usuario');
    }
  } catch (error) {
    handleApiError(error, 'Error al eliminar el usuario');
  }
};

export const updateUser = async (userId: number, updates: Partial<User>): Promise<User> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<User>>(`/api/users/${userId}`, updates);

    if (!data.success) {
      const error = new Error(data.message || 'Error al actualizar el usuario');
      (error as any).details = data.details ?? [];
      throw error;
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar el usuario');
  }
};

export const changeUserStatus = async (userId: number, isActive: boolean): Promise<User> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<User>>(`/api/users/${userId}/status`, {
      isActive,
    });

    if (!data.success) {
      const error = new Error(data.message || 'Error al cambiar el estado del usuario');
      (error as any).details = data.details ?? [];
      throw error;
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al cambiar el estado del usuario');
  }
};


// Función reutilizable para manejar errores
function handleApiError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message || error.message || fallbackMessage;
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
