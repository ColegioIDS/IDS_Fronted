// src/config/api.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

// ✅ Exportar API_BASE_URL para que lo usen otros servicios
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000';

/**
 * Crear instancia de axios configurada para el proyecto
 * Configura:
 * - Base URL
 * - Timeout
 * - Credenciales (CRÍTICO para cookies)
 * - Validación de status (NO lanzar error automáticamente)
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,  // ✅ CRÍTICO: Permite enviar y recibir cookies
  headers: {
    'Content-Type': 'application/json',
  },
  // ⚠️ CRÍTICO: NO validar status (dejar que axios retorne la respuesta completa)
  validateStatus: () => true, // ← Retorna TODAS las respuestas, no lanza error
});

/**
 * Interceptor de request
 * NOTA: Las cookies se envían automáticamente gracias a withCredentials: true
 * El backend maneja las cookies en los headers Set-Cookie
 */
api.interceptors.request.use(
  (config) => {
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

/**
 * Cliente API sin autenticación para rutas públicas
 * Se usa para endpoints que NO requieren token/cookies
 * 
 * Ejemplo: POST /verify-email/verify (verificación pública)
 */
const publicApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: false,  // ❌ NO enviar cookies
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: () => true, // Retorna TODAS las respuestas
});

export { publicApi };