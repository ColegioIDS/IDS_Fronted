// src/services/authService.ts
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { UserPermissionsResponse } from '@/types/permissions'; 
export interface LoginCredentials {
  dpi?: string;
  email?: string;
  password: string;
}

export const signin = async (credentials: LoginCredentials) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/signin`, 
      credentials, 
      { withCredentials: true }
    );

    // ✨ Backend retorna: { success: true, user: {...}, token?: string }
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error en el inicio de sesión');
    }

    // ✨ Transformar a formato esperado por tu contexto
    const { user } = response.data;
    return {
      id: user.id.toString(),
      fullName: `${user.givenNames} ${user.lastNames}`,
      username: user.email || user.givenNames,
      email: user.email || '',
    };
  } catch (error: any) {
    // ✨ Manejar errores estructurados del backend
    if (error.response?.data) {
      const { message, details } = error.response.data;
      throw {
        message: message || 'Error al iniciar sesión',
        details: details || [message],
      };
    }
    throw error;
  }
};

export const logout = async () => {
  await axios.post(
    `${API_BASE_URL}/api/auth/logout`, 
    {}, 
    { withCredentials: true }
  );
};

export const verifySession = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/auth/verify`, 
      { withCredentials: true }
    );
    
    // ✨ Backend retorna: { success: true, data: {...} }
    const user = response.data.data;
    return {
      id: user.id.toString(),
      fullName: `${user.givenNames} ${user.lastNames}`,
      username: user.email || user.givenNames,
      email: user.email || '',
    };
  } catch (error) {
    throw new Error('Sesión inválida');
  }
};


export const getMyPermissions = async (): Promise<UserPermissionsResponse> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/auth/me/permissions`,
      { withCredentials: true }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return {
      permissions: [],
      role: null,
    };
  }
};