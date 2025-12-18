/**
 * ====================================================================
 * PERMISSION MODULE - Permisos para gestión de permisos del sistema
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/permission/permission.permissions.ts
 * 
 * Este módulo gestiona los permisos del sistema.
 * Los permisos se definen en el backend y se replican aquí para
 * mantener consistencia en el frontend.
 * 
 * Fuente: backend/src/database/modules/permissions/permissions.seed.ts
 */

import type { PermissionConfig } from '../types';

/**
 * Permisos del módulo: PERMISSION
 * 
 * Este módulo es de SOLO LECTURA en el frontend.
 * Los permisos se crean automáticamente por las seeds del backend.
 */
export const PERMISSION_PERMISSIONS = {
  /**
   * Listar todos los permisos del sistema
   * - Acción: Obtener lista paginada de permisos con filtros
   * - Scope: all (solo administrador total)
   * - Descripción: Listar todos los permisos del sistema
   */
  READ: {
    module: 'permission',
    action: 'read',
    description: 'Listar todos los permisos del sistema',
    scope: 'all',
  } as PermissionConfig,

  /**
   * Ver detalles de un permiso específico
   * - Acción: Obtener un permiso por ID con todas sus relaciones
   * - Scope: all (solo administrador total)
   * - Descripción: Ver detalles de un permiso específico
   */
  READ_ONE: {
    module: 'permission',
    action: 'read-one',
    description: 'Ver detalles de un permiso específico',
    scope: 'all',
  } as PermissionConfig,
} as const;

/**
 * Exportación por defecto para uso fácil
 */
export default PERMISSION_PERMISSIONS;
