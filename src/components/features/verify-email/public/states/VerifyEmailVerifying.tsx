// src/components/features/verify-email/public/states/VerifyEmailVerifying.tsx
/**
 * 📧 Estado: Verificando
 * Se muestra mientras se valida el token con el backend
 */

import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function VerifyEmailVerifying() {
  return (
    <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
      <CardContent className="pt-12 pb-12 flex flex-col items-center gap-4">
        <div className="relative">
          {/* Loader con efecto pulsante */}
          <Loader2 className="h-14 w-14 animate-spin text-blue-600 dark:text-blue-400" />
          <div className="absolute inset-0 h-14 w-14 animate-ping opacity-20 rounded-full bg-blue-600 dark:bg-blue-400"></div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Verificando tu email...
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Por favor espera un momento
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
