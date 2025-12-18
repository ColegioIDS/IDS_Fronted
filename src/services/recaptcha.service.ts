// src/services/recaptcha.service.ts
import axios from 'axios';

interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  error_codes?: string[];
}

/**
 * Verifica el token de reCAPTCHA v3 en el servidor
 * @param token - Token generado por reCAPTCHA en el cliente
 * @returns Respuesta de verificación con score (0.0 - 1.0)
 */
export const verifyRecaptchaToken = async (
  token: string
): Promise<RecaptchaResponse> => {
  try {
    if (!token || token.trim() === '') {
      throw new Error('Token de reCAPTCHA vacío');
    }

    const response = await axios.post<RecaptchaResponse>(
      '/api/recaptcha/verify',
      { token },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 segundos timeout
      }
    );

    // Validar que la respuesta tenga los campos requeridos
    if (!response.data || typeof response.data.success !== 'boolean') {
      throw new Error('Respuesta inválida del servidor de reCAPTCHA');
    }

    return response.data;
  } catch (error: any) {
    // Logging detallado para debugging
    console.error('Error verifying reCAPTCHA token:', {
      message: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN',
      status: error?.response?.status || 'No status',
      responseData: error?.response?.data,
      fullError: error,
    });

    // Re-throw con información más clara
    if (error.response?.status === 400) {
      throw new Error('Token de reCAPTCHA inválido');
    } else if (error.response?.status === 500) {
      throw new Error('Error del servidor al verificar reCAPTCHA');
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('Tiempo de espera agotado al verificar reCAPTCHA');
    } else if (error.message === 'Network Error' || !navigator.onLine) {
      throw new Error('Sin conexión a internet. Verifica tu conexión.');
    } else if (error.response) {
      // Error de respuesta HTTP
      throw new Error(`Error del servidor: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      throw new Error('No se recibió respuesta del servidor de reCAPTCHA');
    } else {
      throw new Error('Error al verificar reCAPTCHA: ' + (error.message || 'Error desconocido'));
    }
  }
};

/**
 * Determina si el score de reCAPTCHA indica un usuario legítimo
 * @param score - Score de reCAPTCHA (0.0 - 1.0) o undefined
 * @param threshold - Umbral mínimo (por defecto 0.5)
 * @returns true si el score está por encima del umbral
 */
export const isValidRecaptchaScore = (
  score: number | undefined,
  threshold: number = 0.5
): boolean => {
  // Si no hay score pero success=true (claves de prueba), considerar válido
  if (score === undefined) {
    return true;
  }
  return score >= threshold;
};
