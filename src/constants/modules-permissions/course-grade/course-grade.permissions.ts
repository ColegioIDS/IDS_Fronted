import { PermissionConfig, PermissionScope } from '../types';

/**
 * Permisos del módulo de Relaciones Curso-Grado
 * 
 * Define los permisos disponibles para el módulo de course-grades:
 * - CREATE: Crear nuevas relaciones Curso-Grado
 * - READ: Listar relaciones Curso-Grado
 * - READ_ONE: Ver detalles de una relación Curso-Grado
 * - UPDATE: Actualizar relaciones Curso-Grado
 * - DELETE: Eliminar relaciones Curso-Grado
 */

export const COURSE_GRADE_PERMISSIONS = {
  CREATE: {
    module: 'course-grade',
    action: 'create',
    description: 'Crear nuevas relaciones Curso-Grado',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  READ: {
    module: 'course-grade',
    action: 'read',
    description: 'Listar relaciones Curso-Grado',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  READ_ONE: {
    module: 'course-grade',
    action: 'read-one',
    description: 'Ver detalles de una relación Curso-Grado',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  UPDATE: {
    module: 'course-grade',
    action: 'update',
    description: 'Actualizar relaciones Curso-Grado',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  DELETE: {
    module: 'course-grade',
    action: 'delete',
    description: 'Eliminar relaciones Curso-Grado',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
} as const satisfies Record<string, PermissionConfig>;

export type CourseGradePermissionKey = keyof typeof COURSE_GRADE_PERMISSIONS;
