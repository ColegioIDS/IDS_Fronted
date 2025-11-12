// src/services/api.ts
import axios from 'axios';
import { api } from '@/config/api';

// ⚠️ Este archivo está duplicado - Se recomienda usar @/config/api en su lugar
// Mantenido por compatibilidad con código existente
export const apiClient = api;

// ✅ No es necesario - las cookies se envían automáticamente con withCredentials: true
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Interceptor para errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default apiClient;