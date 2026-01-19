/**
 * ====================================================================
 * NEWS MODULE - Permisos para gestión de noticias del sistema
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/news/news.permissions.ts
 * 
 * Este módulo gestiona las noticias del sistema.
 * Permite a los usuarios leer las noticias disponibles.
 * 
 * Fuente: src/database/modules/news/news.seed.ts
 */

import type { PermissionConfig } from '../types';

/**
 * Permisos del módulo: NEWS
 * 
 * Este módulo permite gestionar las noticias en el sistema.
 */
export const NEWS_PERMISSIONS = {
  /**
   * Listar todas las noticias del sistema
   * - Acción: Obtener lista de noticias disponibles
   * - Scope: all (todos los usuarios)
   * - Descripción: Listar todas las noticias en el sistema
   */
  READ: {
    module: 'news',
    action: 'read',
    description: 'Listar todas las noticias en el sistema',
    scope: 'all',
  } as PermissionConfig,
} as const;
