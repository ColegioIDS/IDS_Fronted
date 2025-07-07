// src/schemas/role.ts
import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  description: z.string()
    .max(200, "La descripción no puede exceder 200 caracteres")
    .optional(),
  isActive: z.boolean()
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;