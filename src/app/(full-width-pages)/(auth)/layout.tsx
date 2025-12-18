import { Metadata } from "next";
import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Autenticación | Sistema Administrativo",
  description: "Inicia sesión con tus credenciales institucionales",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="w-full h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-950">
        {/* Panel izquierdo (solo desktop) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 items-center justify-center relative overflow-hidden">
          {/* Elementos decorativos animados */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Gradiente de fondo mejorado */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 to-transparent"></div>
            
            {/* Orbes animadas */}
            <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse animation-delay-2000"></div>
            
            {/* Patrón de líneas sutiles */}
            <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Lineas decorativas */}
            <div className="absolute top-20 left-10 w-32 h-32 border-2 border-white/10 rounded-full"></div>
            <div className="absolute bottom-32 right-20 w-48 h-48 border border-white/5 rounded-full"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-64 bg-gradient-to-b from-white/20 to-transparent rotate-45"></div>
          </div>

          <div className="relative z-10 text-center">
            <GridShape />
            <div className="flex flex-col items-center max-w-xs space-y-6">
              <Link href="/" className="block hover:opacity-80 transition-opacity duration-300 transform hover:scale-105">
                <Image
                  width={400}
                  height={80}
                  src="./images/logo/auth-logo-IDS.svg"
                  alt="IDS Logo"
                  priority
                  className="drop-shadow-lg"
                />
              </Link>
              <div className="space-y-3">
                <h2 className="text-white text-3xl font-bold tracking-tight drop-shadow-md">
                  Innovating Dreamers School
                </h2>
                <p className="text-brand-100 text-base font-light leading-relaxed drop-shadow-sm">
                  Plataforma administrativa integral para la gestión educativa
                </p>
              </div>
              <div className="flex items-center gap-3 w-full opacity-40">
                <div className="h-px flex-1 bg-gradient-to-r from-white/0 to-white/50"></div>
                <span className="text-white/60 text-xs">●</span>
                <div className="h-px flex-1 bg-gradient-to-l from-white/0 to-white/50"></div>
              </div>
              <p className="text-brand-100/70 text-xs font-light tracking-wide">
                Acceso seguro para personal autorizado
              </p>
            </div>
          </div>
        </div>

        {/* Panel derecho (formulario) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-gray-950 relative overflow-hidden">
          {/* Detalles decorativos MEJORADOS - Patrones como la sección izquierda */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Gradiente de fondo mejorado */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-50/50 dark:from-brand-950/20 to-transparent"></div>
            
            {/* Patrón de líneas sutiles */}
            <svg className="absolute inset-0 w-full h-full opacity-5 dark:opacity-3" preserveAspectRatio="none">
              <defs>
                <pattern id="grid-right" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-right)" className="text-brand-400" />
            </svg>

            {/* Líneas decorativas */}
            <div className="absolute top-20 right-10 w-32 h-32 border-2 border-brand-200/20 dark:border-brand-800/20 rounded-full"></div>
            <div className="absolute bottom-32 left-20 w-48 h-48 border border-brand-100/10 dark:border-brand-900/10 rounded-full"></div>
            <div className="absolute top-1/3 left-1/3 w-1 h-64 bg-gradient-to-b from-brand-300/20 dark:from-brand-600/10 to-transparent rotate-45"></div>
            
            {/* Líneas horizontales decorativas */}
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-300/20 dark:via-brand-600/10 to-transparent"></div>
            <div className="absolute bottom-1/3 right-0 w-2/3 h-px bg-gradient-to-l from-transparent via-brand-300/20 dark:via-brand-600/10 to-transparent"></div>
          </div>

          <div className="w-full max-w-sm relative z-10">
            {children}
          </div>
        </div>

        {/* Toggle de tema */}
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </ThemeProvider>
  );
}