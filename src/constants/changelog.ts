/**
 * 📝 CHANGELOG - Historial de Versiones
 * Sistema de versionamiento para el seguimiento de cambios
 */

export interface ChangelogEntry {
  version: string;
  date: string;
  status: 'stable' | 'beta' | 'alpha';
  features: string[];
  fixes: string[];
  improvements: string[];
  breakingChanges?: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '01 de Febrero, 2026',
    status: 'stable',
    features: [
      'Sistema de Log de Lectura para notificaciones - ver quién leyó cada notificación',
      'Nuevo permiso: notification:read-log - controlar acceso al log de lectura',
      'Indicadores visuales en navbar - puntos respirantes en iconos de news y notificaciones',
      'Validación de permisos en botones del sidebar - botones de preferencias y log solo si tienes permisos',
    ],
    fixes: [
      'Corregido resumen de notificaciones - ahora cuenta correctamente sent/archived/starred',
      'Arreglado error de ruta en endpoint GET :id/read-log - conflicto con ruta genérica :id',
      'Solucionado error de tipos en PermissionFilters - type casting en sortBy/sortOrder',
      'Corregido optional chaining en DeleteRoleDialog - _count?.users puede ser undefined',
    ],
    improvements: [
      'Integración de NotificationInteraction para rastrear lecturas de notificaciones',
      'Mejor gestión de rutas en NestJS - rutas más específicas antes que genéricas',
      'Animación de respiración personalizada para indicadores de estado',
      'Sistema de permisos más granular para módulo de notificaciones',
    ],
  },
  {
    version: '1.0.9',
    date: '31 de Enero, 2026',
    status: 'stable',
    features: [
      'Restauración del módulo de Preferencias de Notificaciones',
      'Navegación mejorada en sidebar de notificaciones',
    ],
    fixes: [
      'Corrección en validación de notificaciones archivadas',
      'Ajuste en contadores de categorías de notificaciones',
    ],
    improvements: [
      'Mejor experiencia de usuario en notificaciones',
      'Interfaz más intuitiva para gestionar preferencias',
    ],
  },
  {
    version: '1.0.8',
    date: '30 de Enero, 2026',
    status: 'stable',
    features: [
      'Sistema completo de notificaciones con WebSocket',
      'Gestor de permisos granulares',
      'Dashboard completo con estadísticas',
    ],
    fixes: [
      'Correcciones en sincronización de datos en tiempo real',
      'Ajustes en validación de permisos',
    ],
    improvements: [
      'Performance mejorado en carga de datos',
      'Mejor manejo de errores',
    ],
  },
];

export const getCurrentVersion = (): ChangelogEntry => {
  return CHANGELOG[0];
};

export const getVersionHistory = (): ChangelogEntry[] => {
  return CHANGELOG;
};
