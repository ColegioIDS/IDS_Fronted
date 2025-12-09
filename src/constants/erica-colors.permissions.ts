// src/constants/erica-colors.permissions.ts

/**
 * Constantes de permisos para el módulo ERICA Colors
 * 
 * Si el nombre del módulo cambia en el backend, solo hay que actualizarlo aquí.
 */

export const ERICA_COLORS_MODULE = 'erica-colors' as const;

export const ERICA_COLORS_ACTIONS = {
  // Lectura
  READ: 'read',
  READ_STATES: 'read-states',
  
  // Gestión
  MANAGE: 'manage',
} as const;

/**
 * Objeto de permisos completos para uso directo
 * 
 * @example
 * <ProtectedPage {...ERICA_COLORS_PERMISSIONS.READ}>
 *   <EricaColorsPage />
 * </ProtectedPage>
 */
export const ERICA_COLORS_PERMISSIONS = {
  READ: {
    module: ERICA_COLORS_MODULE,
    action: ERICA_COLORS_ACTIONS.READ,
  },

  READ_STATES: {
    module: ERICA_COLORS_MODULE,
    action: ERICA_COLORS_ACTIONS.READ_STATES,
  },

  MANAGE: {
    module: ERICA_COLORS_MODULE,
    action: ERICA_COLORS_ACTIONS.MANAGE,
  },

  UPDATE_DIMENSIONS: {
    module: ERICA_COLORS_MODULE,
    action: ERICA_COLORS_ACTIONS.MANAGE,
  },

  UPDATE_STATES: {
    module: ERICA_COLORS_MODULE,
    action: ERICA_COLORS_ACTIONS.MANAGE,
  },
};
