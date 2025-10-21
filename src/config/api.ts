import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

// ✅ Crear instancia de axios con withCredentials
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // Incluir cookies en todas las peticiones
});

export default api;