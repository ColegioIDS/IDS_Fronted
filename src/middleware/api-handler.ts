/**
 * ====================================================================
 * API HANDLER MIDDLEWARE - Manejo centralizado de errores y respuestas
 * ====================================================================
 *
 * Centraliza la lógica de manejo de errores para todas las llamadas API
 * del módulo de asistencia. Evita duplicación de código en services/hooks.
 */

import { AxiosError } from 'axios';

/**
 * Tipos de errores API
 */
export enum ApiErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Estructura estandarizada de error API
 */
export interface ApiErrorResponse {
  type: ApiErrorType;
  statusCode: number;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Respuesta estándar de API
 */
export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: ApiErrorResponse;
  message?: string;
  timestamp: string;
}

/**
 * Parsea errores de Axios a formato estandarizado
 * @param error - Error de Axios
 * @returns ApiErrorResponse formateado
 */
export function parseApiError(error: unknown): ApiErrorResponse {
  const timestamp = new Date().toISOString();

  // Error de Axios
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const data = error.response?.data as Record<string, unknown> | undefined;

    // Validación (400)
    if (status === 400) {
      return {
        type: ApiErrorType.VALIDATION,
        statusCode: status,
        message: (data?.message as string) || 'Validación fallida',
        details: (data?.errors as Record<string, unknown>) || (data?.details as Record<string, unknown>),
        timestamp,
      };
    }

    // No autorizado (401)
    if (status === 401) {
      return {
        type: ApiErrorType.UNAUTHORIZED,
        statusCode: status,
        message: 'No autorizado. Inicia sesión nuevamente.',
        timestamp,
      };
    }

    // Prohibido (403)
    if (status === 403) {
      return {
        type: ApiErrorType.FORBIDDEN,
        statusCode: status,
        message: 'No tienes permiso para esta acción.',
        timestamp,
      };
    }

    // No encontrado (404)
    if (status === 404) {
      return {
        type: ApiErrorType.NOT_FOUND,
        statusCode: status,
        message: 'Recurso no encontrado.',
        timestamp,
      };
    }

    // Conflicto (409)
    if (status === 409) {
      return {
        type: ApiErrorType.CONFLICT,
        statusCode: status,
        message: (data?.message as string) || 'Conflicto de datos. Recarga e intenta nuevamente.',
        details: data?.details as Record<string, unknown>,
        timestamp,
      };
    }

    // Error del servidor (5xx)
    if (status >= 500) {
      return {
        type: ApiErrorType.SERVER_ERROR,
        statusCode: status,
        message: 'Error del servidor. Intenta más tarde.',
        timestamp,
      };
    }

    // Error de red
    if (!error.response) {
      return {
        type: ApiErrorType.NETWORK_ERROR,
        statusCode: 0,
        message: 'Error de conexión. Verifica tu internet.',
        timestamp,
      };
    }

    // Otros errores HTTP
    return {
      type: ApiErrorType.UNKNOWN,
      statusCode: status,
      message: (data?.message as string) || error.message || 'Error desconocido',
      details: data?.details as Record<string, unknown>,
      timestamp,
    };
  }

  // Error genérico de JavaScript
  if (error instanceof Error) {
    return {
      type: ApiErrorType.UNKNOWN,
      statusCode: 0,
      message: error.message,
      timestamp,
    };
  }

  // Error desconocido
  return {
    type: ApiErrorType.UNKNOWN,
    statusCode: 0,
    message: 'Error desconocido',
    timestamp,
  };
}

/**
 * Lanza un error API con información formateada
 * @param error - Error a procesar
 * @throws ApiErrorResponse formateado
 */
export function throwApiError(error: unknown): never {
  const apiError = parseApiError(error);
  throw apiError;
}

/**
 * Valida respuesta de API
 * @param response - Respuesta de API
 * @returns true si es válida
 */
export function isValidApiResponse(response: unknown): response is ApiResponse {
  if (!response || typeof response !== 'object') {
    return false;
  }
  return 'success' in response && 'timestamp' in response;
}

/**
 * Extrae datos de respuesta API seguramente
 * @param response - Respuesta de API
 * @returns Datos extraídos o null
 */
export function extractApiData<T = unknown>(response: unknown): T | null {
  if (!isValidApiResponse(response) || !response.success) {
    return null;
  }
  return (response.data || null) as T | null;
}
