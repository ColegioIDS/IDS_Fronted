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
  profilePicture: z
    .instanceof(File)
    .optional(),
  address: z.object({
    street: z.string().optional().or(z.literal('')),
    streetNumber: z.string().optional().or(z.literal('')),
    apartmentNumber: z.string().optional().or(z.literal('')),
    zone: z.string().optional().or(z.literal('')),
  }).optional(),
  teacherDetails: z.object({
    hiredDate: z.string().optional().or(z.literal('')),
    isHomeroomTeacher: z.boolean().optional(),
    academicDegree: z.string().optional().or(z.literal('')),
  }).optional(),
  parentDetails: z.object({
    occupation: z.string().optional().or(z.literal('')),
    workplace: z.string().optional().or(z.literal('')),
    workPhone: z.string().optional().or(z.literal('')),
    isSponsor: z.boolean().optional(),
    sponsorInfo: z.string().optional().or(z.literal('')),
  }).optional(),
});

export type UpdateUserProfileDto = z.infer<typeof updateUserProfileSchema>;
