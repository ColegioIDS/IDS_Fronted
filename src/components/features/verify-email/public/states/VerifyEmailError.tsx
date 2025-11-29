// src/components/features/verify-email/public/states/VerifyEmailError.tsx
/**
 * 📧 Estado: Error
 * Se muestra cuando hay un error en la verificación
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, Mail } from 'lucide-react';

interface VerifyEmailErrorProps {
  message: string;
  onNavigateDashboard: () => void;
  onNavigateProfile: () => void;
}

export function VerifyEmailError({
  message,
  onNavigateDashboard,
  onNavigateProfile,
}: VerifyEmailErrorProps) {
  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 backdrop-blur-sm border-red-200/50 dark:border-red-900/50">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-100 dark:bg-red-900/50 p-3 ring-2 ring-red-200 dark:ring-red-900">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <CardTitle className="text-center text-red-900 dark:text-red-100 text-2xl">
          Error en la Verificación
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
            {message}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            El enlace puede haber expirado o ser inválido.
          </p>
        </div>

        <div className="rounded-lg bg-red-100/50 dark:bg-red-900/30 p-4 text-center border border-red-200/50 dark:border-red-900/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              ¿Necesitas un nuevo enlace?
            </span>
          </div>
          <p className="text-xs text-red-700 dark:text-red-300">
            Puedes solicitar un nuevo enlace de verificación desde tu perfil.
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={onNavigateDashboard}
            className="w-full gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 dark:from-red-700 dark:to-orange-700 dark:hover:from-red-800 dark:hover:to-orange-800 text-white font-medium shadow-lg"
          >
            Ir a Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={onNavigateProfile}
            variant="outline"
            className="w-full border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-900 dark:text-red-100"
          >
            Ir a Perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
