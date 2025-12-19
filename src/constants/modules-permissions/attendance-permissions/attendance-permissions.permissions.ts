/**
 * ATTENDANCE PERMISSIONS PERMISOS
 * 
 * Define los 4 permisos para gestionar la matriz de permisos de asistencia:
 * - VIEW: Ver todos los permisos de asistencia y matriz de permisos
 * - CREATE: Crear nuevos permisos de asistencia para roles y estados
 * - MODIFY: Actualizar permisos de asistencia existentes
 * - DELETE: Eliminar permisos de asistencia
 */

export const ATTENDANCE_PERMISSIONS_PERMISSIONS = {
  /**
   * Ver todos los permisos de asistencia y matriz de permisos
   * 
   * Permite:
   * - Ver la lista completa de permisos de asistencia
   * - Ver la matriz de permisos por roles y estados
   * - Acceder al módulo de configuración de permisos
   */
  VIEW: { module: 'attendance-permissions', action: 'view' },

  /**
   * Crear nuevos permisos de asistencia para roles y estados
   * 
   * Permite:
   * - Crear nuevos permisos de asistencia
   * - Asignar permisos a roles
   * - Definir restricciones en estados de asistencia
   */
  CREATE: { module: 'attendance-permissions', action: 'create' },

  /**
   * Actualizar permisos de asistencia existentes
   * 
   * Permite:
   * - Modificar permisos de asistencia existentes
   * - Cambiar asignaciones de roles
   * - Actualizar restricciones en estados
   */
  MODIFY: { module: 'attendance-permissions', action: 'modify' },

  /**
   * Eliminar permisos de asistencia
   * 
   * Permite:
   * - Eliminar permisos de asistencia
   * - Remover asignaciones de roles
   * - Limpiar permisos obsoletos
   */
  DELETE: { module: 'attendance-permissions', action: 'delete' },
} as const;
