"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

// Esquema de validación
const passwordRecoverySchema = z.object({
  email: z.string().email("Por favor ingresa un email válido"),
});

type PasswordRecoveryFormData = z.infer<typeof passwordRecoverySchema>;

interface PasswordRecoveryFormProps {
  onSuccess?: () => void;
  isLoading?: boolean;
}

export default function PasswordRecoveryForm({
  onSuccess,
  isLoading: externalIsLoading = false,
}: PasswordRecoveryFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const { requestReset, isLoading, successMessage } = usePasswordReset();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordRecoveryFormData>({
    resolver: zodResolver(passwordRecoverySchema),
  });

  const email = watch("email");
  const loading = externalIsLoading || isLoading;

  const onSubmit = async (data: PasswordRecoveryFormData) => {
    try {
      setSubmitError(null);
      setSubmittedEmail(data.email);
      await requestReset(data.email);
      setIsSubmitted(true);
      onSuccess?.();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Error al enviar el enlace de recuperación"
      );
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          {/* Estado de Éxito */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Revisa tu Email
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Hemos enviado un enlace de recuperación a:
            </p>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-8">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {submittedEmail}
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {successMessage || "Sigue las instrucciones en el email para restablecer tu contraseña."}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Si no recibes el email en los próximos 5 minutos, revisa tu carpeta de
                spam.
              </p>
            </div>

            <Link href="/auth/signin">
              <button className="w-full px-5 py-3.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 rounded-lg transition-colors">
                Volver al Inicio de Sesión
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Link>
          </div>

          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Recuperar Contraseña
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ingresa tu email para recibir un enlace de recuperación
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Error Global */}
            {submitError && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
              </div>
            )}

            {/* Campo Email */}
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="tu@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 dark:text-blue-300">
                Te enviaremos un enlace seguro a tu correo electrónico para que
                puedas restablecer tu contraseña.
              </p>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            ¿Recordaste tu contraseña?{" "}
            <Link
              href="/auth/signin"
              className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
