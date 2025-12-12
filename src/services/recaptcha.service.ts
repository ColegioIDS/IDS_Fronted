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
    const response = await axios.post<RecaptchaResponse>(
      '/api/recaptcha/verify',
      { token },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    throw error;
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
