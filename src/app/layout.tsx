// src/app/layout.tsx

import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";

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
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <html 
      lang="es" 
      suppressHydrationWarning
    >
      <head>
        {/* reCAPTCHA v3 Script */}
        {recaptchaSiteKey && (
          <script
            async
            defer
            src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
          />
        )}
      </head>
      <body 
        className={`${outfit.className} dark:bg-gray-900 overflow-x-hidden`}
        suppressHydrationWarning
      >
          <QueryProvider>
            <ThemeProvider>
              <AuthProvider>
                <SidebarProvider>
                  {children}
                </SidebarProvider>
              </AuthProvider>
            </ThemeProvider>
          </QueryProvider>
      </body>
    </html>
  );
}