// src/hooks/useLoginForm.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/signin-schema";
import { signin } from "@/services/authService";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useRecaptcha } from "@/hooks/useRecaptcha";

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

      // 1. Ejecutar reCAPTCHA para obtener el token
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

      // 2. Enviar credenciales + token reCAPTCHA al backend
      try {
        const credentialsWithRecaptcha = {
          ...dataForm,
          recaptchaToken, // El token se envía aquí
        };
        
        console.log('Sending credentials with reCAPTCHA token to backend...');
        const user = await signin(credentialsWithRecaptcha);
        
        console.log('Sign in successful');
        setIsVerifyingRecaptcha(false);

        // 3. Si el backend validó exitosamente, hacer login
        login(user);
      } catch (signInError: any) {
        // Error del servidor - puede ser credenciales inválidas o reCAPTCHA falló
        console.error('Sign in error:', signInError);
        setIsVerifyingRecaptcha(false);
        
        if (signInError.details && Array.isArray(signInError.details)) {
          setErrorMessage(signInError.details);
        } else if (signInError.message) {
          setErrorMessage(signInError.message);
        } else {
          setErrorMessage("Error al iniciar sesión. Por favor, intenta de nuevo.");
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