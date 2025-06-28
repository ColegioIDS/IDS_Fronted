// src/schemas/signin-schema.tsx
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string({ required_error: "El correo es obligatorio" })
    .min(1, "El correo es obligatorio")
    .email("Correo inválido"),

  password: z.string({ required_error: "La contraseña es obligatoria" })
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

