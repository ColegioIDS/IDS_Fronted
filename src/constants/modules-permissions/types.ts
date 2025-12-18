/**
 * ====================================================================
 * TIPOS - Configuración de permisos
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/types.ts
 * 
 * Tipos compartidos para todos los módulos de permisos
 */

/**
 * Estructura de un permiso
 * 
 * @property module - Nombre del módulo (ej: 'permission', 'user', 'course')
 * @property action - Nombre de la acción (ej: 'read', 'create', 'update')
 * @property description - Descripción legible del permiso
 * @property scope - Alcance del permiso: 'all', 'own', 'grade'
 * 
 * @example
 * {
 *   module: 'permission',
 *   action: 'read',
 *   description: 'Listar todos los permisos del sistema',
 *   scope: 'all'
 * }
 */
export interface PermissionConfig {
  module: string;
  action: string;
  description?: string;
  scope?: 'all' | 'own' | 'grade' | 'coordinator' | 'section';
}

/**
 * Tipos de scope de permisos
 * 
 * - 'all': El usuario puede acceder a TODOS los recursos
 * - 'own': El usuario puede acceder solo a sus propios recursos
 * - 'coordinator': El usuario puede acceder como coordinador (grado/sección)
 * - 'grade': El usuario puede acceder a recursos de su grado
 * - 'section': El usuario puede acceder a recursos de su sección
 */
export type PermissionScope = 'all' | 'own' | 'coordinator' | 'grade' | 'section';

/**
 * Acciones CRUD estándar
 */
export const CRUD_ACTIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

/**
 * Scopes estándar
 */
export const SCOPE_TYPES = {
  ALL: 'all' as PermissionScope,
  OWN: 'own' as PermissionScope,
  COORDINATOR: 'coordinator' as PermissionScope,
  GRADE: 'grade' as PermissionScope,
  SECTION: 'section' as PermissionScope,
} as const;
