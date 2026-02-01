// src/constants/modules-permissions/role/role.permissions.ts

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo ROLE
 * Sincronizados con: src/database/modules/roles/roles.seed.ts
 */
export const ROLE_PERMISSIONS = {
  CREATE: {
    module: 'role',
    action: 'create',
    description: 'Crear nuevos roles en el sistema',
    scope: 'all',
  } as PermissionConfig,

  READ: {
    module: 'role',
    action: 'read',
    description: 'Listar todos los roles del sistema',
    scope: 'all',
  } as PermissionConfig,

  READ_ONE: {
    module: 'role',
    action: 'read-one',
    description: 'Ver detalles de un rol específico',
    scope: 'all',
  } as PermissionConfig,

  UPDATE: {
    module: 'role',
    action: 'update',
    description: 'Actualizar información de un rol',
    scope: 'all',
  } as PermissionConfig,

  DELETE: {
    module: 'role',
    action: 'delete',
    description: 'Eliminar un rol del sistema',
    scope: 'all',
  } as PermissionConfig,

  ASSIGN_PERMISSIONS: {
    module: 'role',
    action: 'assign-permissions',
    description: 'Asignar permisos a un rol',
    scope: 'all',
  } as PermissionConfig,

  REMOVE_PERMISSIONS: {
    module: 'role',
    action: 'remove-permissions',
    description: 'Remover permisos de un rol',
    scope: 'all',
  } as PermissionConfig,

  RESTORE: {
    module: 'role',
    action: 'restore',
    description: 'Restaurar un rol desactivado',
    scope: 'all',
  } as PermissionConfig,
} as const;
