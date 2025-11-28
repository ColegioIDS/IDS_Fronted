// src/hooks/usePasswordReset.ts
"use client";

import { useState, useCallback } from "react";
import { passwordResetService } from "@/services/password-reset.service";

export interface UsePasswordResetReturn {
  requestReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  validateToken: (token: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  successMessage: string | null;
  clearError: () => void;
}

export function usePasswordReset(): UsePasswordResetReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const requestReset = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);

    try {
      const response = await passwordResetService.requestReset({ email });
      setSuccess(true);
      // El mensaje del backend está en response.data.message (dentro de data)
      const message = response.data?.message || response.message || "Enlace enviado correctamente";
      setSuccessMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateToken = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await passwordResetService.validateToken(token);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token inválido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await passwordResetService.resetPassword({ token, newPassword: password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer contraseña");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    requestReset,
    resetPassword,
    validateToken,
    isLoading,
    error,
    success,
    successMessage,
    clearError,
  };
}
