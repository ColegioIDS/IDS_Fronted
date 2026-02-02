/**
 * ====================================================================
 * ERICA HISTORY PERMISSIONS - Permisos para el módulo Historial ERICA
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/erica-history/erica-history.permissions.ts
 * 
 * Define los permisos para consultar y analizar el historial de 
 * evaluaciones ERICA según las 5 dimensiones:
 * - EJECUTA: Capacidad de aplicar conocimientos en práctica
 * - RETIENE: Retención de información y conceptos
 * - INTERPRETA: Interpretación y análisis crítico
 * - CONOCE: Comprensión de conceptos fundamentales
 * - APLICA: Ampliación y extensión de aprendizaje
 * 
 * SCOPES PERMITIDOS:
 * - ALL: Administradores/Directores pueden ver todo el historial
 * - COORDINATOR: Coordinadores pueden ver historial de sus grados
 * - OWN: Maestros pueden ver historial de sus cursos
 */

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo ERICA History (Historial de Evaluaciones ERICA)
 */
export const ERICA_HISTORY_PERMISSIONS = {
  /**
   * READ - Listar historial de evaluaciones ERICA
   * 
   * Permite: Acceder al historial de evaluaciones ERICA con múltiples filtros
   * Incluye: 
   * - Filtrado por bimestre, semana académica, grado, sección, curso
   * - Visualización de evaluaciones por dimensión ERICA
   * - Análisis de desempeño por estudiante
   * - Estadísticas de evaluaciones (promedios, distribución de calificaciones)
   * - Vista completa de bimestre con todas las semanas
   * 
   * Restricciones por scope:
   * - ALL: Ver historial de cualquier curso/grado/sección
   * - COORDINATOR: Ver historial de grados bajo su coordinación
   * - OWN: Ver historial de sus cursos asignados
   */
  READ: {
    module: 'erica-history',
    action: 'read',
    description: 'Listar historial de evaluaciones ERICA con filtros (por curso, estudiante, bimestre, etc)',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,
} as const;

export default ERICA_HISTORY_PERMISSIONS;
