// src/constants/modules-permissions/notifications/notifications.permissions.ts

import { PermissionConfig } from '../types';

interface NotificationsPermissionConfig {
  moduleName: string;
  displayName: string;
  requiredPermission: string;
  READ: PermissionConfig;
  CREATE: PermissionConfig;
  SEND: PermissionConfig;
  UPDATE: PermissionConfig;
  DELETE: PermissionConfig;
  READ_PREFERENCES: PermissionConfig;
  UPDATE_PREFERENCES: PermissionConfig;
}

export const NOTIFICATIONS_PERMISSIONS: NotificationsPermissionConfig = {
  moduleName: 'NOTIFICATIONS',
  displayName: 'Notificaciones',
  requiredPermission: 'notification:read',
  
  READ: {
    module: 'notification',
    action: 'read',
    description: 'Listar notificaciones',
    scope: 'all',
  },

  CREATE: {
    module: 'notification',
    action: 'create',
    description: 'Crear notificaciones',
    scope: 'all',
  },

  SEND: {
    module: 'notification',
    action: 'send',
    description: 'Enviar notificaciones',
    scope: 'all',
  },

  UPDATE: {
    module: 'notification',
    action: 'update',
    description: 'Actualizar notificaciones',
    scope: 'all',
  },

  DELETE: {
    module: 'notification',
    action: 'delete',
    description: 'Eliminar notificaciones',
    scope: 'all',
  },

  READ_PREFERENCES: {
    module: 'notification-preference',
    action: 'read',
    description: 'Ver preferencias de notificaciones',
    scope: 'all',
  },

  UPDATE_PREFERENCES: {
    module: 'notification-preference',
    action: 'update',
    description: 'Actualizar preferencias de notificaciones',
    scope: 'all',
  },
};

export default NOTIFICATIONS_PERMISSIONS;
