/**
 * Componente para mostrar errores del módulo Cotejos
 */

'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getErrorMessage, isRecoverableError } from '@/constants/cotejos';

interface CotejosErrorAlertProps {
  errorCode?: string;
  message?: string;
  detail?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetail?: boolean;
}

export const CotejosErrorAlert = ({
  errorCode,
  message,
  detail,
  onRetry,
  onDismiss,
  showDetail = false,
}: CotejosErrorAlertProps) => {
  if (!errorCode && !message) return null;

  const displayMessage = message || getErrorMessage(errorCode);
  const isRecoverable = isRecoverableError(errorCode);

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error en Cotejos</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{displayMessage}</p>
        {showDetail && detail && (
          <p className="text-xs font-mono bg-destructive/10 p-2 rounded mt-1 text-foreground">
            {detail}
          </p>
        )}
        <div className="flex gap-2 mt-3">
          {isRecoverable && onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="bg-background text-foreground border-destructive/50 hover:bg-destructive/10"
            >
              Intentar de nuevo
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDismiss}
              className="bg-background text-foreground border-destructive/50 hover:bg-destructive/10"
            >
              Descartar
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
