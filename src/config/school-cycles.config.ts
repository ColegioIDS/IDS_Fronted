// src/config/school-cycles.config.ts

/**
 * Configuración centralizada para ciclos escolares
 * Útil para constantes, rutas y configuraciones reutilizables
 */

export const SCHOOL_CYCLES_CONFIG = {
  routes: {
    list: '/admin/management/school-cycles',
    create: '/admin/management/school-cycles/new',
  },

  permissions: {
    read: 'school-cycle:read',
    create: 'school-cycle:create',
    update: 'school-cycle:update',
    delete: 'school-cycle:delete',
    activate: 'school-cycle:activate',
    close: 'school-cycle:close',
  },

  api: {
    baseUrl: '/api/school-cycles',
    endpoints: {
      list: '/api/school-cycles',
      active: '/api/school-cycles/active',
      detail: (id: number) => `/api/school-cycles/${id}`,
      stats: (id: number) => `/api/school-cycles/${id}/stats`,
      create: '/api/school-cycles',
      update: (id: number) => `/api/school-cycles/${id}`,
      activate: (id: number) => `/api/school-cycles/${id}/activate`,
      close: (id: number) => `/api/school-cycles/${id}/close`,
      delete: (id: number) => `/api/school-cycles/${id}`,
    },
  },

  validation: {
    minDurationDays: 180,
    maxDurationDays: 400,
    minNameLength: 3,
    maxNameLength: 100,
    defaultPageLimit: 10,
    maxPageLimit: 100,
  },

  messages: {
    create: {
      success: 'Ciclo escolar creado exitosamente',
      error: 'Error al crear el ciclo escolar',
    },
    update: {
      success: 'Ciclo escolar actualizado exitosamente',
      error: 'Error al actualizar el ciclo escolar',
    },
    delete: {
      success: 'Ciclo escolar eliminado exitosamente',
      error: 'Error al eliminar el ciclo escolar',
    },
    activate: {
      success: 'Ciclo escolar activado exitosamente',
      error: 'Error al activar el ciclo escolar',
    },
    close: {
      success: 'Ciclo escolar cerrado exitosamente',
      error: 'Error al cerrar el ciclo escolar',
    },
  },

  status: {
    active: {
      label: 'Activo',
      color: 'green',
      icon: 'Zap',
    },
    inactive: {
      label: 'Inactivo',
      color: 'gray',
      icon: 'Circle',
    },
    closed: {
      label: 'Cerrado',
      color: 'gray',
      icon: 'Lock',
    },
  },
};