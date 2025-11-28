// src/hooks/useEmailVerification.ts
"use client";

import { useState, useCallback } from "react";
import { emailVerificationService } from "@/services/email-verification.service";

export interface UseEmailVerificationReturn {
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  successMessage: string | null;
  clearError: () => void;
}

export function useEmailVerification(): UseEmailVerificationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const verifyEmail = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);

    try {
      const response = await emailVerificationService.verifyEmail({ token });
      setSuccess(true);
      const message = response.data?.message || response.message || "Correo verificado correctamente";
      setSuccessMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);

    try {
      const response = await emailVerificationService.resendVerificationEmail(email);
      setSuccess(true);
      const message = response.data?.message || response.message || "Enlace de verificación reenviado";
      setSuccessMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    verifyEmail,
    resendVerificationEmail,
    isLoading,
    error,
    success,
    successMessage,
    clearError,
  };
}
