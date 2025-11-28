// src/app/auth/reset-password/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PasswordResetForm from "@/components/auth/password-reset/PasswordResetForm";
import PasswordResetBranding, {
  Lock,
  Eye,
  Zap,
  CheckCircle2,
} from "@/components/auth/password-reset/PasswordResetBranding";
import { usePasswordReset } from "@/hooks/usePasswordReset";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const { validateToken, isLoading } = usePasswordReset();

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setVerifyError("Token no proporcionado");
        setTokenValid(false);
        return;
      }

      try {
        await validateToken(token);
        setTokenValid(true);
      } catch (error) {
        setVerifyError(
          error instanceof Error ? error.message : "Token inválido o expirado"
        );
        setTokenValid(false);
      }
    };

    validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (tokenValid === null || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/20 mb-4">
            <div className="w-6 h-6 border-3 border-brand-200 dark:border-brand-800 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Validando enlace de recuperación...
          </p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950 p-4">
        <div className="w-full max-w-md">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Enlace Inválido
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {verifyError}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                El enlace de recuperación ha expirado o es inválido. Por favor,
                solicita uno nuevo.
              </p>
            </div>

            <div className="pt-4">
              <a
                href="/auth/password-reset/request"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-600 dark:bg-brand-500 text-white hover:bg-brand-700 dark:hover:bg-brand-600 transition-colors font-medium"
              >
                Solicitar Nuevo Enlace
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      <PasswordResetBranding
        title="Nueva Contraseña"
        subtitle="Crea una contraseña fuerte para asegurar tu cuenta y recuperar el acceso"
        features={[
          {
            icon: <Eye className="w-5 h-5 text-white" />,
            title: "Contraseña Visible",
            description: "Visualiza tu contraseña mientras la escribes",
          },
          {
            icon: <Zap className="w-5 h-5 text-white" />,
            title: "Requisitos Fuertes",
            description: "Mayúsculas, minúsculas, números y mínimo 8 caracteres",
          },
          {
            icon: <CheckCircle2 className="w-5 h-5 text-white" />,
            title: "Validación en Tiempo Real",
            description: "Verifica todos los requisitos mientras escribes",
          },
          {
            icon: <Lock className="w-5 h-5 text-white" />,
            title: "Encriptación Avanzada",
            description: "Tu contraseña se cifra con bcrypt nivel 10",
          },
        ]}
      />

      {/* Right Side - Form */}
      <PasswordResetForm token={token || undefined} />
    </div>
  );
}
