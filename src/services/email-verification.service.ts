// src/services/email-verification.service.ts
import { api } from "@/config/api";

export interface VerifyEmailPayload {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  data?: {
    message?: string;
    verified?: boolean;
    email?: string;
  };
  error?: string | Record<string, string[]>;
}

class EmailVerificationService {
  /**
   * Verifica un correo electrónico usando un token
   * POST /api/email-verification/verify
   * @param payload - Objeto con el token de verificación
   * @returns Respuesta del servidor
   */
  async verifyEmail(
    payload: VerifyEmailPayload
  ): Promise<VerifyEmailResponse> {
    try {
      const response = await api.post<VerifyEmailResponse>(
        "/api/email-verification/verify",
        payload
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Error al verificar correo");
      }

      return response.data;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Error al verificar el correo electrónico"
      );
    }
  }

  /**
   * Solicita un nuevo enlace de verificación
   * POST /api/email-verification/resend
   * @param email - Email del usuario
   * @returns Respuesta del servidor
   */
  async resendVerificationEmail(email: string): Promise<VerifyEmailResponse> {
    try {
      const response = await api.post<VerifyEmailResponse>(
        "/api/email-verification/resend",
        { email }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Error al reenviar correo de verificación"
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Error al reenviar correo de verificación"
      );
    }
  }
}

export const emailVerificationService = new EmailVerificationService();
