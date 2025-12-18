import { PermissionConfig, PermissionScope } from '../types';

/**
 * Permisos del módulo de Asignaciones de Cursos
 * 
 * Define los permisos disponibles para el módulo de course-assignments:
 * - CREATE: Crear nuevas asignaciones de cursos
 * - READ: Listar asignaciones de cursos
 * - READ_ONE: Ver detalles de una asignación específica
 * - UPDATE: Actualizar asignaciones de cursos
 * - DELETE: Eliminar asignaciones de cursos
 * - BULK_CREATE: Crear múltiples asignaciones en lote
 * - BULK_UPDATE: Actualizar múltiples asignaciones en lote
 */

export const COURSE_ASSIGNMENT_PERMISSIONS = {
  CREATE: {
    module: 'course-assignment',
    action: 'create',
    description: 'Crear nuevas asignaciones de cursos',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  READ: {
    module: 'course-assignment',
    action: 'read',
    description: 'Listar asignaciones de cursos',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  READ_ONE: {
    module: 'course-assignment',
    action: 'read-one',
    description: 'Ver detalles de una asignación específica',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  UPDATE: {
    module: 'course-assignment',
    action: 'update',
    description: 'Actualizar asignaciones de cursos',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  DELETE: {
    module: 'course-assignment',
    action: 'delete',
    description: 'Eliminar asignaciones de cursos',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  BULK_CREATE: {
    module: 'course-assignment',
    action: 'bulk_create',
    description: 'Crear múltiples asignaciones en lote',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  BULK_UPDATE: {
    module: 'course-assignment',
    action: 'bulk_update',
    description: 'Actualizar múltiples asignaciones en lote',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
} as const satisfies Record<string, PermissionConfig>;

export type CourseAssignmentPermissionKey = keyof typeof COURSE_ASSIGNMENT_PERMISSIONS;
