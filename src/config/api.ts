// src/config/api.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

/**
 * Crear instancia de axios configurada para el proyecto
 * Configura:
 * - Base URL
 * - Timeout
 * - Credenciales
 * - Validación de status (NO lanzar error automáticamente)
 */
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  // ⚠️ CRÍTICO: NO validar status (dejar que axios retorne la respuesta completa)
  validateStatus: () => true, // ← Retorna TODAS las respuestas, no lanza error
});

/**
 * Interceptor de request
 * Agrega token JWT si existe
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de response
 * Maneja errores comunes de autenticación
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Este interceptor casi no se ejecuta porque validateStatus: () => true
    // Pero si hay network error, sí entra aquí
    return Promise.reject(error);
  }
);

export { api };