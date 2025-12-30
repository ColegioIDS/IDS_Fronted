'use client';

import GridShape from "@/components/common/GridShape";
import Link from "next/link";
import React from "react";
import { AlertCircle, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
      <GridShape />
      
      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <div className="text-center space-y-8">
          {/* Icono grande de error */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full blur-xl opacity-50" />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                <div className="text-9xl sm:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-red-600 dark:from-red-500 dark:to-red-700">
                  404
                </div>
              </div>
            </div>
          </div>

          {/* Título principal */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
              Página no encontrada
            </h1>
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-medium">
                Lo sentimos, esta página no existe
              </p>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
              La página que buscas puede haber sido eliminada, renombrada o es temporalmente inaccesible.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Código de error: <span className="font-mono font-bold text-slate-900 dark:text-slate-100">404</span>
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/" className="w-full sm:w-auto">
              <Button 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 h-auto"
              >
                <Home className="w-4 h-4" />
                Ir al Inicio
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button 
                variant="outline"
                className="w-full sm:w-auto border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 h-auto"
              >
                Ir al Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Info adicional */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ¿Necesitas ayuda? {' '}
              <a href="mailto:soporte@ids.edu" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Contacta con soporte
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute text-sm text-center text-slate-500 dark:text-slate-400 -translate-x-1/2 bottom-6 left-1/2">
        &copy; {new Date().getFullYear()} IDS - Sistema de Gestión Educativa
      </p>
    </div>
  );
}
