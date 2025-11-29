// src/components/features/verify-email/VerifyEmailStatus.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { EmailVerificationStatus } from '@/types/verify-email.types';

interface VerifyEmailStatusProps {
  status: EmailVerificationStatus | null;
  isLoading: boolean;
  error: string | null;
  onRequestVerification: () => void;
  onResendVerification: () => void;
  requestLoading?: boolean;
  resendLoading?: boolean;
}

/**
 * Componente para mostrar estado de verificación del usuario autenticado
 */
export function VerifyEmailStatus({
  status,
  isLoading,
  error,
  onRequestVerification,
  onResendVerification,
  requestLoading = false,
  resendLoading = false,
}: VerifyEmailStatusProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const isVerified = status.accountVerified;

  return (
    <Card
      className={`border-2 ${
        isVerified
          ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
          : 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-2 ${
                isVerified ? 'bg-green-200 dark:bg-green-900' : 'bg-yellow-200 dark:bg-yellow-900'
              }`}
            >
              {isVerified ? (
                <Check className="h-5 w-5 text-green-700 dark:text-green-300" />
              ) : (
                <Mail className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
              )}
            </div>
            <div>
              <CardTitle className={isVerified ? 'text-green-900 dark:text-green-100' : 'text-yellow-900 dark:text-yellow-100'}>
                {isVerified ? 'Email Verificado' : 'Email Pendiente de Verificación'}
              </CardTitle>
              <CardDescription className={isVerified ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}>
                {status.email}
              </CardDescription>
            </div>
          </div>
          <Badge variant={isVerified ? 'default' : 'outline'}>
            {isVerified ? 'Verificado' : 'Pendiente'}
          </Badge>
        </div>
      </CardHeader>

      {!isVerified && (
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{status.message}</p>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-100 p-3 dark:bg-red-900">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-300 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={onRequestVerification}
              disabled={requestLoading}
              className="flex-1"
            >
              {requestLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {requestLoading ? 'Solicitando...' : 'Solicitar Verificación'}
            </Button>
            <Button
              onClick={onResendVerification}
              variant="outline"
              disabled={resendLoading}
            >
              {resendLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {resendLoading ? 'Reenviando...' : 'Reenviar'}
            </Button>
          </div>
        </CardContent>
      )}

      {isVerified && (
        <CardContent>
          <p className="text-sm text-green-700 dark:text-green-300">{status.message}</p>
        </CardContent>
      )}
    </Card>
  );
}
