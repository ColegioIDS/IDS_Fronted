import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  givenNames: z
    .string()
    .min(1, 'Los nombres son requeridos')
    .max(100, 'Los nombres no pueden exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  lastNames: z
    .string()
    .min(1, 'Los apellidos son requeridos')
    .max(100, 'Los apellidos no pueden exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('El correo electrónico debe ser válido')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  birthDate: z
    .string()
    .refine(
      (date) => {
        if (!date) return true;
        const d = new Date(date);
        return d instanceof Date && !isNaN(d.getTime());
      },
      'La fecha de nacimiento debe ser válida'
    )
    .optional()
    .or(z.literal('')),
  gender: z
    .string()
    .max(20, 'El género no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
});

export type UpdateUserProfileDto = z.infer<typeof updateUserProfileSchema>;
