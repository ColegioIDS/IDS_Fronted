import { PermissionConfig, PermissionScope } from '../types';

/**
 * Permisos del módulo de Configuración de Horarios
 * 
 * Define los permisos disponibles para el módulo de schedule-config:
 * - CREATE: Crear configuraciones de horario para secciones
 * - READ: Listar configuraciones de horario
 * - READ_ONE: Ver detalles de una configuración de horario
 * - UPDATE: Actualizar configuraciones de horario (requiere READ_ONE)
 * - DELETE: Eliminar configuraciones de horario (requiere READ)
 */

export const SCHEDULE_CONFIG_PERMISSIONS = {
  CREATE: {
    module: 'schedule-config',
    action: 'create',
    description: 'Crear configuraciones de horario para secciones',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  READ: {
    module: 'schedule-config',
    action: 'read',
    description: 'Listar configuraciones de horario',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  READ_ONE: {
    module: 'schedule-config',
    action: 'read-one',
    description: 'Ver detalles de una configuración de horario',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  UPDATE: {
    module: 'schedule-config',
    action: 'update',
    description: 'Actualizar configuraciones de horario',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
  DELETE: {
    module: 'schedule-config',
    action: 'delete',
    description: 'Eliminar configuraciones de horario',
    scope: 'all' as PermissionScope,
  } as PermissionConfig,
} as const;
