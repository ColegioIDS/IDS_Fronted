// src/utils/handleApiError.ts

import { toast } from 'sonner';

/**
 * Interfaz para error manejado
 */
interface HandledError {
  message: string;
  details: string[];
}

/**
 * Manejo centralizado de errores de API
 * 
 * Extrae el mensaje y detalles del error del backend
 * Muestra automáticamente un toast con el error
 * Retorna un objeto con mensaje y detalles para uso adicional
 * 
 * @param error - Error capturado en try/catch
 * @param defaultMessage - Mensaje por defecto si no hay mensaje en el error
 * @returns Objeto con mensaje y detalles del error
 * 
 * @example
 * ```ts
 * try {
 *   await service.create(data);
 * } catch (err: any) {
 *   const handled = handleApiError(err, 'Error al crear');
 *   setError({
 *     title: 'Error',
 *     message: handled.message,
 *     details: handled.details
 *   });
 * }
 * ```
 */
export function handleApiError(
  error: any,
  defaultMessage = 'Error inesperado'
): HandledError {
  let message = defaultMessage;
  let details: string[] = [];

  // Extraer del response del backend
  if (error.response?.data) {
    const data = error.response.data;
    message = data.message || message;
    details = Array.isArray(data.details) ? data.details : [];
  } else if (error.message) {
    message = error.message;
  }

  // Mostrar toast automáticamente
  toast.error(message, {
    description: details.length > 0 ? details[0] : undefined,
    duration: 5000,
  });

  // Log para debugging (solo en development)
  if (process.env.NODE_ENV === 'development') {
    
  }

  return { message, details };
}

/**
 * Muestra un toast de éxito
 * 
 * @param message - Mensaje de éxito
 * @param details - Detalles adicionales (opcional)
 * 
 * @example
 * ```ts
 * handleApiSuccess('Registro creado correctamente');
 * handleApiSuccess('Guardado', ['Se guardaron 3 registros']);
 * ```
 */
export function handleApiSuccess(message: string, details?: string[]) {
  toast.success(message, {
    description: details?.[0],
    duration: 3000,
  });

  // Log para debugging (solo en development)
  if (process.env.NODE_ENV === 'development') {
  }
}

/**
 * Muestra un toast de advertencia
 * 
 * @param message - Mensaje de advertencia
 * @param details - Detalles adicionales (opcional)
 */
export function handleApiWarning(message: string, details?: string[]) {
  toast.warning(message, {
    description: details?.[0],
    duration: 4000,
  });
}

/**
 * Muestra un toast de información
 * 
 * @param message - Mensaje informativo
 * @param details - Detalles adicionales (opcional)
 */
export function handleApiInfo(message: string, details?: string[]) {
  toast.info(message, {
    description: details?.[0],
    duration: 3000,
  });
}

/**
 * Verifica si un error es de tipo específico
 * 
 * @param error - Error a verificar
 * @param statusCode - Código HTTP a verificar
 * @returns true si el error tiene el código especificado
 * 
 * @example
 * ```ts
 * if (isErrorWithStatus(error, 404)) {
 *   console.log('Recurso no encontrado');
 * }
 * ```
 */
export function isErrorWithStatus(error: any, statusCode: number): boolean {
  return error?.response?.status === statusCode;
}

/**
 * Verifica si un error es de validación (400)
 */
export function isValidationError(error: any): boolean {
  return isErrorWithStatus(error, 400);
}

/**
 * Verifica si un error es de autenticación (401)
 */
export function isAuthError(error: any): boolean {
  return isErrorWithStatus(error, 401);
}

/**
 * Verifica si un error es de permisos (403)
 */
export function isPermissionError(error: any): boolean {
  return isErrorWithStatus(error, 403);
}

/**
 * Verifica si un error es de recurso no encontrado (404)
 */
export function isNotFoundError(error: any): boolean {
  return isErrorWithStatus(error, 404);
}

/**
 * Verifica si un error es de conflicto (409)
 */
export function isConflictError(error: any): boolean {
  return isErrorWithStatus(error, 409);
}

/**
 * Extrae los detalles de validación de un error
 * 
 * @param error - Error de validación
 * @returns Array de mensajes de validación
 */
export function getValidationErrors(error: any): string[] {
  if (error?.response?.data?.details) {
    return Array.isArray(error.response.data.details)
      ? error.response.data.details
      : [error.response.data.details];
  }
  return [];
}

export default handleApiError;
