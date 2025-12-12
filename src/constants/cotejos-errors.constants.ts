/**
 * Constantes de errores para el módulo de Cotejos
 * Mapeo de error codes a mensajes amigables para el usuario
 */

// ==================== ERROR CODES ====================

export const COTEJOS_ERROR_CODES = {
  // Errores generales
  NO_ACTIVE_CYCLE: 'NO_ACTIVE_CYCLE',
  COTEJO_NOT_FOUND: 'COTEJO_NOT_FOUND',
  ENROLLMENT_NOT_FOUND: 'ENROLLMENT_NOT_FOUND',
  COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
  BIMESTER_NOT_FOUND: 'BIMESTER_NOT_FOUND',
  COTEJO_ALREADY_COMPLETED: 'COTEJO_ALREADY_COMPLETED',
  INVALID_SCORE_RANGE: 'INVALID_SCORE_RANGE',
  INCOMPLETE_COTEJO: 'INCOMPLETE_COTEJO',
  SCORE_EXCEEDS_MAXIMUM: 'SCORE_EXCEEDS_MAXIMUM',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// ==================== ERROR MESSAGES ====================

export const COTEJOS_ERROR_MESSAGES: Record<string, string> = {
  // Cascade
  NO_ACTIVE_CYCLE:
    'No hay un ciclo escolar activo en este momento. Por favor, contacta al administrador.',

  // Generate Cotejo
  COTEJO_ALREADY_COMPLETED:
    'Este cotejo ya ha sido completado y no puede ser modificado. Si necesitas actualizarlo, contacta al administrador.',
  ENROLLMENT_NOT_FOUND: 'La inscripción del estudiante no fue encontrada. Intenta recargar la página.',
  COURSE_NOT_FOUND: 'El curso no fue encontrado. Intenta recargar la página.',
  BIMESTER_NOT_FOUND: 'El bimestre no fue encontrado. Intenta recargar la página.',

  // Get Cotejo
  COTEJO_NOT_FOUND: 'El cotejo no fue encontrado. Intenta recargar la página.',

  // Update Score
  INVALID_SCORE_RANGE:
    'La puntuación está fuera del rango permitido. Verifica el rango válido para este componente.',
  SCORE_EXCEEDS_MAXIMUM: 'La suma total de puntuaciones no puede exceder 100 puntos.',

  // Submit Cotejo
  INCOMPLETE_COTEJO:
    'El cotejo no está completo. Asegúrate de completar todos los componentes requeridos antes de enviar.',

  // Network/General
  NETWORK_ERROR:
    'Hubo un problema de conexión. Intenta nuevamente en unos momentos.',
  UNKNOWN_ERROR:
    'Ocurrió un error inesperado. Por favor, intenta nuevamente o contacta al soporte técnico.',
} as const;

// ==================== ERROR TYPES ====================

export const COTEJOS_ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ==================== ERROR UTILITIES ====================

/**
 * Obtiene el mensaje de error amigable para mostrar al usuario
 */
export const getErrorMessage = (errorCode: string | undefined): string => {
  if (!errorCode) return COTEJOS_ERROR_MESSAGES.UNKNOWN_ERROR;
  return COTEJOS_ERROR_MESSAGES[errorCode] || COTEJOS_ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Determina si un error es recuperable (el usuario puede intentar nuevamente)
 */
export const isRecoverableError = (errorCode: string | undefined): boolean => {
  const nonRecoverableErrors = [
    COTEJOS_ERROR_CODES.COTEJO_ALREADY_COMPLETED,
    COTEJOS_ERROR_CODES.COTEJO_NOT_FOUND,
    COTEJOS_ERROR_CODES.ENROLLMENT_NOT_FOUND,
    COTEJOS_ERROR_CODES.COURSE_NOT_FOUND,
    COTEJOS_ERROR_CODES.BIMESTER_NOT_FOUND,
  ];
  return !nonRecoverableErrors.includes(errorCode as any);
};

/**
 * Determina si es un error de validación de rango de puntuación
 */
export const isScoreRangeError = (errorCode: string | undefined): boolean => {
  return (
    errorCode === COTEJOS_ERROR_CODES.INVALID_SCORE_RANGE ||
    errorCode === COTEJOS_ERROR_CODES.SCORE_EXCEEDS_MAXIMUM
  );
};

/**
 * Interfaz para errores de API del módulo Cotejos
 */
export interface CotejosApiError {
  success: false;
  errorCode: string;
  errorType: string;
  message: string;
  detail?: string;
  data: null;
}

/**
 * Type guard para verificar si es un error de Cotejos
 */
export const isCotejosApiError = (error: any): error is CotejosApiError => {
  return (
    error &&
    typeof error === 'object' &&
    error.success === false &&
    typeof error.errorCode === 'string' &&
    typeof error.message === 'string'
  );
};
