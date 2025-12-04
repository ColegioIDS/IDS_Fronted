// src/utils/cascade-data-error.ts
/**
 * Clase de error personalizada para Cascade Data
 * Facilita la detección del tipo de error en componentes
 */

export type CascadeErrorCode =
  | 'NO_ACTIVE_CYCLE'
  | 'NO_ACTIVE_BIMESTER'
  | 'NO_WEEKS'
  | 'NO_GRADES'
  | 'NO_COURSES'
  | 'INVALID_ID'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_DATA'
  | 'UNKNOWN';

export class CascadeDataError extends Error {
  constructor(
    message: string,
    public readonly code: CascadeErrorCode = 'UNKNOWN'
  ) {
    super(message);
    this.name = 'CascadeDataError';
  }

  /**
   * Detecta el tipo de error basado en el mensaje
   */
  static fromMessage(message: string): CascadeDataError {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('ciclo') && lowerMessage.includes('activo')) {
      return new CascadeDataError(
        'No hay un ciclo escolar activo en el sistema',
        'NO_ACTIVE_CYCLE'
      );
    }

    if (lowerMessage.includes('bimestre') && lowerMessage.includes('activo')) {
      return new CascadeDataError(
        'No hay bimestre activo para el ciclo escolar',
        'NO_ACTIVE_BIMESTER'
      );
    }

    if (lowerMessage.includes('semana')) {
      return new CascadeDataError(
        'No hay semanas académicas registradas',
        'NO_WEEKS'
      );
    }

    if (lowerMessage.includes('grado')) {
      return new CascadeDataError(
        'No hay grados disponibles',
        'NO_GRADES'
      );
    }

    if (lowerMessage.includes('curso')) {
      return new CascadeDataError(
        'No hay cursos disponibles',
        'NO_COURSES'
      );
    }

    if (lowerMessage.includes('inválido')) {
      return new CascadeDataError(
        'ID inválido proporcionado',
        'INVALID_ID'
      );
    }

    if (lowerMessage.includes('estructura') || lowerMessage.includes('inválida')) {
      return new CascadeDataError(
        'Estructura de datos inválida',
        'INVALID_DATA'
      );
    }

    if (lowerMessage.includes('red') || lowerMessage.includes('conexión')) {
      return new CascadeDataError(
        'Error de conexión de red',
        'NETWORK_ERROR'
      );
    }

    if (lowerMessage.includes('servidor')) {
      return new CascadeDataError(
        'Error del servidor',
        'API_ERROR'
      );
    }

    return new CascadeDataError(message, 'UNKNOWN');
  }
}
