// src/constants/cascade-data-errors.ts
/**
 * Errores estandarizados del módulo Cascade Data
 * Define los códigos de error y mensajes consistentes en toda la aplicación
 */

export const CASCADE_ERROR_CODES = {
  // Errores de ciclo académico
  NO_ACTIVE_CYCLE: 'NO_ACTIVE_CYCLE',
  INVALID_CYCLE_ID: 'INVALID_CYCLE_ID',

  // Errores de bimestre
  NO_ACTIVE_BIMESTER: 'NO_ACTIVE_BIMESTER',
  INVALID_BIMESTER_ID: 'INVALID_BIMESTER_ID',

  // Errores de semanas
  NO_WEEKS: 'NO_WEEKS',
  INVALID_WEEK_ID: 'INVALID_WEEK_ID',

  // Errores de grados
  NO_GRADES: 'NO_GRADES',
  INVALID_GRADE_ID: 'INVALID_GRADE_ID',

  // Errores de cursos
  NO_COURSES: 'NO_COURSES',
  INVALID_COURSE_ID: 'INVALID_COURSE_ID',

  // Errores generales
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  INVALID_DATA_STRUCTURE: 'INVALID_DATA_STRUCTURE',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const CASCADE_ERROR_MESSAGES: Record<string, string> = {
  [CASCADE_ERROR_CODES.NO_ACTIVE_CYCLE]:
    'No hay un ciclo escolar activo en el sistema. Contacta al administrador para activar un ciclo.',
  [CASCADE_ERROR_CODES.INVALID_CYCLE_ID]:
    'El ID del ciclo escolar proporcionado es inválido.',
  [CASCADE_ERROR_CODES.NO_ACTIVE_BIMESTER]:
    'No hay bimestre activo para el ciclo escolar actual.',
  [CASCADE_ERROR_CODES.INVALID_BIMESTER_ID]:
    'El ID del bimestre proporcionado es inválido.',
  [CASCADE_ERROR_CODES.NO_WEEKS]:
    'No hay semanas académicas registradas para este bimestre.',
  [CASCADE_ERROR_CODES.INVALID_WEEK_ID]:
    'El ID de la semana proporcionado es inválido.',
  [CASCADE_ERROR_CODES.NO_GRADES]:
    'No hay grados registrados para este ciclo escolar.',
  [CASCADE_ERROR_CODES.INVALID_GRADE_ID]:
    'El ID del grado proporcionado es inválido.',
  [CASCADE_ERROR_CODES.NO_COURSES]:
    'No hay cursos registrados para este grado.',
  [CASCADE_ERROR_CODES.INVALID_COURSE_ID]:
    'El ID del curso proporcionado es inválido.',
  [CASCADE_ERROR_CODES.INVALID_PARAMETERS]:
    'Los parámetros proporcionados son inválidos.',
  [CASCADE_ERROR_CODES.INVALID_DATA_STRUCTURE]:
    'La estructura de datos recibida del servidor es inválida.',
  [CASCADE_ERROR_CODES.API_ERROR]:
    'Ocurrió un error al comunicarse con el servidor.',
  [CASCADE_ERROR_CODES.NETWORK_ERROR]:
    'Error de conexión de red. Verifica tu conexión a internet.',
  [CASCADE_ERROR_CODES.UNKNOWN_ERROR]:
    'Ocurrió un error desconocido. Por favor, intenta nuevamente.',
};

/**
 * Detecta el tipo de error basado en el mensaje de error
 */
export function detectCascadeErrorType(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('ciclo') && lowerMessage.includes('activo')) {
    return CASCADE_ERROR_CODES.NO_ACTIVE_CYCLE;
  }
  if (lowerMessage.includes('ciclo') && lowerMessage.includes('inválido')) {
    return CASCADE_ERROR_CODES.INVALID_CYCLE_ID;
  }
  if (lowerMessage.includes('bimestre') && lowerMessage.includes('activo')) {
    return CASCADE_ERROR_CODES.NO_ACTIVE_BIMESTER;
  }
  if (lowerMessage.includes('bimestre') && lowerMessage.includes('inválido')) {
    return CASCADE_ERROR_CODES.INVALID_BIMESTER_ID;
  }
  if (lowerMessage.includes('semana') || lowerMessage.includes('semanas')) {
    return lowerMessage.includes('inválido')
      ? CASCADE_ERROR_CODES.INVALID_WEEK_ID
      : CASCADE_ERROR_CODES.NO_WEEKS;
  }
  if (lowerMessage.includes('grado') || lowerMessage.includes('grados')) {
    return lowerMessage.includes('inválido')
      ? CASCADE_ERROR_CODES.INVALID_GRADE_ID
      : CASCADE_ERROR_CODES.NO_GRADES;
  }
  if (lowerMessage.includes('curso') || lowerMessage.includes('cursos')) {
    return lowerMessage.includes('inválido')
      ? CASCADE_ERROR_CODES.INVALID_COURSE_ID
      : CASCADE_ERROR_CODES.NO_COURSES;
  }
  if (lowerMessage.includes('red') || lowerMessage.includes('conexión')) {
    return CASCADE_ERROR_CODES.NETWORK_ERROR;
  }
  if (lowerMessage.includes('servidor')) {
    return CASCADE_ERROR_CODES.API_ERROR;
  }
  if (lowerMessage.includes('estructura') || lowerMessage.includes('inválida')) {
    return CASCADE_ERROR_CODES.INVALID_DATA_STRUCTURE;
  }

  return CASCADE_ERROR_CODES.UNKNOWN_ERROR;
}

/**
 * Obtiene el mensaje de error estandarizado
 */
export function getCascadeErrorMessage(
  errorType: string,
  defaultMessage?: string
): string {
  return (
    CASCADE_ERROR_MESSAGES[errorType] ||
    defaultMessage ||
    CASCADE_ERROR_MESSAGES[CASCADE_ERROR_CODES.UNKNOWN_ERROR]
  );
}
