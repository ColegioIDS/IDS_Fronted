/**
 * Permisos del módulo de Bimestres
 * 
 * Los bimestres son períodos dentro de los ciclos escolares.
 * Son recursos globales que no pertenecen a un grado o sección específica.
 */

export const BIMESTER_PERMISSIONS = {
  // ========== PERMISOS BÁSICOS ==========
  CREATE: {
    module: 'bimester',
    action: 'create',
    description: 'Crear nuevos bimestres dentro de un ciclo escolar',
    scope: 'all',
  },
  READ: {
    module: 'bimester',
    action: 'read',
    description: 'Listar todos los bimestres',
    scope: 'all',
  },
  READ_ONE: {
    module: 'bimester',
    action: 'read-one',
    description: 'Ver detalles de un bimestre específico',
    scope: 'all',
  },

  // ========== PERMISOS CON DEPENDENCIAS ==========
  UPDATE: {
    module: 'bimester',
    action: 'update',
    description: 'Actualizar información de bimestres',
    scope: 'all',
  },
  DELETE: {
    module: 'bimester',
    action: 'delete',
    description: 'Eliminar bimestres',
    scope: 'all',
  },

  // ========== PERMISOS ESPECÍFICOS DEL MÓDULO ==========
  ACTIVATE: {
    module: 'bimester',
    action: 'activate',
    description: 'Activar un bimestre (marca los demás del ciclo como inactivos)',
    scope: 'all',
  },
  MANAGE_WEEKS: {
    module: 'bimester',
    action: 'manage-weeks',
    description: 'Gestionar semanas académicas del bimestre',
    scope: 'all',
  },
  MANAGE_HOLIDAYS: {
    module: 'bimester',
    action: 'manage-holidays',
    description: 'Gestionar días festivos del bimestre',
    scope: 'all',
  },
} as const;
