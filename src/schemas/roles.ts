// src/schemas/roles.ts

import { z } from 'zod';

export const rolePermissionWithScopeSchema = z.object({
  permissionId: z.number().int().positive("ID de permiso inválido"),
  scope: z.enum(['all', 'own', 'grade'], {
    errorMap: () => ({ message: "Scope debe ser 'all', 'own' o 'grade'" })
  }), 
});

export const roleSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .nullable()
    .optional(),
  permissions: z.array(rolePermissionWithScopeSchema).optional(),
  isActive: z.boolean(),
  createdById: z.number().int().positive().nullable().optional(),
  modifiedById: z.number().int().positive().nullable().optional(),
});

export const createRoleSchema = roleSchema.omit({
  id: true,
});

export const updateRoleSchema = roleSchema
  .omit({ id: true })
  .partial();

export const roleWithRelationsSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  isSystem: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdById: z.number().int().positive().nullable().optional(),
  modifiedById: z.number().int().positive().nullable().optional(),
  permissions: z.array(
    z.object({
      id: z.number().int().positive(),
      module: z.string(),
      action: z.string(),
      description: z.string().nullable().optional(),
      isActive: z.boolean(),
      isSystem: z.boolean(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    })
  ),
  userCount: z.number().int().nonnegative(),
  createdBy: z.object({
    id: z.number().int().positive(),
    fullName: z.string(),
  }).nullable().optional(),
  modifiedBy: z.object({
    id: z.number().int().positive(),
    fullName: z.string(),
  }).nullable().optional(),
});

export const roleFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isActive: z.coerce.boolean().optional(),
  isSystem: z.coerce.boolean().optional(),
});

export const bulkCreateRolesSchema = z.object({
  roles: z.array(createRoleSchema).min(1, "Debe proporcionar al menos un rol"),
});

export const bulkUpdateRolesSchema = z.object({
  updates: z.array(
    z.object({
      id: z.number().int().positive(),
      data: updateRoleSchema,
    })
  ).min(1, "Debe proporcionar al menos una actualización"),
});

export const bulkDeleteRolesSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, "Debe proporcionar al menos un ID"),
});

// ✨ ACTUALIZAR: Valores por defecto con array vacío
export const defaultRoleValues: z.infer<typeof createRoleSchema> = {
  name: '',
  description: null,
  permissions: [], 
  isActive: true,
   modifiedById: null,
  createdById: null,
};

// Tipos inferidos
export type RoleSchema = z.infer<typeof roleSchema>;
export type CreateRoleSchema = z.infer<typeof createRoleSchema>;
export type UpdateRoleSchema = z.infer<typeof updateRoleSchema>;
export type RoleWithRelationsSchema = z.infer<typeof roleWithRelationsSchema>;
export type RoleFiltersSchema = z.infer<typeof roleFiltersSchema>;
export type BulkCreateRolesSchema = z.infer<typeof bulkCreateRolesSchema>;
export type BulkUpdateRolesSchema = z.infer<typeof bulkUpdateRolesSchema>;
export type BulkDeleteRolesSchema = z.infer<typeof bulkDeleteRolesSchema>;
export type RolePermissionWithScopeSchema = z.infer<typeof rolePermissionWithScopeSchema>;

