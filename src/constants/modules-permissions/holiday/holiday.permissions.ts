/**
 * ====================================================================
 * HOLIDAY PERMISSIONS - Permisos para el módulo de Días Festivos
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/holiday/holiday.permissions.ts
 * 
 * Define los permisos CRUD para gestionar días festivos (holidays)
 * dentro del calendario académico.
 * 
 * VALIDACIONES IMPORTANTES:
 * - No se pueden crear/modificar/eliminar días festivos en ciclos archivados
 * - Las fechas deben estar dentro del rango del bimestre
 * - No se pueden agregar días festivos en semanas de tipo BREAK
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo Holiday (Días Festivos)
 */
export const HOLIDAY_PERMISSIONS = {
  /**
   * CREATE - Crear nuevos días festivos
   * 
   * Permite: Crear nuevos días festivos en un bimestre
   * Restricciones: 
   * - Ciclo académico no archivado
   * - Fecha dentro del rango del bimestre
   */
  CREATE: {
    module: 'holiday',
    action: 'create',
    description: 'Crear nuevos días festivos en un bimestre',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ - Listar días festivos
   * 
   * Permite: Listar y consultar días festivos con filtros
   * Incluye: Helpers de ciclos y bimestres
   */
  READ: {
    module: 'holiday',
    action: 'read',
    description: 'Listar y consultar días festivos con filtros (incluye helpers de ciclos y bimestres)',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ_ONE - Ver detalles de un día festivo
   * 
   * Permite: Ver detalles de un día festivo específico
   */
  READ_ONE: {
    module: 'holiday',
    action: 'read-one',
    description: 'Ver detalles de un día festivo específico',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * UPDATE - Actualizar días festivos
   * 
   * Permite: Actualizar información de un día festivo
   * Restricciones:
   * - Ciclo académico no archivado
   * - Fecha dentro del rango del bimestre
   */
  UPDATE: {
    module: 'holiday',
    action: 'update',
    description: 'Actualizar información de un día festivo',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * DELETE - Eliminar días festivos
   * 
   * Permite: Eliminar un día festivo del sistema
   * Restricciones:
   * - Ciclo académico no archivado
   */
  DELETE: {
    module: 'holiday',
    action: 'delete',
    description: 'Eliminar un día festivo del sistema',
    allowedScopes: ['all'],
  } as PermissionConfig,
} as const;

export default HOLIDAY_PERMISSIONS;
