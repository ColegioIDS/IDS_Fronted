// src/components/features/verify-email/public/states/VerifyEmailSuccess.tsx
/**
 * 📧 Estado: Éxito
 * Se muestra cuando el email fue verificado correctamente
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface VerifyEmailSuccessProps {
  email: string;
  onNavigate: () => void;
}

export function VerifyEmailSuccess({
  email,
  onNavigate,
}: VerifyEmailSuccessProps) {
  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 backdrop-blur-sm border-green-200/50 dark:border-green-900/50">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-3 ring-2 ring-green-200 dark:ring-green-900">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <CardTitle className="text-center text-green-900 dark:text-green-100 text-2xl">
          ¡Email Verificado!
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-green-800 dark:text-green-200">
            Tu email ha sido verificado exitosamente
          </p>
          <p className="text-sm font-mono text-green-700 dark:text-green-300 bg-white/50 dark:bg-black/20 px-3 py-2 rounded-lg">
            {email}
          </p>
        </div>

        <div className="rounded-lg bg-green-100/50 dark:bg-green-900/30 p-4 text-center border border-green-200/50 dark:border-green-900/50">
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
            ✅ Tu cuenta está completamente activada. Ahora puedes acceder a todas
            las funcionalidades del sistema.
          </p>
        </div>

        <Button
          onClick={onNavigate}
          className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-700 dark:to-emerald-700 dark:hover:from-green-800 dark:hover:to-emerald-800 text-white font-medium shadow-lg"
        >
          Ir a Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
