// src/constants/erica-evaluations.permissions.ts

/**
 * Constantes de permisos para el módulo ERICA Evaluations
 * 
 * Si el nombre del módulo cambia en el backend, solo hay que actualizarlo aquí.
 */

export const ERICA_EVALUATIONS_MODULE = 'erica-evaluation' as const;

export const ERICA_EVALUATIONS_ACTIONS = {
  // Lectura
  READ: 'read',
  READ_ONE: 'read-one',
  READ_CASCADE: 'read-cascade',
  READ_GRID: 'read-grid',
  READ_STATS: 'read-stats',
  READ_BY_ENROLLMENT: 'read-by-enrollment',
  READ_BY_SECTION: 'read-by-section',
  
  // Creación
  CREATE: 'create',
  CREATE_BULK: 'create-bulk',
  SAVE_GRID: 'save-grid',
  
  // Actualización
  UPDATE: 'update',
  
  // Eliminación
  DELETE: 'delete',
} as const;

/**
 * Objeto de permisos completos para uso directo
 * 
 * @example
 * <ProtectedContent {...ERICA_EVALUATIONS_PERMISSIONS.CREATE}>
 *   <Button>Nueva Evaluación</Button>
 * </ProtectedContent>
 */
export const ERICA_EVALUATIONS_PERMISSIONS = {
  // Lectura
  READ: { module: ERICA_EVALUATIONS_MODULE, action: ERICA_EVALUATIONS_ACTIONS.READ },
  READ_ONE: { module: ERICA_EVALUATIONS_MODULE, action: ERICA_EVALUATIONS_ACTIONS.READ_ONE },
  READ_CASCADE: { module: ERICA_EVALUATIONS_MODULE, action: ERICA_EVALUATIONS_ACTIONS.READ_CASCADE },
  READ_GRID: { module: ERICA_EVALUATIONS_MODULE, action: ERICA_EVALUATIONS_ACTIONS.READ_GRID },
  READ_STATS: { module: ERICA_EVALUATIONS_MODULE, action: ERICA_EVALUATIONS_ACTIONS.READ_STATS },
  READ_BY_ENROLLMENT: { module: ERICA_EVALUATIONS_MODULE, action: ERICA_EVALUATIONS_ACTIONS.READ_BY_ENROLLMENT },
  READ_BY_SECTION: { module: ERICA_EVALUATIONS_MODULE, action: ERICA_EVALUATIONS_ACTIONS.READ_BY_SECTION },
  
  // Creación
  CREATE: { module: ERICA_EVALUATIONS_MODULE, action: ERICA_EVALUATIONS_ACTIONS.CREATE },
  CREATE_BULK: { module: ERICA_EVALUATIONS_MODULE, action: ERICA_EVALUATIONS_ACTIONS.CREATE_BULK },
  SAVE_GRID: { module: ERICA_EVALUATIONS_MODULE, action: ERICA_EVALUATIONS_ACTIONS.SAVE_GRID },
  
  // Actualización
  UPDATE: { module: ERICA_EVALUATIONS_MODULE, action: ERICA_EVALUATIONS_ACTIONS.UPDATE },
  
  // Eliminación
  DELETE: { module: ERICA_EVALUATIONS_MODULE, action: ERICA_EVALUATIONS_ACTIONS.DELETE },
} as const;

/**
 * Helper para verificar si un usuario puede evaluar
 * (tiene al menos permiso de crear evaluaciones)
 */
export const canEvaluate = (permissions: Set<string>): boolean => {
  const fullPermission = `${ERICA_EVALUATIONS_MODULE}:${ERICA_EVALUATIONS_ACTIONS.CREATE}`;
  const gridPermission = `${ERICA_EVALUATIONS_MODULE}:${ERICA_EVALUATIONS_ACTIONS.SAVE_GRID}`;
  return permissions.has(fullPermission) || permissions.has(gridPermission);
};

/**
 * Helper para verificar si un usuario puede ver evaluaciones
 */
export const canViewEvaluations = (permissions: Set<string>): boolean => {
  const fullPermission = `${ERICA_EVALUATIONS_MODULE}:${ERICA_EVALUATIONS_ACTIONS.READ}`;
  const gridPermission = `${ERICA_EVALUATIONS_MODULE}:${ERICA_EVALUATIONS_ACTIONS.READ_GRID}`;
  return permissions.has(fullPermission) || permissions.has(gridPermission);
};

export type EricaEvaluationsAction = typeof ERICA_EVALUATIONS_ACTIONS[keyof typeof ERICA_EVALUATIONS_ACTIONS];
