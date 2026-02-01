// src/constants/modules-permissions/notifications/notifications.permissions.ts
// Sincronizado con: backend src/database/seeds/modules/notifications/notifications.seed.ts

import type { PermissionConfig } from '../types';

export const NOTIFICATIONS_PERMISSIONS = {
  READ: {
    module: 'notification',
    action: 'read',
    description: 'Listar notificaciones',
    scope: 'all',
  } as PermissionConfig,

  READ_ONE: {
    module: 'notification',
    action: 'read-one',
    description: 'Ver detalles de una notificación',
    scope: 'all',
  } as PermissionConfig,

  CREATE: {
    module: 'notification',
    action: 'create',
    description: 'Crear notificaciones',
    scope: 'all',
  } as PermissionConfig,

  SEND: {
    module: 'notification',
    action: 'send',
    description: 'Enviar notificaciones masivas',
    scope: 'all',
  } as PermissionConfig,

  UPDATE: {
    module: 'notification',
    action: 'update',
    description: 'Actualizar notificaciones',
    scope: 'all',
  } as PermissionConfig,

  DELETE: {
    module: 'notification',
    action: 'delete',
    description: 'Eliminar notificaciones',
    scope: 'all',
  } as PermissionConfig,

  READ_PREFERENCES: {
    module: 'notification-preference',
    action: 'read',
    description: 'Ver y gestionar mis preferencias',
    scope: 'all',
  } as PermissionConfig,

  READ_ALL_PREFERENCES: {
    module: 'notification-preference',
    action: 'read-all',
    description: 'Ver todas las preferencias de usuarios',
    scope: 'all',
  } as PermissionConfig,

  UPDATE_PREFERENCES: {
    module: 'notification-preference',
    action: 'update',
    description: 'Actualizar preferencias de notificaciones',
    scope: 'all',
  } as PermissionConfig,

  READ_LOG: {
    module: 'notification',
    action: 'read-log',
    description: 'Ver log de lectura de notificaciones',
    scope: 'all',
  } as PermissionConfig,
} as const;

export default NOTIFICATIONS_PERMISSIONS;

