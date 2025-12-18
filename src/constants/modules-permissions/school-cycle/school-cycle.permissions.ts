/**
 * ====================================================================
 * SCHOOL-CYCLE MODULE - Permisos para gestión de ciclos escolares
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/school-cycle/school-cycle.permissions.ts
 * 
 * Los ciclos escolares son recursos globales del sistema, por lo que
 * solo tienen scope 'all'. No tiene sentido que un ciclo escolar sea
 * específico de un grado o sección.
 * 
 * Sincronizado con: src/database/seeds/modules/school-cycle/permissions.seed.ts
 */

import type { PermissionConfig } from '../types';

/**
 * Permisos del módulo: SCHOOL_CYCLE
 * 
 * Define todos los permisos disponibles para la gestión de ciclos escolares.
 * Estos permisos se sincronizen con el backend mediante seeds.
 */
export const SCHOOL_CYCLE_PERMISSIONS = {
  /**
   * Crear nuevos ciclos escolares
   * - Acción: Crear un nuevo ciclo escolar
   * - Scope: all (recurso global)
   * - Descripción: Crear nuevos ciclos escolares
   */
  CREATE: {
    module: 'school-cycle',
    action: 'create',
    description: 'Crear nuevos ciclos escolares',
    scope: 'all',
  } as PermissionConfig,

  /**
   * Listar todos los ciclos escolares
   * - Acción: Obtener lista paginada de ciclos escolares
   * - Scope: all (recurso global)
   * - Descripción: Listar todos los ciclos escolares
   */
  READ: {
    module: 'school-cycle',
    action: 'read',
    description: 'Listar todos los ciclos escolares',
    scope: 'all',
  } as PermissionConfig,

  /**
   * Ver detalles de un ciclo escolar específico
   * - Acción: Obtener un ciclo escolar por ID con todas sus relaciones
   * - Scope: all (recurso global)
   * - Descripción: Ver detalles de un ciclo escolar específico
   */
  READ_ONE: {
    module: 'school-cycle',
    action: 'read-one',
    description: 'Ver detalles de un ciclo escolar específico',
    scope: 'all',
  } as PermissionConfig,

  /**
   * Actualizar información de ciclos escolares
   * - Acción: Modificar datos de un ciclo escolar existente
   * - Scope: all (recurso global)
   * - Descripción: Actualizar información de ciclos escolares
   * - Requiere: READ_ONE (necesita poder ver el ciclo para actualizarlo)
   */
  UPDATE: {
    module: 'school-cycle',
    action: 'update',
    description: 'Actualizar información de ciclos escolares',
    scope: 'all',
  } as PermissionConfig,

  /**
   * Eliminar ciclos escolares
   * - Acción: Eliminar (soft delete) un ciclo escolar
   * - Scope: all (recurso global)
   * - Descripción: Eliminar ciclos escolares
   * - Requiere: READ (necesita poder listar ciclos)
   */
  DELETE: {
    module: 'school-cycle',
    action: 'delete',
    description: 'Eliminar ciclos escolares',
    scope: 'all',
  } as PermissionConfig,

  /**
   * Activar un ciclo escolar
   * - Acción: Marcar un ciclo como activo (marca los demás como inactivos)
   * - Scope: all (recurso global)
   * - Descripción: Activar un ciclo escolar (marca los demás como inactivos)
   * - Requiere: READ, UPDATE (necesita listar y actualizar ciclos)
   */
  ACTIVATE: {
    module: 'school-cycle',
    action: 'activate',
    description: 'Activar un ciclo escolar (marca los demás como inactivos)',
    scope: 'all',
  } as PermissionConfig,

  /**
   * Cerrar un ciclo escolar
   * - Acción: Cerrar un ciclo escolar (no permite más modificaciones)
   * - Scope: all (recurso global)
   * - Descripción: Cerrar un ciclo escolar (no permite más modificaciones)
   * - Requiere: READ_ONE, UPDATE (necesita ver y actualizar el ciclo)
   */
  CLOSE: {
    module: 'school-cycle',
    action: 'close',
    description: 'Cerrar un ciclo escolar (no permite más modificaciones)',
    scope: 'all',
  } as PermissionConfig,

  /**
   * Generar reportes estadísticos del ciclo escolar
   * - Acción: Crear reportes con estadísticas del ciclo escolar
   * - Scope: all (recurso global)
   * - Descripción: Generar reportes estadísticos del ciclo escolar
   * - Requiere: READ_ONE (necesita ver datos del ciclo para generar reportes)
   */
  GENERATE_REPORT: {
    module: 'school-cycle',
    action: 'generate-report',
    description: 'Generar reportes estadísticos del ciclo escolar',
    scope: 'all',
  } as PermissionConfig,
} as const;
