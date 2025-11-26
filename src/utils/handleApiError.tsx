// src/utils/handleApiError.ts

import { toast } from 'sonner';

interface ApiErrorResponse {
  success: false;
  message: string;
  details?: string[];
}

interface HandledError {
  message: string;
  details: string[];
}

/**
 * Maneja errores de API de manera consistente
 * - Extrae mensaje y detalles del error
 * - Muestra toast con el mensaje
 * - Retorna objeto con message y details para usar en UI
 *
 * @param error - Error capturado del catch
 * @param defaultMessage - Mensaje por defecto si no hay respuesta de API
 * @returns Objeto con {message, details} para mostrar en UI
 *
 * @example
 * try {
 *   await service.delete(id)
 * } catch (err) {
 *   const handled = handleApiError(err, 'Error al eliminar')
 *   setGlobalError({
 *     title: 'Error',
 *     message: handled.message,
 *     details: handled.details
 *   })
 * }
 */
export function handleApiError(
  error: any,
  defaultMessage = 'Error inesperado'
): HandledError {
  let message = defaultMessage;
  let details: string[] = [];

  // ✅ Extraer datos de respuesta API
  if (error.response?.data) {
    const data: ApiErrorResponse = error.response.data;
    
    // Usar mensaje del backend si existe
    if (data.message) {
      message = data.message;
    }
    
    // Extraer detalles si existen
    if (Array.isArray(data.details)) {
      details = data.details;
    }
  } 
  // ✅ Fallback a error message si no hay response
  else if (error.message) {
    message = error.message;
  }

  // ✅ Mostrar toast con el mensaje
  toast.error(message, {
    description: details.length > 0 ? details[0] : undefined,
    duration: 5000,
  });

  return { message, details };
}

/**
 * Alias para success (cuando necesitas mostrar confirmación)
 */
export function handleApiSuccess(message: string, details?: string[]) {
  toast.success(message, {
    description: details?.[0],
    duration: 3000,
  });
}

/**
 * Manejo de error genérico sin toast (para validaciones client)
 */
export function parseApiError(error: any): HandledError {
  let message = 'Error inesperado';
  let details: string[] = [];

  if (error.response?.data) {
    const data: ApiErrorResponse = error.response.data;
    message = data.message || message;
    details = Array.isArray(data.details) ? data.details : [];
  } else if (error.message) {
    message = error.message;
  }

  return { message, details };
}