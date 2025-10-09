// src/components/common/ProtectedContent.tsx
'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Lock, AlertTriangle, ShieldX, KeyRound } from 'lucide-react';

interface ProtectedContentProps {
  children: ReactNode;
  requiredPermission: {
    module: string;
    action: string;
  };
  fallback?: ReactNode;
}

export default function ProtectedContent({
  children,
  requiredPermission,
  fallback,
}: ProtectedContentProps) {
  const { user, hasPermission } = useAuth();

  const canAccess = hasPermission(requiredPermission.module, requiredPermission.action);

  if (!canAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[600px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Animación del candado con llave que se aleja */}
            <div className="relative w-32 h-32">
              {/* Resplandor de fondo */}
              <div className="absolute inset-0 bg-red-500/20 dark:bg-red-400/20 rounded-full blur-2xl animate-pulse"></div>
              
              {/* Círculo del candado */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative bg-red-100 dark:bg-red-900/30 rounded-full p-6 shadow-lg">
                  {/* Candado principal con animación de sacudida */}
                  <Lock 
                    className="w-16 h-16 text-red-600 dark:text-red-400 animate-shake" 
                    strokeWidth={2.5}
                  />
                  
                  {/* Llave que se aleja - animación personalizada */}
                  <KeyRound 
                    className="absolute -right-2 -top-2 w-8 h-8 text-red-500 dark:text-red-400 animate-key-escape"
                    strokeWidth={2}
                  />
                </div>
              </div>
              
              {/* Partículas flotantes */}
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full animate-float-1"></div>
              <div className="absolute bottom-4 left-2 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-2"></div>
              <div className="absolute top-6 left-0 w-1 h-1 bg-red-500 rounded-full animate-float-3"></div>
            </div>

            {/* Título con icono de escudo roto */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <ShieldX className="w-6 h-6 text-red-600 dark:text-red-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Acceso Denegado
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                No tienes permisos para ver esta sección
              </p>
            </div>

            {/* Detalles del permiso */}
            <div className="w-full bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-left space-y-2 flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Permiso requerido:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <code className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/40 px-3 py-1 rounded-md text-xs font-mono text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                      <span className="font-semibold">{requiredPermission.module}</span>
                      <span className="text-red-400">.</span>
                      <span className="font-semibold">{requiredPermission.action}</span>
                    </code>
                  </div>
                  <div className="pt-2 border-t border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-600 dark:text-red-500">
                      Tu rol actual:{' '}
                      <span className="font-semibold bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded">
                        {user?.role?.name || 'Sin rol asignado'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Volver atrás
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Ir al Dashboard
              </Button>
            </div>

            {/* Footer informativo */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 w-full">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                💡 Si crees que deberías tener acceso a esta sección, contacta al administrador del sistema
              </p>
            </div>
          </div>
        </div>

        {/* CSS para las animaciones personalizadas */}
        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: rotate(0deg); }
            10%, 30%, 50%, 70%, 90% { transform: rotate(-3deg); }
            20%, 40%, 60%, 80% { transform: rotate(3deg); }
          }

          @keyframes keyEscape {
            0% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 1;
            }
            50% {
              transform: translate(20px, -20px) rotate(45deg);
              opacity: 0.5;
            }
            100% {
              transform: translate(40px, -40px) rotate(90deg);
              opacity: 0;
            }
          }

          @keyframes float1 {
            0%, 100% { transform: translate(0, 0); opacity: 0; }
            50% { transform: translate(10px, -30px); opacity: 1; }
          }

          @keyframes float2 {
            0%, 100% { transform: translate(0, 0); opacity: 0; }
            50% { transform: translate(-15px, -25px); opacity: 1; }
          }

          @keyframes float3 {
            0%, 100% { transform: translate(0, 0); opacity: 0; }
            50% { transform: translate(12px, -20px); opacity: 1; }
          }

          .animate-shake {
            animation: shake 2s ease-in-out infinite;
          }

          .animate-key-escape {
            animation: keyEscape 2s ease-in-out infinite;
          }

          .animate-float-1 {
            animation: float1 3s ease-in-out infinite;
          }

          .animate-float-2 {
            animation: float2 3.5s ease-in-out infinite 0.5s;
          }

          .animate-float-3 {
            animation: float3 2.5s ease-in-out infinite 1s;
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}