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
      setIsVerifyingRecaptcha(true);

      // 1. Ejecutar reCAPTCHA
      const recaptchaToken = await executeRecaptcha('login');
      
      if (!recaptchaToken) {
        throw new Error('No se pudo verificar reCAPTCHA');
      }

      // 2. Verificar el token en el servidor
      const recaptchaResult = await verifyRecaptchaToken(recaptchaToken);

      console.log('reCAPTCHA response:', recaptchaResult);

      // 3. Validar resultado y score
      if (!recaptchaResult.success) {
        console.error('reCAPTCHA verification failed:', {
          success: recaptchaResult.success,
          error_codes: recaptchaResult.error_codes,
        });
        throw new Error('Verificación de seguridad fallida. Por favor, intenta de nuevo.');
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
        throw new Error('Verificación de seguridad fallida. Por favor, intenta de nuevo.');
      }

      console.log('reCAPTCHA verification passed:', {
        score: recaptchaResult.score,
        action: recaptchaResult.action,
      });

      setIsVerifyingRecaptcha(false);

      // 4. Si reCAPTCHA pasó, proceder con login
      const user = await signin(dataForm);
      // ✅ El método login() en AuthContext ya maneja la redirección a /dashboard
      login(user);
    } catch (error: any) {
      setIsVerifyingRecaptcha(false);
      
      // ✨ Manejar errores estructurados
      if (error.details && Array.isArray(error.details)) {
        setErrorMessage(error.details);
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Error al iniciar sesión");
      }
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