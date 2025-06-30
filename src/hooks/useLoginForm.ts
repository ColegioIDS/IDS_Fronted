// src/hooks/useLoginForm.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/signin-schema";
import { signin } from "@/services/authService";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
type LoginFormData = z.infer<typeof loginSchema>;
export const useLoginForm = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (dataForm: LoginFormData) => {
    try {
      const user = await signin(dataForm);

      login(user); // Actualiza el contexto
      router.push("/dashboard"); 
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || "Ocurrió un error");
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    errorMessage,
  };
};