// src/components/features/verify-email/VerifyEmailPage.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyEmailPublic } from '@/hooks/data/useVerifyEmailPublic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

type VerificationState = 'verifying' | 'success' | 'error' | 'already-verified';

/**
 * Componente para la página de verificación pública
 * Se muestra cuando el usuario hace clic en el link del email
 * Ruta: /verify-email?token=...
 */
export function VerifyEmailPublicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyWithToken } = useVerifyEmailPublic();

  const [state, setState] = useState<VerificationState>('verifying');
  const [email, setEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    // Evitar ejecución duplicada en React strict mode (desarrollo)
    if (verificationAttempted.current) return;
    verificationAttempted.current = true;

    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setState('error');
          setErrorMessage('Token de verificación no proporcionado');
          return;
        }

        const result = await verifyWithToken(token);
        setEmail(result.email || '');
        setState('success');
        toast.success('¡Email verificado exitosamente!');
      } catch (error: any) {
        // Verificar si es error de email ya verificado
        if (error.message?.includes('ya ha sido verificado')) {
          setState('already-verified');
        } else {
          setState('error');
          setErrorMessage(
            error.message || 'Error al verificar el email. Intenta nuevamente.'
          );
        }
        toast.error(error.message || 'Error en la verificación');
      }
    };

    verifyEmail();
  }, [searchParams, verifyWithToken]);

  if (state === 'verifying') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-12 pb-12 flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-12 w-12 animate-ping opacity-20 rounded-full bg-blue-600"></div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Verificando tu email...
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Por favor espera un momento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md shadow-lg border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-center text-green-900 dark:text-green-100">
              ¡Email Verificado!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-green-800 dark:text-green-200">
                Tu email ha sido verificado exitosamente
              </p>
              <p className="text-sm font-mono text-green-700 dark:text-green-300">{email}</p>
            </div>

            <div className="rounded-lg bg-green-100 dark:bg-green-900 p-4 text-center">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Tu cuenta está completamente activada. Ahora puedes acceder a todas las
                funcionalidades del sistema.
              </p>
            </div>

            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            >
              Ir a Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'already-verified') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md shadow-lg border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-center text-blue-900 dark:text-blue-100">
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

            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full gap-2"
            >
              Ir a Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // state === 'error'
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-lg border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900 p-3">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-center text-red-900 dark:text-red-100">
            Error en la Verificación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
            <p className="text-sm text-red-700 dark:text-red-300">
              El enlace puede haber expirado o ser inválido.
            </p>
          </div>

          <div className="rounded-lg bg-red-100 dark:bg-red-900 p-4 text-center">
            <p className="text-sm text-red-800 dark:text-red-200">
              💡 Puedes solicitar un nuevo enlace de verificación desde tu perfil.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full gap-2"
            >
              Ir a Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => router.push('/profile')}
              variant="outline"
              className="w-full"
            >
              Ir a Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
