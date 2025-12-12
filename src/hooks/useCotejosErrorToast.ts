/**
 * Hook para mostrar notificaciones de error del módulo Cotejos
 */

import { toast } from 'sonner';
import { getErrorMessage } from '@/constants/cotejos';

/**
 * Muestra un toast de error con el mensaje apropiado
 */
export const useCotejosErrorToast = () => {
  const showError = (errorCode?: string, customMessage?: string) => {
    const message = customMessage || getErrorMessage(errorCode);
    toast.error(message, {
      duration: 5000,
      action: {
        label: 'Descartar',
        onClick: () => {},
      },
    });
  };

  const showRecoverableError = (errorCode?: string, customMessage?: string, onRetry?: () => void) => {
    const message = customMessage || getErrorMessage(errorCode);
    toast.error(message, {
      duration: 6000,
      action: onRetry
        ? {
            label: 'Reintentar',
            onClick: onRetry,
          }
        : undefined,
    });
  };

  return { showError, showRecoverableError };
};
