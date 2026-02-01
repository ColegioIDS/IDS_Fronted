/**
 * Permisos del módulo USER-PROFILE (perfil del usuario autenticado)
 * Sincronizados con: backend src/database/seeds/modules/user-profile-permissions/user-profile-permissions.seed.ts
 */

import type { PermissionConfig } from '../types';

export const USER_PROFILE_PERMISSIONS = {
  READ: {
    module: 'user-profile',
    action: 'read',
    description: 'Ver el perfil personal del usuario autenticado',
    scope: 'all',
  } as PermissionConfig,

  UPDATE: {
    module: 'user-profile',
    action: 'update',
    description: 'Actualizar la información del perfil personal',
    scope: 'all',
  } as PermissionConfig,
} as const;
