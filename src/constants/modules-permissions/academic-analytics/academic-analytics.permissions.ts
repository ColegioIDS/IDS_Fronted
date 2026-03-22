/**
 * ====================================================================
 * ACADEMIC ANALYTICS PERMISSIONS - Permisos para Analítica Académica
 * ====================================================================
 *
 * Archivo: src/constants/modules-permissions/academic-analytics/academic-analytics.permissions.ts
 *
 * Define los permisos para acceder a reportes y análisis académicos
 * de estudiantes. Los usuarios pueden ver análisis globales o solo
 * datos propios según su rol y permiso.
 *
 * VALIDACIONES IMPORTANTES:
 * - read: Acceso a todos los análisis académicos
 * - read-own: Acceso solo a datos propios (estudiantes/apoderados)
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo Academic Analytics (Analítica Académica)
 */
export const ACADEMIC_ANALYTICS_PERMISSIONS = {
  /**
   * READ - Ver reportes y análisis académicos
   *
   * Permite: Acceder a todos los reportes y análisis académicos
   * Acceso a:
   * - Resúmenes académicos de estudiantes
   * - Promedios acumulativos por bimestre
   * - Desempeño por componentes
   * - Tendencias académicas
   * - Cascada de datos para filtros
   *
   * Scopes permitidos: 'all', 'coordinator', 'own'
   */
  READ: {
    module: 'academic-analytics',
    action: 'read',
    description: 'Ver reportes y análisis académicos de estudiantes',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,

  /**
   * READ_OWN - Ver solo datos académicos propios
   *
   * Permite: Acceder a datos académicos propios del usuario
   * Acceso a:
   * - Su propio análisis académico (si es estudiante)
   * - Análisis académico de sus hijos (si es apoderado)
   * - Solo los datos que le pertenecen
   *
   * Scopes permitidos: 'own'
   */
  READ_OWN: {
    module: 'academic-analytics',
    action: 'read-own',
    description: 'Ver solo datos académicos propios (estudiante/apoderado)',
    allowedScopes: ['own'],
  } as PermissionConfig,
} as const;

export default ACADEMIC_ANALYTICS_PERMISSIONS;
