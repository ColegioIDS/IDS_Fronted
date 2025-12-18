// src/hooks/useLoginForm.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/signin-schema";
import { signin } from "@/services/authService";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { verifyRecaptchaToken, isValidRecaptchaScore } from "@/services/recaptcha.service";

type LoginFormData = z.infer<typeof loginSchema>;

export const useLoginForm = () => {
  const [errorMessage, setErrorMessage] = useState<string | string[]>("");
  const [isVerifyingRecaptcha, setIsVerifyingRecaptcha] = useState(false);
  const { login } = useAuth();
  const { executeRecaptcha } = useRecaptcha();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (dataForm: LoginFormData) => {
    try {
      setErrorMessage(""); // Limpiar errores previos
      
      // 1. PRIMERO validar credenciales en el backend (sin reCAPTCHA)
      try {
        console.log('Validating credentials...');
        const user = await signin(dataForm);
        
        // Las credenciales son válidas, ahora verificar reCAPTCHA
        console.log('Credentials valid, proceeding with reCAPTCHA verification...');
        setIsVerifyingRecaptcha(true);

        // 2. Ejecutar reCAPTCHA
        let recaptchaToken: string | null = null;
        try {
          recaptchaToken = await executeRecaptcha('login');
          
          if (!recaptchaToken || recaptchaToken.trim() === '') {
            console.error('reCAPTCHA returned empty token');
            setIsVerifyingRecaptcha(false);
            setErrorMessage('Error al verificar seguridad. Por favor, intenta de nuevo.');
            return;
          }
          console.log('reCAPTCHA token obtained successfully');
        } catch (recaptchaError: any) {
          console.error('reCAPTCHA execution error:', recaptchaError);
          setIsVerifyingRecaptcha(false);
          setErrorMessage('Error al verificar seguridad. Por favor, intenta de nuevo.');
          return;
        }

        // 3. Verificar el token en el servidor
        let recaptchaResult: any;
        try {
          recaptchaResult = await verifyRecaptchaToken(recaptchaToken);
          console.log('reCAPTCHA response:', recaptchaResult);
        } catch (verifyError: any) {
          console.error('reCAPTCHA verification error:', verifyError);
          setIsVerifyingRecaptcha(false);
          setErrorMessage('No se pudo verificar reCAPTCHA. Por favor, intenta de nuevo.');
          return;
        }

        // 4. Validar resultado y score
        if (!recaptchaResult.success) {
          console.error('reCAPTCHA verification failed:', {
            success: recaptchaResult.success,
            error_codes: recaptchaResult.error_codes,
          });
          setIsVerifyingRecaptcha(false);
          setErrorMessage('Verificación de seguridad fallida. Por favor, intenta de nuevo.');
          return;
        }

        const isValidScore = isValidRecaptchaScore(recaptchaResult.score);
        console.log('reCAPTCHA score validation:', {
          score: recaptchaResult.score,
          isValid: isValidScore,
        });

        if (!isValidScore) {
          console.warn('reCAPTCHA score too low:', {
            score: recaptchaResult.score,
            threshold: 0.5,
          });
          setIsVerifyingRecaptcha(false);
          setErrorMessage('Parece que hay actividad sospechosa. Por favor, intenta de nuevo más tarde.');
          return;
        }

        console.log('reCAPTCHA verification passed:', {
          score: recaptchaResult.score,
          action: recaptchaResult.action,
        });

        setIsVerifyingRecaptcha(false);

        // 5. Si reCAPTCHA pasó, hacer login
        login(user);
      } catch (signInError: any) {
        // Error de credenciales - mostrar error sin pasar por reCAPTCHA
        console.error('Sign in error:', signInError);
        setIsVerifyingRecaptcha(false);
        
        if (signInError.details && Array.isArray(signInError.details)) {
          setErrorMessage(signInError.details);
        } else if (signInError.message) {
          setErrorMessage(signInError.message);
        } else {
          setErrorMessage("Credenciales inválidas");
        }
      }
    } catch (error: any) {
      setIsVerifyingRecaptcha(false);
      
      // Fallback para errores no capturados
      console.error('Unexpected error in login form:', error);
      setErrorMessage("Error al iniciar sesión. Por favor, intenta de nuevo.");
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    errorMessage,
    isSubmitting: isSubmitting || isVerifyingRecaptcha,
  };
};