// src/hooks/useLoginForm.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/signin-schema";
import { signin } from "@/services/authService";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";

type LoginFormData = z.infer<typeof loginSchema>;

export const useLoginForm = () => {
  const [errorMessage, setErrorMessage] = useState<string | string[]>("");
  const { login } = useAuth();

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
      
      const user = await signin(dataForm);
      // ✅ El método login() en AuthContext ya maneja la redirección a /dashboard
      login(user);
      console.log("Usuario autenticado:", user);
    } catch (error: any) {
      console.error('Login error:', error);
      
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
    isSubmitting,
  };
};