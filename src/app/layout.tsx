// src/app/layout.tsx

import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: "Sistema de Gestión Académica",
  description: "Plataforma de gestión de ciclos, bimestres y calificaciones",
  other: {
    google: "notranslate", // ← Previene que Google Translate traduzca
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="es" 
      suppressHydrationWarning
    >
      <body 
        className={`${outfit.className} dark:bg-gray-900 overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}