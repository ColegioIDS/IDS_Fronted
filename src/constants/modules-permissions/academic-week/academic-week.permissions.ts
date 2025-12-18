// src/constants/modules-permissions/academic-week/academic-week.permissions.ts

import { PermissionConfig } from '../types';

/**
 * Permisos del módulo ACADEMIC_WEEK
 * Sincronizados con: src/database/modules/academic-weeks/academic-weeks.seed.ts
 * 
 * Este módulo gestiona las semanas académicas dentro de los bimestres,
 * permitiendo crear, editar y organizar las semanas del ciclo escolar.
 */
export const ACADEMIC_WEEK_PERMISSIONS = {
  CREATE: {
    module: 'academic-week',
    action: 'create',
    description: 'Crear nuevas semanas académicas en un bimestre',
    scope: 'all',
  } as PermissionConfig,

  READ: {
    module: 'academic-week',
    action: 'read',
    description: 'Listar y consultar semanas académicas con filtros',
    scope: 'all',
  } as PermissionConfig,

  READ_ONE: {
    module: 'academic-week',
    action: 'read-one',
    description: 'Ver detalles de una semana académica específica',
    scope: 'all',
  } as PermissionConfig,

  UPDATE: {
    module: 'academic-week',
    action: 'update',
    description: 'Actualizar información de una semana académica',
    scope: 'all',
  } as PermissionConfig,

  DELETE: {
    module: 'academic-week',
    action: 'delete',
    description: 'Eliminar una semana académica del sistema',
    scope: 'all',
  } as PermissionConfig,
} as const;
