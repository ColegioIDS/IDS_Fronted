/**
 * ====================================================================
 * ATTENDANCE PERMISSIONS - Permisos para el módulo de Asistencia
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/attendance/attendance.permissions.ts
 * 
 * Define los permisos CRUD y específicos para gestionar registros de
 * asistencia de estudiantes dentro del sistema académico.
 * 
 * VALIDACIONES IMPORTANTES:
 * - La asistencia debe ser registrada por el coordinador o docente
 * - No se puede registrar asistencia en fechas futuras
 * - Los registros se pueden agrupar por sección y fecha
 * - Las estadísticas requieren permiso específico
 * - La configuración es compartida en todo el sistema
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo Attendance (Asistencia)
 */
export const ATTENDANCE_PERMISSIONS = {
  /**
   * READ - Listar registros de asistencia
   * 
   * Permite: Listar registros con filtros y paginación
   * Incluye: Búsqueda por estudiante, sección, fecha, estado
   * Scopes: ALL, COORDINATOR, OWN
   */
  READ: {
    module: 'attendance',
    action: 'read',
    description: 'Listar todos los registros de asistencia con filtros',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,

  /**
   * READ_ONE - Ver detalles de un registro
   * 
   * Permite: Ver información detallada de un registro específico
   * Incluye: Historial de cambios, notas, detalles del estudiante
   * Scopes: ALL, COORDINATOR, OWN
   */
  READ_ONE: {
    module: 'attendance',
    action: 'read-one',
    description: 'Ver detalles de un registro de asistencia específico',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,

  /**
   * READ_CONFIG - Acceder a configuración
   * 
   * Permite: Acceder a datos de configuración del sistema
   * Incluye: 
   * - Calificaciones de asistencia
   * - Secciones disponibles
   * - Estudiantes matriculados
   * - Fechas de vacaciones
   * - Estados de asistencia
   * Scopes: ALL (solo administradores)
   */
  READ_CONFIG: {
    module: 'attendance',
    action: 'read-config',
    description: 'Acceder a configuración de asistencia (calificaciones, secciones, estudiantes, vacaciones, estados)',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ_STATS - Ver estadísticas de asistencia
   * 
   * Permite: Visualizar estadísticas y reportes de asistencia
   * Incluye: 
   * - Porcentaje de asistencia por estudiante
   * - Tendencias por período
   * - Reportes por sección
   * - Análisis de inasistencias
   * Scopes: ALL, COORDINATOR, OWN
   */
  READ_STATS: {
    module: 'attendance',
    action: 'read-stats',
    description: 'Ver estadísticas de asistencia de un estudiante',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,

  /**
   * CREATE - Crear registro individual
   * 
   * Permite: Crear un nuevo registro de asistencia
   * Restricciones:
   * - Estudiante debe estar matriculado
   * - Fecha debe ser válida (no futura)
   * - Solo un registro por estudiante por día
   * Scopes: ALL, COORDINATOR, OWN
   */
  CREATE: {
    module: 'attendance',
    action: 'create',
    description: 'Crear un nuevo registro de asistencia individual',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,

  /**
   * CREATE_BULK - Crear múltiples registros en lote
   * 
   * Permite: Crear varios registros de asistencia simultáneamente
   * Includes: 
   * - Carga masiva para una sección
   * - Importación desde Excel
   * - Registro grupal por fecha
   * Restricciones:
   * - Máximo 500 registros por lote
   * - Se valida cada registro individualmente
   * Scopes: ALL, COORDINATOR, OWN
   */
  CREATE_BULK: {
    module: 'attendance',
    action: 'create-bulk',
    description: 'Crear múltiples registros de asistencia en lote',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,

  /**
   * UPDATE - Actualizar registro
   * 
   * Permite: Modificar un registro de asistencia existente
   * Puede cambiar: Estado, notas, observaciones
   * Restricciones:
   * - No se puede cambiar el estudiante o fecha
   * - Se registra el historial de cambios
   * - Auditoría de quién realizó el cambio
   * Scopes: ALL, COORDINATOR, OWN
   */
  UPDATE: {
    module: 'attendance',
    action: 'update',
    description: 'Actualizar información de un registro de asistencia',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,

  /**
   * DELETE - Eliminar registro
   * 
   * Permite: Eliminar un registro de asistencia
   * Restricciones:
   * - Se crea registro de auditoría de eliminación
   * - No se puede recuperar (soft delete en BD)
   * - Solo administradores pueden eliminar
   * Scopes: ALL (solo administradores)
   */
  DELETE: {
    module: 'attendance',
    action: 'delete',
    description: 'Eliminar un registro de asistencia',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * VALIDATE - Validar datos de asistencia
   * 
   * Permite: Validar y procesar datos de asistencia
   * Incluye:
   * - Verificar integridad de datos
   * - Validar contra reglas del sistema
   * - Generar reportes de validación
   * - Identificar inconsistencias
   * Scopes: ALL (solo administradores)
   */
  VALIDATE: {
    module: 'attendance',
    action: 'validate',
    description: 'Validar datos de asistencia antes de procesar',
    allowedScopes: ['all'],
  } as PermissionConfig,
} as const;

export default ATTENDANCE_PERMISSIONS;
