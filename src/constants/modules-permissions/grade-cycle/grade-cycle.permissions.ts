/**
 * Permisos del módulo Grade-Cycle
 * Gestiona las relaciones entre grados y ciclos escolares
 */

export const GRADE_CYCLE_PERMISSIONS = {
  CREATE: {
    module: 'grade-cycle',
    action: 'create',
  },
  READ: {
    module: 'grade-cycle',
    action: 'read',
  },
  READ_ONE: {
    module: 'grade-cycle',
    action: 'read-one',
  },
  UPDATE: {
    module: 'grade-cycle',
    action: 'update',
  },
  DELETE: {
    module: 'grade-cycle',
    action: 'delete',
  },
} as const;
