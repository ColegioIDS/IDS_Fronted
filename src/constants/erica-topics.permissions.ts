// src/constants/erica-topics.permissions.ts

/**
 * Constantes de permisos para el módulo ERICA Topics
 * 
 * Si el nombre del módulo cambia en el backend, solo hay que actualizarlo aquí.
 */

export const ERICA_TOPICS_MODULE = 'erica-topic' as const;

export const ERICA_TOPICS_ACTIONS = {
  // Lectura
  READ: 'read',
  READ_ONE: 'read-one',
  READ_PENDING: 'read-pending',
  READ_PLANNING: 'read-planning',
  READ_STATS: 'read-stats',
  
  // Creación
  CREATE: 'create',
  CREATE_BULK: 'create-bulk',
  DUPLICATE: 'duplicate',
  
  // Actualización
  UPDATE: 'update',
  MARK_COMPLETE: 'mark-complete',
  
  // Eliminación
  DELETE: 'delete',
} as const;

/**
 * Objeto de permisos completos para uso directo
 * 
 * @example
 * <ProtectedContent {...ERICA_TOPICS_PERMISSIONS.CREATE}>
 *   <Button>Nuevo Tema</Button>
 * </ProtectedContent>
 */
export const ERICA_TOPICS_PERMISSIONS = {
  READ: { module: ERICA_TOPICS_MODULE, action: ERICA_TOPICS_ACTIONS.READ },
  READ_ONE: { module: ERICA_TOPICS_MODULE, action: ERICA_TOPICS_ACTIONS.READ_ONE },
  READ_PENDING: { module: ERICA_TOPICS_MODULE, action: ERICA_TOPICS_ACTIONS.READ_PENDING },
  READ_PLANNING: { module: ERICA_TOPICS_MODULE, action: ERICA_TOPICS_ACTIONS.READ_PLANNING },
  READ_STATS: { module: ERICA_TOPICS_MODULE, action: ERICA_TOPICS_ACTIONS.READ_STATS },
  CREATE: { module: ERICA_TOPICS_MODULE, action: ERICA_TOPICS_ACTIONS.CREATE },
  CREATE_BULK: { module: ERICA_TOPICS_MODULE, action: ERICA_TOPICS_ACTIONS.CREATE_BULK },
  DUPLICATE: { module: ERICA_TOPICS_MODULE, action: ERICA_TOPICS_ACTIONS.DUPLICATE },
  UPDATE: { module: ERICA_TOPICS_MODULE, action: ERICA_TOPICS_ACTIONS.UPDATE },
  MARK_COMPLETE: { module: ERICA_TOPICS_MODULE, action: ERICA_TOPICS_ACTIONS.MARK_COMPLETE },
  DELETE: { module: ERICA_TOPICS_MODULE, action: ERICA_TOPICS_ACTIONS.DELETE },
} as const;

// Tipos para TypeScript
export type EricaTopicsAction = typeof ERICA_TOPICS_ACTIONS[keyof typeof ERICA_TOPICS_ACTIONS];
export type EricaTopicsPermission = typeof ERICA_TOPICS_PERMISSIONS[keyof typeof ERICA_TOPICS_PERMISSIONS];
