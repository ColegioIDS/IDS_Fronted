/**
 * ====================================================================
 * ATTENDANCE PLANT PERMISSIONS - Permisos para el módulo de Asistencia de Planta
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/attendance-plant/attendance-plant.permissions.ts
 * 
 * Define los permisos CRUD y específicos para gestionar registros de
 * asistencia de empleados/personal en la planta o instalaciones.
 * 
 * VALIDACIONES IMPORTANTES:
 * - La asistencia debe ser registrada por personal autorizado
 * - No se puede registrar asistencia en fechas futuras
 * - Los registros se pueden agrupar por usuario y fecha
 * - Las justificaciones requieren aprobación
 * - Los reportes son confidenciales por usuario
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo Attendance Plant (Asistencia de Planta)
 */
export const ATTENDANCE_PLANT_PERMISSIONS = {
  /**
   * READ - Listar registros de asistencia de planta
   * 
   * Permite: Listar registros con filtros y paginación
   * Incluye: Búsqueda por usuario, fecha, estado
   * Scopes: ALL, COORDINATOR, OWN
   */
  READ: {
    module: 'attendance-plant',
    action: 'read',
    description: 'Listar todos los registros de asistencia de planta con filtros',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,

  /**
   * READ_ONE - Ver detalles de un registro
   * 
   * Permite: Ver información detallada de un registro específico
   * Incluye: Historial, notas, información del usuario
   * Scopes: ALL, COORDINATOR, OWN
   */
  READ_ONE: {
    module: 'attendance-plant',
    action: 'read-one',
    description: 'Ver detalles de un registro de asistencia de planta específico',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,

  /**
   * CREATE - Registrar nueva asistencia
   * 
   * Permite: Crear nuevos registros de asistencia
   * Incluye: Registros para diferentes usuarios
   * Scopes: ALL, COORDINATOR
   * Restricción: No se puede registrar asistencia futura
   */
  CREATE: {
    module: 'attendance-plant',
    action: 'create',
    description: 'Registrar nueva asistencia de planta',
    allowedScopes: ['all', 'coordinator'],
  } as PermissionConfig,

  /**
   * UPDATE - Modificar registros existentes
   * 
   * Permite: Actualizar información de un registro
   * Incluye: Cambio de hora, estado, notas
   * Scopes: ALL, COORDINATOR
   * Restricción: Solo registros no finalizado
   */
  UPDATE: {
    module: 'attendance-plant',
    action: 'update',
    description: 'Actualizar registros de asistencia de planta existentes',
    allowedScopes: ['all', 'coordinator'],
  } as PermissionConfig,

  /**
   * DELETE - Eliminar registros
   * 
   * Permite: Eliminar registros de asistencia
   * Incluye: Eliminación con auditoría
   * Scopes: ALL
   * Restricción: Solo por administrador
   */
  DELETE: {
    module: 'attendance-plant',
    action: 'delete',
    description: 'Eliminar registros de asistencia de planta',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * CREATE_JUSTIFICATION - Crear justificación
   * 
   * Permite: Crear justificaciones para ausencias
   * Incluye: Subida de documentos
   * Scopes: ALL, COORDINATOR, OWN
   */
  CREATE_JUSTIFICATION: {
    module: 'attendance-plant',
    action: 'create-justification',
    description: 'Crear justificaciones para ausencias',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,

  /**
   * APPROVE_JUSTIFICATION - Aprobar justificaciones
   * 
   * Permite: Aprobar o rechazar justificaciones
   * Incluye: Agregar notas de aprobación
   * Scopes: ALL, COORDINATOR
   */
  APPROVE_JUSTIFICATION: {
    module: 'attendance-plant',
    action: 'approve-justification',
    description: 'Aprobar o rechazar justificaciones de ausencia',
    allowedScopes: ['all', 'coordinator'],
  } as PermissionConfig,

  /**
   * VIEW_REPORTS - Ver reportes de asistencia
   * 
   * Permite: Acceder a reportes y estadísticas
   * Incluye: Reportes por usuario, período, estado
   * Scopes: ALL, COORDINATOR
   */
  VIEW_REPORTS: {
    module: 'attendance-plant',
    action: 'view-reports',
    description: 'Ver reportes y estadísticas de asistencia de planta',
    allowedScopes: ['all', 'coordinator'],
  } as PermissionConfig,

  /**
   * EXPORT_DATA - Exportar datos de asistencia
   * 
   * Permite: Exportar datos a formatos (CSV, Excel, PDF)
   * Incluye: Exportación de reportes
   * Scopes: ALL, COORDINATOR
   */
  EXPORT_DATA: {
    module: 'attendance-plant',
    action: 'export-data',
    description: 'Exportar datos de asistencia de planta a diferentes formatos',
    allowedScopes: ['all', 'coordinator'],
  } as PermissionConfig,

  /**
   * CONFIGURE - Configurar el módulo
   * 
   * Permite: Configurar parámetros del módulo
   * Incluye: Horarios, políticas, roles
   * Scopes: ALL
   * Restricción: Solo administrador
   */
  CONFIGURE: {
    module: 'attendance-plant',
    action: 'configure',
    description: 'Configurar parámetros del módulo de asistencia de planta',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * VIEW_AUDIT - Ver auditoría de cambios
   * 
   * Permite: Ver historial de cambios
   * Incluye: Quién, cuándo, qué cambió
   * Scopes: ALL
   * Restricción: Solo administrador
   */
  VIEW_AUDIT: {
    module: 'attendance-plant',
    action: 'view-audit',
    description: 'Ver auditoría y historial de cambios',
    allowedScopes: ['all'],
  } as PermissionConfig,
};
