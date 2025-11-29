// src/components/features/verify-email/public/VerifyEmailContainer.tsx
/**
 * 📧 Contenedor Principal - Verificación de Email Pública
 * 
 * Diseño:
 * - Degradados líquidos en los costados
 * - Centrado responsivo
 * - Soporte para dark mode
 * - Animaciones sutiles
 */

'use client';

export function VerifyEmailContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-gray-950">
      {/* Gradiente de fondo - Lado Izquierdo */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-300 dark:from-blue-900/40 dark:to-cyan-900/30 rounded-full filter blur-3xl opacity-60 dark:opacity-30 animate-pulse" />

      {/* Gradiente de fondo - Lado Derecho */}
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tl from-indigo-400 to-purple-300 dark:from-indigo-900/40 dark:to-purple-900/30 rounded-full filter blur-3xl opacity-60 dark:opacity-30 animate-pulse" />

      {/* Gradiente de fondo - Centro (sutil) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-300/20 to-orange-300/20 dark:from-pink-900/20 dark:to-orange-900/20 rounded-full filter blur-3xl opacity-40 dark:opacity-20" />

      {/* Contenido */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
