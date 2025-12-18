/**
 * ====================================================================
 * SECTION PERMISSIONS - Permisos para el módulo de Secciones
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/section/section.permissions.ts
 * 
 * Define los permisos CRUD para gestionar secciones dentro del sistema
 * académico. Las secciones agrupan estudiantes y maestros dentro de
 * un grado específico.
 * 
 * VALIDACIONES IMPORTANTES:
 * - Las secciones deben pertenecer a un grado válido
 * - El nombre de la sección debe ser único dentro del mismo grado
 * - Los secciones con estudiantes activos no pueden eliminarse fácilmente
 * - El maestro titular debe estar asignado a la sección
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo Section (Secciones)
 */
export const SECTION_PERMISSIONS = {
  /**
   * CREATE - Crear nuevas secciones
   * 
   * Permite: Crear nuevas secciones en un grado específico
   * Restricciones: 
   * - El grado debe existir y estar activo
   * - El nombre debe ser único dentro del grado
   * - Requiere asignar un maestro titular
   */
  CREATE: {
    module: 'section',
    action: 'create',
    description: 'Crear nuevas secciones en un grado específico',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ - Listar secciones
   * 
   * Permite: Listar y consultar secciones con filtros
   * Incluye: Búsqueda, ordenamiento, paginación, filtros por grado
   */
  READ: {
    module: 'section',
    action: 'read',
    description: 'Listar y consultar secciones con filtros',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ_ONE - Ver detalles de una sección
   * 
   * Permite: Ver información detallada de una sección específica
   * Incluye: Estudiantes, maestro titular, horario, estadísticas
   */
  READ_ONE: {
    module: 'section',
    action: 'read-one',
    description: 'Ver detalles de una sección específica',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * UPDATE - Actualizar secciones
   * 
   * Permite: Actualizar información de una sección
   * Restricciones:
   * - No cambiar nombre si genera duplicado en el mismo grado
   * - Puede cambiar maestro titular
   * - Puede cambiar descripción y capacidad
   */
  UPDATE: {
    module: 'section',
    action: 'update',
    description: 'Actualizar información de secciones',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * DELETE - Eliminar secciones
   * 
   * Permite: Eliminar una sección del sistema
   * Restricciones:
   * - No se puede eliminar si tiene estudiantes activos
   * - Se recomienda desactivar en lugar de eliminar
   */
  DELETE: {
    module: 'section',
    action: 'delete',
    description: 'Eliminar secciones del sistema',
    allowedScopes: ['all'],
  } as PermissionConfig,
} as const;

export default SECTION_PERMISSIONS;
