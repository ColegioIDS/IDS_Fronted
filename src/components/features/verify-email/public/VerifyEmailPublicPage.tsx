// src/components/features/verify-email/public/VerifyEmailPublicPage.tsx
/**
 * 📧 Página Pública de Verificación de Email
 * 
 * Ruta: /verify-email?token=...
 * Acceso: Público (sin autenticación)
 * 
 * Componentes:
 * - VerifyEmailContainer (layout principal)
 * - VerifyEmailVerifying (estado: verificando)
 * - VerifyEmailSuccess (estado: éxito)
 * - VerifyEmailError (estado: error)
 * - VerifyEmailAlreadyVerified (estado: ya verificado)
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyEmailPublic } from '@/hooks/data/useVerifyEmailPublic';
import { toast } from 'sonner';

import { VerifyEmailContainer } from './VerifyEmailContainer';
import { VerifyEmailVerifying } from './states/VerifyEmailVerifying';
import { VerifyEmailSuccess } from './states/VerifyEmailSuccess';
import { VerifyEmailError } from './states/VerifyEmailError';
import { VerifyEmailAlreadyVerified } from './states/VerifyEmailAlreadyVerified';

type VerificationState = 'verifying' | 'success' | 'error' | 'already-verified';

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

  // Renderizar el estado correcto
  const renderState = () => {
    switch (state) {
      case 'verifying':
        return <VerifyEmailVerifying />;
      case 'success':
        return (
          <VerifyEmailSuccess
            email={email}
            onNavigate={() => router.push('/dashboard')}
          />
        );
      case 'already-verified':
        return (
          <VerifyEmailAlreadyVerified
            onNavigate={() => router.push('/dashboard')}
          />
        );
      case 'error':
        return (
          <VerifyEmailError
            message={errorMessage}
            onNavigateProfile={() => router.push('/profile')}
            onNavigateDashboard={() => router.push('/dashboard')}
          />
        );
      default:
        return <VerifyEmailVerifying />;
    }
  };

  return (
    <VerifyEmailContainer>
      {renderState()}
    </VerifyEmailContainer>
  );
}
