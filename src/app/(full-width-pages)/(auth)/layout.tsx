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
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          {/* Panel izquierdo (solo desktop) */}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center flex z-1">
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/" className="block mb-4">
                  <Image
                    width={492}
                    height={96}
                    src="./images/logo/auth-logo-IDS.svg"
                    alt="Logo"
                  />
                </Link>
                <h2 className="text-center text-gray-400 dark:text-white/60 text-2xl mb-2 font-semibold">
                  Colegio Innovacion de Soñadores
                </h2>
                <h3 className="text-center text-gray-400 dark:text-white/60 mb-6">
                  Bienvenido a la plataforma administrativa
                </h3>
                
              </div>
            </div>
          </div>

          {/* Panel derecho (formulario) - Contenedor modificado */}
          <div className="lg:w-1/2 w-full flex items-center justify-center p-6">
            {children}
          </div>


          {/* Toggle de tema */}
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}