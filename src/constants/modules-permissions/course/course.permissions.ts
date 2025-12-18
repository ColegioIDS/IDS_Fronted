import { PermissionConfig, PermissionScope } from '../types';

/**
 * Permisos del módulo de Cursos
 * 
 * Define los permisos disponibles para el módulo de cursos:
 * - CREATE: Crear nuevos cursos
 * - READ: Listar cursos
 * - READ_ONE: Ver detalles de un curso específico
 * - UPDATE: Actualizar información de cursos
 * - DELETE: Eliminar cursos
 * - RESTORE: Restaurar cursos eliminados
 */

export const COURSE_PERMISSIONS = {
  CREATE: {
    module: 'course',
    action: 'create',
    description: 'Crear nuevos cursos',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  READ: {
    module: 'course',
    action: 'read',
    description: 'Listar todos los cursos',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  READ_ONE: {
    module: 'course',
    action: 'read-one',
    description: 'Ver detalles de un curso específico',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  UPDATE: {
    module: 'course',
    action: 'update',
    description: 'Actualizar información de cursos',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  DELETE: {
    module: 'course',
    action: 'delete',
    description: 'Eliminar cursos',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  RESTORE: {
    module: 'course',
    action: 'restore',
    description: 'Restaurar cursos eliminados',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
} as const satisfies Record<string, PermissionConfig>;

export type CoursePermissionKey = keyof typeof COURSE_PERMISSIONS;
