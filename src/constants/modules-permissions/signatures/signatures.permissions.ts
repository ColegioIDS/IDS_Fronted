/**
 * ====================================================================
 * SIGNATURES PERMISSIONS - Permisos para el módulo de Firmas Digitales
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/signatures/signatures.permissions.ts
 * 
 * Define los permisos CRUD + custom para gestionar firmas digitales de 
 * autoridades escolares (maestros, directores, coordinadores, etc.) 
 * para cartas de notas.
 * 
 * VALIDACIONES IMPORTANTES:
 * - Las firmas están asociadas a autoridades escolares específicas
 * - Solo puede haber una firma default por tipo de autoridad
 * - Las firmas inactivas no aparecen en las cartas de notas
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo Signatures (Firmas Digitales)
 */
export const SIGNATURES_PERMISSIONS = {
  /**
   * CREATE - Crear nuevas firmas digitales
   * 
   * Permite: Crear nuevas firmas digitales de autoridades escolares
   * Requiere: 
   * - Usuario con rol de administrador o director
   * - Imagen de firma válida
   * - Asociación a una autoridad escolar existente
   */
  CREATE: {
    module: 'signatures',
    action: 'create',
    description: 'Crear una nueva firma de autoridad escolar',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ - Listar firmas digitales
   * 
   * Permite: Listar y consultar todas las firmas del sistema
   * Incluye: Detalles de autoridades asociadas y estado de validez
   */
  READ: {
    module: 'signatures',
    action: 'read',
    description: 'Listar todas las firmas del sistema',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ_ONE - Ver detalles de una firma digital
   * 
   * Permite: Ver detalles completos de una firma específica
   * Incluye: Imagen, validez, tipo de autoridad, estado
   */
  READ_ONE: {
    module: 'signatures',
    action: 'read-one',
    description: 'Ver detalles de una firma específica',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * UPDATE - Actualizar firmas digitales
   * 
   * Permite: Actualizar información de una firma
   * Puede incluir: Cambio de imagen, cambio de autoridad, estado activo/inactivo
   */
  UPDATE: {
    module: 'signatures',
    action: 'update',
    description: 'Actualizar información de una firma (imagen, validez)',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * DELETE - Eliminar firmas digitales
   * 
   * Permite: Eliminar una firma del sistema
   * Restricción: No se puede eliminar si está asignada a cartas de notas activas
   */
  DELETE: {
    module: 'signatures',
    action: 'delete',
    description: 'Eliminar una firma del sistema',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * SET_DEFAULT - Marcar firma como default
   * 
   * Permite: Marcar una firma como la firma por defecto para su tipo
   * Restricción: Solo puede haber una firma default por tipo de autoridad
   */
  SET_DEFAULT: {
    module: 'signatures',
    action: 'set-default',
    description: 'Marcar una firma como default para su tipo',
    allowedScopes: ['all'],
  } as PermissionConfig,
} as const;

export default SIGNATURES_PERMISSIONS;
