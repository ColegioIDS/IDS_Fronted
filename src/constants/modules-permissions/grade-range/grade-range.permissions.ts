/**
 * ====================================================================
 * GRADE_RANGE PERMISSIONS - Permisos para el módulo de Rangos de Calificaciones
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/grade-range/grade-range.permissions.ts
 * 
 * Define los permisos CRUD para gestionar rangos de calificaciones dentro
 * del sistema académico.
 * 
 * VALIDACIONES IMPORTANTES:
 * - Los rangos no pueden duplicarse por nombre y nivel
 * - minScore debe ser menor o igual a maxScore
 * - letterGrade solo se aplica a nivel Preparatoria
 * - Los rangos activos aparecen en configuraciones de calificaciones
 * - Los rangos desactivados no se pueden eliminar si están en uso
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo Grade Range (Rangos de Calificaciones)
 */
export const GRADE_RANGE_PERMISSIONS = {
  /**
   * CREATE - Crear nuevos rangos de calificaciones
   * 
   * Permite: Crear nuevos rangos de calificaciones en el sistema
   * Restricciones: 
   * - El nombre del rango debe ser único
   * - minScore debe ser <= maxScore
   * - letterGrade solo para Preparatoria
   */
  CREATE: {
    module: 'grade-range',
    action: 'create',
    description: 'Crear nuevos rangos de calificaciones en el sistema',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ - Listar rangos de calificaciones
   * 
   * Permite: Listar y consultar rangos con filtros
   * Incluye: Búsqueda por nivel, ordenamiento, paginación
   */
  READ: {
    module: 'grade-range',
    action: 'read',
    description: 'Listar y consultar rangos de calificaciones con filtros',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ_ONE - Ver detalles de un rango
   * 
   * Permite: Ver información detallada de un rango específico
   */
  READ_ONE: {
    module: 'grade-range',
    action: 'read-one',
    description: 'Ver detalles de un rango de calificaciones específico',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * UPDATE - Actualizar rangos de calificaciones
   * 
   * Permite: Actualizar información de un rango
   * Restricciones:
   * - No cambiar nombre si genera duplicado
   * - Validar minScore <= maxScore
   * - Puede cambiar color, descripción, estado
   */
  UPDATE: {
    module: 'grade-range',
    action: 'update',
    description: 'Actualizar información de rangos de calificaciones',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * DELETE - Eliminar rangos de calificaciones
   * 
   * Permite: Eliminar un rango del sistema
   * Restricciones:
   * - No se puede eliminar si está siendo usado en calificaciones
   * - Se recomienda desactivar en lugar de eliminar
   */
  DELETE: {
    module: 'grade-range',
    action: 'delete',
    description: 'Eliminar rangos de calificaciones del sistema',
    allowedScopes: ['all'],
  } as PermissionConfig,
} as const;

export default GRADE_RANGE_PERMISSIONS;
