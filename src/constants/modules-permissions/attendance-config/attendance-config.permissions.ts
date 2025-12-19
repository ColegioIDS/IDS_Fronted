/**
 * ====================================================================
 * ATTENDANCE CONFIG PERMISSIONS - Permisos para Configuración de Asistencia
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/attendance-config/attendance-config.permissions.ts
 * 
 * Define los permisos para gestionar la configuración del módulo de
 * asistencia, incluyendo calificaciones, estados, vacaciones, etc.
 * 
 * VALIDACIONES IMPORTANTES:
 * - Solo administradores pueden acceder (scope ALL)
 * - Los cambios afectan a todo el sistema
 * - Se debe registrar auditoría de cambios
 * - No se puede eliminar configuración en uso
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo Attendance Config (Configuración de Asistencia)
 */
export const ATTENDANCE_CONFIG_PERMISSIONS = {
  /**
   * VIEW - Ver configuración de asistencia
   * 
   * Permite: Acceder a la pantalla de configuración
   * Incluye:
   * - Visualizar calificaciones de asistencia
   * - Ver estados disponibles
   * - Listar vacaciones configuradas
   * - Ver secciones disponibles
   * Scopes: ALL (solo administradores)
   */
  VIEW: {
    module: 'attendance-config',
    action: 'view',
    description: 'Ver configuración de asistencia',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * CREATE - Crear nueva configuración
   * 
   * Permite: Crear nuevas configuraciones del sistema
   * Incluye:
   * - Agregar nuevas calificaciones de asistencia
   * - Crear nuevos estados de asistencia
   * - Registrar nuevas vacaciones
   * - Adicionar nuevas secciones
   * Restricciones:
   * - Solo administradores pueden crear
   * - Se valida que no existan duplicados
   * - Se registra quién creó la configuración
   * Scopes: ALL (solo administradores)
   */
  CREATE: {
    module: 'attendance-config',
    action: 'create',
    description: 'Crear nueva configuración de asistencia',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * MODIFY - Modificar configuración existente
   * 
   * Permite: Editar configuraciones existentes
   * Incluye:
   * - Cambiar propiedades de calificaciones
   * - Actualizar estados de asistencia
   * - Modificar fechas de vacaciones
   * - Editar información de secciones
   * Restricciones:
   * - Solo administradores pueden modificar
   * - Se valida que los cambios no rompan la integridad
   * - Se registra el historial de cambios
   * - Auditoría de quién realizó la modificación
   * Scopes: ALL (solo administradores)
   */
  MODIFY: {
    module: 'attendance-config',
    action: 'modify',
    description: 'Modificar configuración de asistencia',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * DELETE - Eliminar configuración
   * 
   * Permite: Eliminar configuraciones del sistema
   * Incluye:
   * - Eliminar calificaciones de asistencia
   * - Remover estados de asistencia
   * - Borrar registros de vacaciones
   * - Eliminar secciones
   * Restricciones:
   * - Solo administradores pueden eliminar
   * - No se puede eliminar configuración en uso
   * - Se crea registro de auditoría de eliminación
   * - Soft delete (no se recupera)
   * Scopes: ALL (solo administradores)
   */
  DELETE: {
    module: 'attendance-config',
    action: 'delete',
    description: 'Eliminar configuración de asistencia',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * RESTORE - Restaurar configuración
   * 
   * Permite: Restaurar configuraciones eliminadas
   * Incluye:
   * - Restaurar calificaciones de asistencia eliminadas
   * - Recuperar estados de asistencia eliminados
   * - Restaurar registros de vacaciones borrados
   * - Recuperar secciones eliminadas
   * Restricciones:
   * - Solo administradores pueden restaurar
   * - Se requiere que exista un registro eliminado
   * - Se crea registro de auditoría de restauración
   * - Se valida integridad de datos al restaurar
   * Scopes: ALL (solo administradores)
   */
  RESTORE: {
    module: 'attendance-config',
    action: 'restore',
    description: 'Restaurar configuración de asistencia eliminada',
    allowedScopes: ['all'],
  } as PermissionConfig,
} as const;

export default ATTENDANCE_CONFIG_PERMISSIONS;
