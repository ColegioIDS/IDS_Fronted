/**
 * ====================================================================
 * ENROLLMENT PERMISSIONS - Permisos para el módulo de Matrículas
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/enrollment/enrollment.permissions.ts
 * 
 * Define los permisos CRUD y específicos para gestionar matrículas 
 * (asignaciones de estudiantes a grados y secciones) dentro del 
 * sistema académico.
 * 
 * VALIDACIONES IMPORTANTES:
 * - Un estudiante debe existir antes de matricularse
 * - Un estudiante solo puede estar matriculado una vez por ciclo
 * - No se puede cambiar grado sin autorización específica
 * - Las transferencias requieren validación del nuevo ciclo
 * - Las matrículas eliminadas crean un registro de auditoría
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo Enrollment (Matrículas)
 */
export const ENROLLMENT_PERMISSIONS = {
  /**
   * READ - Listar todas las matrículas
   * 
   * Permite: Listar matrículas con filtros y paginación
   * Incluye: Búsqueda por estudiante, grado, sección, estado, ciclo
   * Restricciones: 
   * - Solo ver matrículas del ciclo actual por defecto
   * - Requiere READ para acceder al listado
   */
  READ: {
    module: 'enrollments',
    action: 'read',
    description: 'Listar todas las matrículas con filtros y paginación',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * READ_ONE - Ver detalles de una matrícula específica
   * 
   * Permite: Ver información detallada de una matrícula
   * Incluye: Historial de cambios, estado actual, detalles del estudiante
   */
  READ_ONE: {
    module: 'enrollments',
    action: 'read-one',
    description: 'Ver detalles completos de una matrícula específica',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * CREATE - Crear nueva matrícula
   * 
   * Permite: Matricular estudiante en un grado y sección
   * Restricciones:
   * - Estudiante debe existir
   * - No puede haber matrícula duplicada en mismo ciclo
   * - Debe especificar grado y sección válidos
   * - Solo para ciclo académico activo
   */
  CREATE: {
    module: 'enrollments',
    action: 'create',
    description: 'Crear nueva matrícula de estudiante',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * UPDATE_STATUS - Cambiar estado de la matrícula
   * 
   * Permite: Cambiar estado (active, suspended, inactive)
   * Incluye: Activar, suspender, inactivar matrículas
   * Restricciones:
   * - No cambiar estado de matrícula del ciclo anterior
   * - Requiere justificación para suspender
   */
  UPDATE_STATUS: {
    module: 'enrollments',
    action: 'update-status',
    description: 'Cambiar estado de matrícula (active, suspended, inactive)',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * UPDATE_PLACEMENT - Cambiar grado y/o sección
   * 
   * Permite: Reubicar estudiante en otro grado/sección
   * Restricciones:
   * - Ambos grado y sección deben existir
   * - No puede crear conflicto de capacidad
   * - Requiere justificación en el sistema
   * - Registra cambio en auditoría
   */
  UPDATE_PLACEMENT: {
    module: 'enrollments',
    action: 'update-placement',
    description: 'Cambiar grado y/o sección de matrícula',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * TRANSFER - Transferir a nuevo ciclo académico
   * 
   * Permite: Transferir estudiante al siguiente ciclo
   * Restricciones:
   * - Solo disponible en periodos de transferencia
   * - Nuevo ciclo debe estar habilitado
   * - Mantiene historial de ciclos anteriores
   * - Puede cambiar grado en la transferencia
   */
  TRANSFER: {
    module: 'enrollments',
    action: 'transfer',
    description: 'Transferir estudiante a nuevo ciclo académico',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * DELETE - Eliminar matrícula del sistema
   * 
   * Permite: Eliminar registro de matrícula
   * Restricciones:
   * - No se puede eliminar matrícula con calificaciones
   * - Requiere confirmación doble
   * - Crea registro de auditoría de eliminación
   * - Se recomienda usar inactivate en lugar de delete
   */
  DELETE: {
    module: 'enrollments',
    action: 'delete',
    description: 'Eliminar matrícula del sistema',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * VIEW_STATISTICS - Ver estadísticas de matrículas
   * 
   * Permite: Visualizar estadísticas y reportes
   * Incluye: 
   * - Matrículas por ciclo, grado, sección
   * - Estadísticas de estado (activa, suspendida, inactiva)
   * - Tendencias históricas
   * - Análisis por periodo
   */
  VIEW_STATISTICS: {
    module: 'enrollments',
    action: 'view-statistics',
    description: 'Ver estadísticas de matrículas por ciclo, grado, estado',
    allowedScopes: ['all'],
  } as PermissionConfig,

  /**
   * EXPORT - Exportar listado de matrículas
   * 
   * Permite: Descargar datos en Excel o PDF
   * Incluye: 
   * - Listado completo con filtros
   * - Formatos: Excel (.xlsx), PDF
   * - Puede incluir datos sensibles
   * - Se registra en auditoría
   */
  EXPORT: {
    module: 'enrollments',
    action: 'export',
    description: 'Exportar listado de matrículas en Excel o PDF',
    allowedScopes: ['all'],
  } as PermissionConfig,
} as const;

export default ENROLLMENT_PERMISSIONS;
