// src/services/password-reset.service.ts
import { api } from "@/config/api";

export interface RequestPasswordResetPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  data?: {
    message?: string;
    valid?: boolean;
    email?: string;
  };
  error?: string | Record<string, string[]>;
}

class PasswordResetService {
  /**
   * Solicita un enlace de recuperación de contraseña
   * POST /api/password-reset/request
   * @param payload - Objeto con el email del usuario
   * @returns Respuesta del servidor
   */
  async requestReset(
    payload: RequestPasswordResetPayload
  ): Promise<PasswordResetResponse> {
    try {
      const response = await api.post<PasswordResetResponse>(
        "/api/password-reset/request",
        payload
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Error al solicitar recuperación");
      }

      return response.data;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Error al solicitar recuperación de contraseña"
      );
    }
  }

  /**
   * Valida que el token de recuperación sea válido
   * GET /api/password-reset/validate?token=TOKEN
   * @param token - Token de recuperación
   * @returns Respuesta del servidor con validación
   */
  async validateToken(token: string): Promise<PasswordResetResponse> {
    try {
      const response = await api.get<PasswordResetResponse>(
        `/api/password-reset/validate?token=${token}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Error validando token");
      }

      if (!response.data.data?.valid) {
        throw new Error("Token inválido o expirado");
      }

      return response.data;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Token de recuperación inválido o expirado"
      );
    }
  }

  /**
   * Restablece la contraseña con el token y nueva contraseña
   * POST /api/password-reset/reset
   * @param payload - Objeto con token y nueva contraseña
   * @returns Respuesta del servidor
   */
  async resetPassword(
    payload: ResetPasswordPayload
  ): Promise<PasswordResetResponse> {
    try {
      const response = await api.post<PasswordResetResponse>(
        "/api/password-reset/reset",
        payload
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Error al restablecer contraseña");
      }

      return response.data;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Error al restablecer contraseña"
      );
    }
  }
}

export const passwordResetService = new PasswordResetService();
