// src/services/authService.ts
import { api } from '@/config/api';  // ✅ Cambio aquí
import { UserPermissionsResponse } from '@/types/permissions.types'; 

export interface LoginCredentials {
  dpi?: string;
  email?: string;
  password: string;
  recaptchaToken?: string;
}

export const signin = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post(
      '/api/auth/signin',  // ✅ Sin API_BASE_URL
      credentials
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error en el inicio de sesión');
    }

    const { user } = response.data;
    return {
      id: user.id.toString(),
      fullName: `${user.givenNames} ${user.lastNames}`,
      username: user.email || user.givenNames,
      email: user.email || '',
    };
  } catch (error: any) {
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
  await api.post('/api/auth/logout', {});
};

export const verifySession = async () => {
  try {
    const response = await api.get('/api/auth/verify');
    
    // ✅ Verificar que la respuesta fue exitosa
    if (!response.data.success || !response.data.data) {
      throw new Error('Sesión inválida');
    }
    
    const user = response.data.data;
    
    if (!user?.id) {
      throw new Error('Respuesta de sesión inválida: sin ID de usuario');
    }
    
    
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
    const response = await api.get('/api/auth/me/permissions');
    
    return response.data.data;
  } catch (error) {
    return {
      permissions: [],
      role: null,
    };
  }
};