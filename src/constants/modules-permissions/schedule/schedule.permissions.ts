import { PermissionConfig, PermissionScope } from '../types';

/**
 * Permisos del módulo de Horarios
 * 
 * Define los permisos disponibles para el módulo de schedules:
 * - CREATE: Crear nuevos horarios
 * - READ: Listar horarios
 * - READ_ONE: Ver detalles de un horario específico
 * - UPDATE: Actualizar horarios
 * - DELETE: Eliminar horarios
 * - CONFIGURE: Configurar horarios (crear/actualizar configuración)
 */

export const SCHEDULE_PERMISSIONS = {
  CREATE: {
    module: 'schedule',
    action: 'create',
    description: 'Crear nuevos horarios',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  READ: {
    module: 'schedule',
    action: 'read',
    description: 'Listar horarios',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  READ_ONE: {
    module: 'schedule',
    action: 'read-one',
    description: 'Ver detalles de un horario específico',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  UPDATE: {
    module: 'schedule',
    action: 'update',
    description: 'Actualizar horarios',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  DELETE: {
    module: 'schedule',
    action: 'delete',
    description: 'Eliminar horarios',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  CONFIGURE: {
    module: 'schedule',
    action: 'configure',
    description: 'Configurar horarios',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
} as const;
