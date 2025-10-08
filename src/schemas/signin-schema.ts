// src/schemas/signin-schema.tsx
import { z } from "zod";

export const loginSchema = z.object({
  dpi: z.string().optional(),
  email: z.string().email("Correo inválido").optional(),
  password: z.string()
    .min(4, "La contraseña debe tener al menos 4 caracteres"),
}).refine(
  (data) => data.dpi || data.email,
  {
    message: "Debe proporcionar DPI o Email",
    path: ["email"], // Mostrar error en campo email
  }
);

export type LoginFormData = z.infer<typeof loginSchema>;
