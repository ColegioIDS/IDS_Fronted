// src/schemas/permissions.ts

import { z } from 'zod';

// Schema para la respuesta de un permiso (read-only)
export const permissionSchema = z.object({
  id: z.number().int().positive(),
  module: z.string().min(1),
  action: z.string().min(1),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  isSystem: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema para permiso con relaciones
export const permissionWithRelationsSchema = permissionSchema.extend({
  usedInRoles: z.array(
    z.object({
      id: z.number().int().positive(),
      name: z.string(),
    })
  ),
  rolesCount: z.number().int().nonnegative(),
});

// Schema para filtros de búsqueda
export const permissionFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['module', 'action', 'createdAt', 'updatedAt']).default('module'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  isActive: z.coerce.boolean().optional(),
  isSystem: z.coerce.boolean().optional(),
});

// Tipos inferidos
export type PermissionSchema = z.infer<typeof permissionSchema>;
export type PermissionWithRelationsSchema = z.infer<typeof permissionWithRelationsSchema>;
export type PermissionFiltersSchema = z.infer<typeof permissionFiltersSchema>;