/**
 * ====================================================================
 * USER PERMISSIONS - Permisos para el módulo de Usuarios
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/user/user.permissions.ts
 * 
 * Define los permisos para gestionar usuarios en el sistema.
 * Incluye acciones extendidas como cambio de contraseña, otorgamiento
 * de acceso, verificación de email y asignación de roles.
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo User (Usuarios)
 */
export const USER_PERMISSIONS = {
  /**
   * CREATE - Crear nuevos usuarios
   * 
   * Permite: Crear nuevos usuarios en el sistema
   */
  CREATE: {
    module: 'user',
    action: 'create',
    description: 'Crear nuevos usuarios en el sistema',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ - Listar usuarios
   * 
   * Permite: Listar todos los usuarios del sistema
   */
  READ: {
    module: 'user',
    action: 'read',
    description: 'Listar todos los usuarios del sistema',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ_ONE - Ver detalles de un usuario
   * 
   * Permite: Ver detalles de un usuario específico
   */
  READ_ONE: {
    module: 'user',
    action: 'read-one',
    description: 'Ver detalles de un usuario específico',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * UPDATE - Actualizar usuarios
   * 
   * Permite: Actualizar información de un usuario
   */
  UPDATE: {
    module: 'user',
    action: 'update',
    description: 'Actualizar información de un usuario',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * DELETE - Eliminar usuarios
   * 
   * Permite: Eliminar un usuario del sistema (soft delete)
   */
  DELETE: {
    module: 'user',
    action: 'delete',
    description: 'Eliminar un usuario del sistema',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * CHANGE_PASSWORD - Cambiar contraseña
   * 
   * Permite: Cambiar contraseña de un usuario
   */
  CHANGE_PASSWORD: {
    module: 'user',
    action: 'change-password',
    description: 'Cambiar contraseña de un usuario',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * GRANT_ACCESS - Otorgar acceso a plataforma
   * 
   * Permite: Otorgar acceso a plataforma a un usuario
   */
  GRANT_ACCESS: {
    module: 'user',
    action: 'grant-access',
    description: 'Otorgar acceso a plataforma a un usuario',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * REVOKE_ACCESS - Revocar acceso a plataforma
   * 
   * Permite: Revocar acceso a plataforma de un usuario
   */
  REVOKE_ACCESS: {
    module: 'user',
    action: 'revoke-access',
    description: 'Revocar acceso a plataforma de un usuario',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * VERIFY_EMAIL - Verificar email
   * 
   * Permite: Verificar email de un usuario
   */
  VERIFY_EMAIL: {
    module: 'user',
    action: 'verify-email',
    description: 'Verificar email de un usuario',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * RESTORE - Restaurar usuario eliminado
   * 
   * Permite: Restaurar un usuario eliminado (soft delete)
   */
  RESTORE: {
    module: 'user',
    action: 'restore',
    description: 'Restaurar un usuario eliminado (soft delete)',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * ASSIGN_ROLE - Asignar rol
   * 
   * Permite: Asignar un rol a un usuario
   */
  ASSIGN_ROLE: {
    module: 'user',
    action: 'assign-role',
    description: 'Asignar un rol a un usuario',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ_STATS - Leer estadísticas
   * 
   * Permite: Ver estadísticas de usuarios
   */
  READ_STATS: {
    module: 'user',
    action: 'read-stats',
    description: 'Ver estadísticas de usuarios',
    allowedScopes: ['all'],
  } as PermissionConfig,
} as const;

export default USER_PERMISSIONS;
