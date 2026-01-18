// src/schemas/users.schema.ts
import { z } from 'zod';

// ✅ Create User Schema
export const createUserSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email es requerido')
      .email('Email inválido')
      .toLowerCase(),
    username: z
      .string()
      .min(3, 'Username debe tener al menos 3 caracteres')
      .max(20, 'Username no puede exceder 20 caracteres')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username solo puede contener letras, números, guiones y guiones bajos'),
    password: z
      .string()
      .min(8, 'Contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Contraseña debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Contraseña debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Contraseña debe contener al menos un número')
      .regex(/[!@#$%^&*]/, 'Contraseña debe contener al menos un carácter especial (!@#$%^&*)'),
    confirmPassword: z.string(),
    givenNames: z
      .string()
      .min(2, 'Nombres deben tener al menos 2 caracteres')
      .max(50, 'Nombres no pueden exceder 50 caracteres'),
    lastNames: z
      .string()
      .min(2, 'Apellidos deben tener al menos 2 caracteres')
      .max(50, 'Apellidos no pueden exceder 50 caracteres'),
    dpi: z
      .string()
      .regex(/^\d{13}$/, 'DPI debe tener exactamente 13 dígitos'),
    phone: z
      .string()
      .refine(
        (val) => val === '' || /^\+?\d{7,14}$/.test(val),
        'Teléfono debe tener entre 7 y 14 dígitos, con o sin +'
      )
      .optional()
      .or(z.literal('')),
    gender: z.enum(['M', 'F', 'O'], {
      errorMap: () => ({ message: 'Género debe ser M, F u O' }),
    }),
    roleId: z
      .string()
      .regex(/^\d+$/, 'Role ID debe ser un número válido'),
    isActive: z
      .union([z.boolean(), z.string()])
      .transform((val) => (val === true || val === 'true' ? '1' : '0'))
      .default('1')
      .optional(),
    canAccessPlatform: z
      .union([z.boolean(), z.string()])
      .transform((val) => (val === true || val === 'true' ? '1' : '0'))
      .default('0')
      .optional(),
    // ✅ Optional Parent Details
    parentDetails: z.object({
      dpiIssuedAt: z.string().optional().or(z.literal('')).default(''),
      email: z.string().email('Email inválido').optional().or(z.literal('')).default(''),
      workPhone: z.string().optional().or(z.literal('')).default(''),
      occupation: z.string().optional().or(z.literal('')).default(''),
      workplace: z.string().optional().or(z.literal('')).default(''),
      isSponsor: z.union([z.boolean(), z.string()]).transform((val) => val === true || val === 'true').optional().default(false),
      sponsorInfo: z.string().optional().or(z.literal('')).default(''),
    }).optional().default({}),
    // ✅ Optional Teacher Details
    teacherDetails: z.object({
      hiredDate: z.union([z.date(), z.string()]).optional().default(''),
      academicDegree: z.string().optional().or(z.literal('')).default(''),
      isHomeroomTeacher: z.union([z.boolean(), z.string()]).transform((val) => val === true || val === 'true').optional().default(false),
    }).optional().default({}),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// ✅ Update User Schema
export const updateUserSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .optional()
    .or(z.literal('')),
  dpi: z
    .string()
    .regex(/^\d{13}$/, 'DPI debe tener exactamente 13 dígitos')
    .optional()
    .or(z.literal('')),
  givenNames: z
    .string()
    .min(2, 'Nombres deben tener al menos 2 caracteres')
    .max(50, 'Nombres no pueden exceder 50 caracteres')
    .optional(),
  lastNames: z
    .string()
    .min(2, 'Apellidos deben tener al menos 2 caracteres')
    .max(50, 'Apellidos no pueden exceder 50 caracteres')
    .optional(),
  phone: z
    .string()
    .refine(
      (val) => val === '' || /^\+?\d{7,14}$/.test(val),
      'Teléfono debe tener entre 7 y 14 dígitos, con o sin +'
    )
    .optional()
    .or(z.literal('')),
  gender: z
    .enum(['M', 'F', 'O'], {
      errorMap: () => ({ message: 'Género debe ser M, F u O' }),
    })
    .optional(),
  roleId: z
    .string()
    .regex(/^\d+$/, 'Role ID debe ser un número válido')
    .optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .transform((val) => (val === true || val === 'true' ? '1' : '0'))
    .optional(),
  canAccessPlatform: z
    .union([z.boolean(), z.string()])
    .transform((val) => (val === true || val === 'true' ? '1' : '0'))
    .optional(),
  // ✅ Optional Parent Details
  parentDetails: z.object({
    dpiIssuedAt: z.string().optional().or(z.literal('')).default(''),
    email: z.string().email('Email inválido').optional().or(z.literal('')).default(''),
    workPhone: z.string().optional().or(z.literal('')).default(''),
    occupation: z.string().optional().or(z.literal('')).default(''),
    workplace: z.string().optional().or(z.literal('')).default(''),
    isSponsor: z.union([z.boolean(), z.string()]).transform((val) => val === true || val === 'true').optional().default(false),
    sponsorInfo: z.string().optional().or(z.literal('')).default(''),
  }).optional().default({}),
  // ✅ Optional Teacher Details
  teacherDetails: z.object({
    hiredDate: z.union([z.date(), z.string()]).optional().default(''),
    academicDegree: z.string().optional().or(z.literal('')).default(''),
    isHomeroomTeacher: z.union([z.boolean(), z.string()]).transform((val) => val === true || val === 'true').optional().default(false),
  }).optional().default({}),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// ✅ Change Password Schema
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(8, 'Nueva contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número')
      .regex(/[!@#$%^&*]/, 'Debe contener al menos un carácter especial (!@#$%^&*)'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ✅ Users Query Schema
export const usersQuerySchema = z.object({
  page: z.number().int().positive().default(1).catch(1),
  limit: z.number().int().positive().max(100).default(10).catch(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  canAccessPlatform: z.boolean().optional(),
  roleId: z.number().int().positive().optional(),
  sortBy: z.enum(['givenNames', 'email', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type UsersQueryFormData = z.infer<typeof usersQuerySchema>;

// ✅ Picture Upload Schema
export const uploadPictureSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'La imagen no debe exceder 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      'Solo se permiten imágenes (JPG, PNG, GIF, WebP)'
    ),
  kind: z.enum(['profile', 'document', 'evidence'], {
    errorMap: () => ({ message: 'Tipo de foto inválido' }),
  }),
  description: z.string().max(255, 'Descripción no puede exceder 255 caracteres').optional(),
});

export type UploadPictureFormData = z.infer<typeof uploadPictureSchema>;
