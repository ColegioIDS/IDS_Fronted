// src/app/auth/password-reset/page.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PasswordResetForm from "@/components/auth/password-reset/PasswordResetForm";
import { usePasswordReset } from "@/hooks/usePasswordReset";

function PasswordResetContent() {
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
  }, [token, validateToken]);

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
                href="/auth/password-recovery"
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
      {/* Left Side - Branding (opcional para mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-700 dark:from-brand-900 dark:to-brand-800 p-8 flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Nueva Contraseña
          </h2>
          <p className="text-brand-100">
            Crea una contraseña fuerte para asegurar tu cuenta
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-white">Contraseña Única</h3>
              <p className="text-sm text-brand-100">
                Crea una contraseña que no uses en otros sitios
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.93 7.06A9.972 9.972 0 012 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2a9.972 9.972 0 00-9.07 5.06M9 11l3 3L22 4" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-white">Requisitos Fuertes</h3>
              <p className="text-sm text-brand-100">
                Mayúsculas, minúsculas, números y más de 8 caracteres
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-white">Completamente Seguro</h3>
              <p className="text-sm text-brand-100">
                Tu contraseña está protegida con encriptación
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <PasswordResetForm token={token || undefined} />
    </div>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/20 mb-4">
              <div className="w-6 h-6 border-3 border-brand-200 dark:border-brand-800 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Cargando...
            </p>
          </div>
        </div>
      }
    >
      <PasswordResetContent />
    </Suspense>
  );
}
