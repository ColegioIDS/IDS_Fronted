// src/components/features/verify-email/public/states/VerifyEmailAlreadyVerified.tsx
/**
 * 📧 Estado: Ya Verificado
 * Se muestra cuando el email ya fue verificado anteriormente
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Badge } from 'lucide-react';

interface VerifyEmailAlreadyVerifiedProps {
  onNavigate: () => void;
}

export function VerifyEmailAlreadyVerified({
  onNavigate,
}: VerifyEmailAlreadyVerifiedProps) {
  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 backdrop-blur-sm border-blue-200/50 dark:border-blue-900/50">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-3 ring-2 ring-blue-200 dark:ring-blue-900">
            <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <CardTitle className="text-center text-blue-900 dark:text-blue-100 text-2xl">
          Email ya Verificado
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Este email ya fue verificado anteriormente.
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Tu cuenta está completamente activa.
          </p>
        </div>

        <div className="rounded-lg bg-blue-100/50 dark:bg-blue-900/30 p-4 text-center border border-blue-200/50 dark:border-blue-900/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge className="bg-blue-600 dark:bg-blue-700">Activo</Badge>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Tu email está verificado y tu cuenta tiene acceso total a todas las
            funcionalidades.
          </p>
        </div>

        <Button
          onClick={onNavigate}
          className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800 text-white font-medium shadow-lg"
        >
          Ir a Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
