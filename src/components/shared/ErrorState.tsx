'use client';

import { AlertCircle, Home, ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ErrorStateProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  icon?: React.ReactNode;
}

export function ErrorState({
  title = 'Error al cargar',
  description = 'Ocurrió un error al intentar cargar los datos solicitados. Por favor, intenta de nuevo.',
  showBackButton = true,
  showHomeButton = false,
  icon,
}: ErrorStateProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      <div className="w-full max-w-md">
        <div className="p-8 md:p-12">
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-20 blur-xl animate-pulse" />
                <div className="relative p-5 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 rounded-full border border-red-200 dark:border-red-800">
                  {icon ? (
                    <div className="w-8 h-8 text-red-600 dark:text-red-400">
                      {icon}
                    </div>
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent mb-3">
              {title}
            </h2>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mb-8 leading-relaxed max-w-sm mx-auto">
              {description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {showBackButton && (
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="gap-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Button>
              )}

              {showHomeButton && (
                <Link href="/">
                  <Button className="gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 w-full">
                    <Home className="w-4 h-4" />
                    Ir al inicio
                  </Button>
                </Link>
              )}
            </div>

            {/* Help text */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center justify-center gap-2">
                <Zap className="w-3 h-3 text-orange-500" />
                Si el problema persiste, contacta con soporte
              </p>
            </div>

            {/* Footer hint */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-6">
              Código de error: {Math.floor(Math.random() * 10000)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
