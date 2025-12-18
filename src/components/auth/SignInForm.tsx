// path: src/components/auth/SignInForm.tsx
"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useLoginForm } from "@/hooks/useLoginForm";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const {
    register,
    handleSubmit,
    errors,
    errorMessage,
    isSubmitting,
  } = useLoginForm();

  return (
    <div className="w-full">
      <div className="flex flex-col gap-8">
        {/* Encabezado con degradado */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Bienvenido
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
            Inicia sesión para acceder a tu cuenta
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Email */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300 font-semibold">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input 
              placeholder="nombre@ejemplo.com" 
              type="email" 
              {...register("email")}
              className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-brand-500 transition-all"
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300 font-semibold">
              Contraseña <span className="text-red-500">*</span>
            </Label>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                {...register("password")}
                className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-brand-500 pr-12 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeIcon className="w-5 h-5 fill-current" />
                ) : (
                  <EyeCloseIcon className="w-5 h-5 fill-current" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Opciones adicionales */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={isChecked} 
                onChange={setIsChecked}
              />
              <span className="text-sm text-gray-700 dark:text-gray-400 font-medium">
                Mantener sesión activa
              </span>
            </div>
            <Link
              href="/auth/password-reset/request"
              className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-semibold transition-colors hover:underline"
            >
              Recuperar contraseña
            </Link>
          </div>

          {/* Mensajes de error */}
          {errorMessage && (
            <div
              className="flex flex-col gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 dark:text-red-300 text-sm mb-1">
                    Error de autenticación
                  </h3>
                  {Array.isArray(errorMessage) ? (
                    <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-400 text-sm">
                      {errorMessage.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-700 dark:text-red-400 text-sm">{errorMessage}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botón de envío */}
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 hover:from-brand-700 hover:via-brand-600 hover:to-brand-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:shadow-lg hover:shadow-brand-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none mt-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isSubmitting ? (
              <span className="flex items-center gap-2 justify-center relative z-10">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verificando seguridad...
              </span>
            ) : (
              <span className="relative z-10">Iniciar sesión</span>
            )}
          </Button>

          {/* reCAPTCHA Badge Info */}
          <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <svg
              className="w-3 h-3 text-blue-500 dark:text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            <span>
              Protegido por{" "}
              <a
                href="https://www.google.com/recaptcha/about/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-gray-600 dark:text-gray-300"
              >
                reCAPTCHA
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
