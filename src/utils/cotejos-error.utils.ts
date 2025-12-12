/**
 * Utilidades para manejo de errores de API
 */

import { AxiosError } from 'axios';
import {
  CotejosApiError,
  isCotejosApiError,
  COTEJOS_ERROR_CODES,
} from '@/constants/cotejos';

/**
 * Error customizado para Cotejos API
 */
export class CotejosError extends Error {
  constructor(
    public errorCode: string,
    public errorType: string,
    message: string,
    public detail?: string,
  ) {
    super(message);
    this.name = 'CotejosError';
  }
}

/**
 * Extrae y convierte un error de axios a CotejosError
 */
export const extractCotejosError = (error: unknown): CotejosError => {
  // Si es un error que ya hemos procesado en validateApiResponse
  if (error instanceof Error && (error as any).isApiError && (error as any).response?.data) {
    const data = (error as any).response.data;
    if (isCotejosApiError(data)) {
      return new CotejosError(
        data.errorCode,
        data.errorType || 'UNKNOWN',
        data.message || 'Error desconocido',
        data.detail,
      );
    }
  }

  // Si es un AxiosError
  if (error instanceof AxiosError) {
    const data = error.response?.data as any;

    // Si tiene el formato de error de Cotejos API
    if (isCotejosApiError(data)) {
      return new CotejosError(
        data.errorCode,
        data.errorType || 'UNKNOWN',
        data.message || 'Error desconocido',
        data.detail,
      );
    }

    // Si es un error de red
    if (error.code === 'ERR_NETWORK') {
      return new CotejosError(
        COTEJOS_ERROR_CODES.NETWORK_ERROR,
        'NETWORK_ERROR',
        'No hay conexión con el servidor',
      );
    }

    // Error genérico de axios
    return new CotejosError(
      error.code || COTEJOS_ERROR_CODES.UNKNOWN_ERROR,
      'HTTP_ERROR',
      error.message || 'Error en la solicitud HTTP',
    );
  }

  // Si es un CotejosError, devolverlo tal cual
  if (error instanceof CotejosError) {
    return error;
  }

  // Error desconocido
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  return new CotejosError(
    COTEJOS_ERROR_CODES.UNKNOWN_ERROR,
    'UNKNOWN',
    errorMessage,
  );
};

/**
 * Log de error con contexto
 */
export const logCotejosError = (
  errorCode: string,
  context: string,
  detail?: string,
): void => {
  
};
