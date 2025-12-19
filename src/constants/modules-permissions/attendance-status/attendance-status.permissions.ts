/**
 * ====================================================================
 * ATTENDANCE STATUS PERMISSIONS - Permisos para Estados de Asistencia
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/attendance-status/attendance-status.permissions.ts
 * 
 * Define los permisos para gestionar los estados de asistencia del sistema.
 * Los estados definen cómo se puede marcar la asistencia (presente, ausente, tardío, etc.).
 * 
 * VALIDACIONES IMPORTANTES:
 * - Solo administradores pueden acceder (scope ALL)
 * - Los cambios afectan a cómo se registra la asistencia
 * - Se debe validar que los cambios no afecten registros existentes
 * - Se registra auditoría de cambios
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo Attendance Status (Estados de Asistencia)
 */
export const ATTENDANCE_STATUS_PERMISSIONS = {
  /**
   * READ - Listar estados de asistencia
   * 
   * Permite: Acceder a la pantalla de gestión de estados
   * Incluye:
   * - Visualizar lista de estados
   * - Aplicar filtros y búsqueda
   * - Acceder a paginación
   * - Ver información resumida de cada estado
   * Restricciones:
   * - Solo administradores pueden listar
   * - No incluye detalles internos
   * Scopes: ALL (solo administradores)
   */
  READ: {
    module: 'attendance-status',
    action: 'read',
    description: 'Listar estados de asistencia con filtros y paginación',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ_ONE - Ver detalles de un estado
   * 
   * Permite: Acceder a los detalles completos de un estado
   * Incluye:
   * - Ver todas las propiedades del estado
   * - Visualizar historial de cambios
   * - Ver registros asociados
   * - Acceder a configuración avanzada
   * Restricciones:
   * - Solo administradores pueden ver detalles
   * - Se valida que el estado exista
   * - Se registra el acceso en auditoría
   * Scopes: ALL (solo administradores)
   */
  READ_ONE: {
    module: 'attendance-status',
    action: 'read-one',
    description: 'Ver detalles de un estado de asistencia específico',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * CREATE - Crear nuevo estado
   * 
   * Permite: Crear nuevos estados de asistencia en el sistema
   * Incluye:
   * - Definir nombre del estado
   * - Establecer color/icono
   * - Configurar comportamiento
   * - Asignar a grupos o categorías
   * Restricciones:
   * - Solo administradores pueden crear
   * - Se valida que el nombre sea único
   * - Se registra quién creó el estado
   * - Se crea registro de auditoría
   * Scopes: ALL (solo administradores)
   */
  CREATE: {
    module: 'attendance-status',
    action: 'create',
    description: 'Crear nuevos estados de asistencia',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * UPDATE - Actualizar estado
   * 
   * Permite: Modificar propiedades de estados existentes
   * Incluye:
   * - Cambiar nombre o descripción
   * - Actualizar color/icono
   * - Cambiar comportamiento
   * - Activar o desactivar estado
   * Restricciones:
   * - Solo administradores pueden actualizar
   * - No se puede cambiar el ID del estado
   * - Se valida integridad referencial
   * - Se registra el historial de cambios
   * - Auditoría de quién realizó la modificación
   * Scopes: ALL (solo administradores)
   */
  UPDATE: {
    module: 'attendance-status',
    action: 'update',
    description: 'Actualizar, activar o desactivar estados de asistencia',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * DELETE - Eliminar estado
   * 
   * Permite: Eliminar estados de asistencia del sistema
   * Incluye:
   * - Remover estado existente
   * - Limpiar referencias
   * - Archivar datos históricos
   * Restricciones:
   * - Solo administradores pueden eliminar
   * - No se puede eliminar si está en uso en registros activos
   * - Se crea registro de auditoría de eliminación
   * - Soft delete (registros se archivan)
   * Scopes: ALL (solo administradores)
   */
  DELETE: {
    module: 'attendance-status',
    action: 'delete',
    description: 'Eliminar estados de asistencia',
    allowedScopes: ['all'],
  } as PermissionConfig,
} as const;

export default ATTENDANCE_STATUS_PERMISSIONS;
