/**
 * ====================================================================
 * GRADE PERMISSIONS - Permisos para el módulo de Grados Escolares
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/grade/grade.permissions.ts
 * 
 * Define los permisos CRUD para gestionar grados escolares dentro
 * del sistema académico.
 * 
 * VALIDACIONES IMPORTANTES:
 * - Los grados no pueden duplicarse
 * - El orden determina la posición en listados
 * - Los grados desactivados no aparecen en asignaciones nuevas
 * - Los grados con enrollments activos no pueden eliminarse
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo Grade (Grados Escolares)
 */
export const GRADE_PERMISSIONS = {
  /**
   * CREATE - Crear nuevos grados escolares
   * 
   * Permite: Crear nuevos grados escolares en el sistema
   * Restricciones: 
   * - El nombre del grado debe ser único
   * - Requiere especificar un orden
   */
  CREATE: {
    module: 'grade',
    action: 'create',
    description: 'Crear nuevos grados escolares en el sistema',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ - Listar grados escolares
   * 
   * Permite: Listar y consultar grados con filtros
   * Incluye: Búsqueda, ordenamiento, paginación
   */
  READ: {
    module: 'grade',
    action: 'read',
    description: 'Listar y consultar grados escolares con filtros',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ_ONE - Ver detalles de un grado
   * 
   * Permite: Ver información detallada de un grado específico
   */
  READ_ONE: {
    module: 'grade',
    action: 'read-one',
    description: 'Ver detalles de un grado escolar específico',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * UPDATE - Actualizar grados escolares
   * 
   * Permite: Actualizar información de un grado
   * Restricciones:
   * - No cambiar nombre si genera duplicado
   * - Puede cambiar orden, estado y descripción
   */
  UPDATE: {
    module: 'grade',
    action: 'update',
    description: 'Actualizar información de grados escolares',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * DELETE - Eliminar grados escolares
   * 
   * Permite: Eliminar un grado del sistema
   * Restricciones:
   * - No se puede eliminar si tiene enrollments activos
   * - Se recomienda desactivar en lugar de eliminar
   */
  DELETE: {
    module: 'grade',
    action: 'delete',
    description: 'Eliminar grados escolares del sistema',
    allowedScopes: ['all'],
  } as PermissionConfig,
} as const;

export default GRADE_PERMISSIONS;
