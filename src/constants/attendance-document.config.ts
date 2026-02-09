/**
 * ====================================================================
 * Configuración de Documentos de Asistencia
 * ====================================================================
 */

export const ATTENDANCE_DOCUMENT_CONFIG = {
  // Documentos
  DOCUMENT: {
    MAX_SIZE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    MIN_SIZE_KB: 100,
    MIN_SIZE_BYTES: 100 * 1024,
    ALLOWED_TYPES: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  },

  // Notas
  NOTES: {
    DEFAULT_MIN: 10,
    DEFAULT_MAX: 500,
    COORDINATOR_MAX: 1000,
  },

  // Mensajes de Error
  ERRORS: {
    NO_PERMISSION: 'No tienes permiso para realizar esta acción',
    NOTES_REQUIRED: 'Las notas son requeridas',
    NOTES_TOO_SHORT: (min: number) => `Mínimo ${min} caracteres`,
    NOTES_TOO_LONG: (max: number) => `Máximo ${max} caracteres`,
    FILE_REQUIRED: 'El documento es requerido',
    FILE_TOO_LARGE: 'Archivo demasiado grande (máx 5 MB)',
    FILE_TOO_SMALL: 'Archivo demasiado pequeño (mín 100 KB)',
    FILE_INVALID_TYPE: 'Tipo de archivo no permitido (PDF, JPG, PNG, DOC)',
  },
};

/**
 * Validar documento
 */
export function validateDocument(file: File): { valid: boolean; error?: string } {
  const config = ATTENDANCE_DOCUMENT_CONFIG.DOCUMENT;

  if (file.size > config.MAX_SIZE_BYTES) {
    return { valid: false, error: ATTENDANCE_DOCUMENT_CONFIG.ERRORS.FILE_TOO_LARGE };
  }

  if (file.size < config.MIN_SIZE_BYTES) {
    return { valid: false, error: ATTENDANCE_DOCUMENT_CONFIG.ERRORS.FILE_TOO_SMALL };
  }

  if (!config.ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: ATTENDANCE_DOCUMENT_CONFIG.ERRORS.FILE_INVALID_TYPE };
  }

  return { valid: true };
}

/**
 * Validar notas
 */
export function validateNotes(
  notes: string,
  minLength?: number | null,
  maxLength?: number | null,
  required?: boolean
): { valid: boolean; error?: string } {
  if (required && !notes.trim()) {
    return { valid: false, error: ATTENDANCE_DOCUMENT_CONFIG.ERRORS.NOTES_REQUIRED };
  }

  if (minLength && notes.length < minLength) {
    return { valid: false, error: ATTENDANCE_DOCUMENT_CONFIG.ERRORS.NOTES_TOO_SHORT(minLength) };
  }

  if (maxLength && notes.length > maxLength) {
    return { valid: false, error: ATTENDANCE_DOCUMENT_CONFIG.ERRORS.NOTES_TOO_LONG(maxLength) };
  }

  return { valid: true };
}
