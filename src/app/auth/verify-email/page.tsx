// src/app/auth/verify-email/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const token = searchParams.get("token");
  
  const [verificationState, setVerificationState] = useState<"loading" | "success" | "error">("loading");
  const [verificationMessage, setVerificationMessage] = useState<string>("");

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    // Si no hay token, mostrar error
    if (!token) {
      setVerificationState("error");
      setVerificationMessage("No se proporcionó un token de verificación");
      return;
    }

    // Verificar el correo
    const verifyEmail = async () => {
      try {
        setVerificationState("loading");
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setVerificationState("success");
          setVerificationMessage(data.message || "Tu correo ha sido verificado correctamente");
          
          // Redirigir al dashboard después de 3 segundos
          setTimeout(() => {
            router.push("/");
          }, 3000);
        } else {
          setVerificationState("error");
          setVerificationMessage(data.message || "No se pudo verificar tu correo");
        }
      } catch (error) {
        setVerificationState("error");
        setVerificationMessage(
          error instanceof Error ? error.message : "Error al verificar el correo"
        );
      }
    };

    if (isAuthenticated && token) {
      verifyEmail();
    }
  }, [token, isAuthenticated, authLoading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/20 mb-4">
            <div className="w-6 h-6 border-3 border-brand-200 dark:border-brand-800 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá al signin)
  if (!isAuthenticated) {
    return null;
  }

  // Mostrar loading mientras se verifica el correo
  if (verificationState === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/20 mb-4">
            <div className="w-6 h-6 border-3 border-brand-200 dark:border-brand-800 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Verificando tu correo...</p>
        </div>
      </div>
    );
  }

  // Mostrar éxito
  if (verificationState === "success") {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950 p-4">
        <div className="w-full max-w-md">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Correo Verificado
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {verificationMessage}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                Serás redirigido al panel de control en unos segundos...
              </p>
            </div>

            <div className="pt-4">
              <a
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-600 dark:bg-brand-500 text-white hover:bg-brand-700 dark:hover:bg-brand-600 transition-colors font-medium"
              >
                Ir al Panel
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error en Verificación
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {verificationMessage}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Por favor, intenta nuevamente o contacta al soporte.
            </p>
          </div>

          <div className="pt-4 space-y-2">
            <a
              href="/auth/password-reset/request"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-600 dark:bg-brand-500 text-white hover:bg-brand-700 dark:hover:bg-brand-600 transition-colors font-medium"
            >
              Solicitar Nuevo Enlace
            </a>
            <a
              href="/"
              className="block text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
            >
              Volver al Panel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
