// src/components/features/verify-email/admin/VerifyEmailStatus.tsx
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
      <Card className="border-0 bg-muted/30 shadow-sm">
        <CardContent className="flex items-center justify-center py-14">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const isVerified = status.accountVerified;

  return (
    <Card
      className={`overflow-hidden border shadow-sm transition-colors ${
        isVerified
          ? 'border-emerald-200/60 bg-emerald-50/80 dark:border-emerald-800/50 dark:bg-emerald-950/40'
          : 'border-amber-200/60 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/30'
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`rounded-xl p-3 shadow-sm ${
                isVerified
                  ? 'bg-emerald-100 dark:bg-emerald-900/60'
                  : 'bg-amber-100 dark:bg-amber-900/50'
              }`}
            >
              {isVerified ? (
                <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Mail className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div className="space-y-1">
              <CardTitle
                className={
                  isVerified
                    ? 'text-emerald-900 dark:text-emerald-100 text-lg'
                    : 'text-amber-900 dark:text-amber-100 text-lg'
                }
              >
                {isVerified ? 'Email verificado' : 'Email pendiente de verificación'}
              </CardTitle>
              <CardDescription
                className={
                  isVerified
                    ? 'text-emerald-700/90 dark:text-emerald-300/90'
                    : 'text-amber-700/90 dark:text-amber-300/90'
                }
              >
                {status.email}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={isVerified ? 'default' : 'secondary'}
            className={
              isVerified
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'border-amber-300 dark:border-amber-700'
            }
          >
            {isVerified ? 'Verificado' : 'Pendiente'}
          </Badge>
        </div>
      </CardHeader>

      {!isVerified && (
        <CardContent className="space-y-4 pt-0">
          <p className="text-sm text-muted-foreground">{status.message}</p>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onRequestVerification}
              disabled={requestLoading}
              className="min-w-[180px] gap-2"
            >
              {requestLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {requestLoading ? 'Solicitando...' : 'Solicitar verificación'}
            </Button>
            <Button
              onClick={onResendVerification}
              variant="outline"
              disabled={resendLoading}
              className="gap-2"
            >
              {resendLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {resendLoading ? 'Reenviando...' : 'Reenviar'}
            </Button>
          </div>
        </CardContent>
      )}

      {isVerified && (
        <CardContent className="pt-0">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{status.message}</p>
        </CardContent>
      )}
    </Card>
  );
}
