/**
 * Permisos del módulo VERIFY-EMAIL (verificación de correos)
 * Sincronizados con: backend src/database/seeds/modules/verify-email/verify-email.seed.ts
 */

import type { PermissionConfig } from '../types';

export const VERIFY_EMAIL_PERMISSIONS = {
  READ: {
    module: 'verify-email',
    action: 'read',
    description: 'Listar usuarios con email pendiente de verificación',
    scope: 'all',
  } as PermissionConfig,

  STATS: {
    module: 'verify-email',
    action: 'stats',
    description: 'Ver estadísticas de verificación de email',
    scope: 'all',
  } as PermissionConfig,
} as const;
