// src/hooks/data/useVerifyEmailPublic.ts
/**
 * Hook simplificado para la página pública de verificación de email
 * 
 * Solo necesita verificar con token, sin cargas iniciales
 * Esto evita requests innecesarios en la página /verify-email?token=...
 */

import { useCallback } from 'react';
import { verifyEmailService } from '@/services/verify-email.service';
import { VerifyEmailResponse } from '@/types/verify-email.types';

export function useVerifyEmailPublic() {
  /**
   * Verificar email con token
   * Solo este método es necesario en la página pública
   */
  const verifyWithToken = useCallback(async (token: string): Promise<VerifyEmailResponse> => {
    return await verifyEmailService.verifyEmailWithToken(token);
  }, []);

  return {
    verifyWithToken,
  };
}
