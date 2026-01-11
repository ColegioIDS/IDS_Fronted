// src/services/recaptcha.service.ts
/**
 * Servicio de reCAPTCHA v3 para el frontend
 * Nota: La verificación del token se realiza en el backend
 * Este servicio solo proporciona funciones útiles locales
 */

/**
 * Determina si el score de reCAPTCHA indica un usuario legítimo
 * @param score - Score de reCAPTCHA (0.0 - 1.0) o undefined
 * @param threshold - Umbral mínimo (por defecto 0.5)
 * @returns true si el score está por encima del umbral
 * 
 * Nota: Esta función es principalmente para referencia.
 * La validación real se realiza en el backend.
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
