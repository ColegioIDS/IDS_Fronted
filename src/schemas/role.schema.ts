import { z } from 'zod';


export const roleCreateSchema = z.object({
name: z
.string({ required_error: 'El nombre es obligatorio' })
.min(3, 'Mínimo 3 caracteres')
.max(60, 'Máximo 60 caracteres'),
description: z
.string()
.max(200, 'Máximo 200 caracteres')
.optional()
.nullable(),
isActive: z.boolean().optional().default(true),
});


export const roleUpdateSchema = roleCreateSchema.partial();


export type RoleCreateInput = z.infer<typeof roleCreateSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;