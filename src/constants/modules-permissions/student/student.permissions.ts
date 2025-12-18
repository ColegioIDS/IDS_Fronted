/**
 * Permisos del módulo Student
 * Gestiona la lectura, creación, actualización y eliminación de estudiantes
 * 
 * Scopes soportados:
 * - ALL: Administradores ven/gestionan todos los estudiantes
 * - COORDINATOR: Coordinadores ven/gestionan estudiantes de sus grados
 * - OWN: Maestros ven estudiantes de sus cursos
 */

import { PermissionConfig } from '../types';

export const STUDENT_PERMISSIONS = {
  CREATE: {
    module: 'student',
    action: 'create',
    description: 'Crear nuevos estudiantes',
    allowedScopes: ['all'],
  } as PermissionConfig,
  READ: {
    module: 'student',
    action: 'read',
    description: 'Listar estudiantes',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,
  READ_ONE: {
    module: 'student',
    action: 'read-one',
    description: 'Ver detalles completos de un estudiante',
    allowedScopes: ['all', 'coordinator', 'own'],
  } as PermissionConfig,
  UPDATE: {
    module: 'student',
    action: 'update',
    description: 'Actualizar información de estudiantes',
    allowedScopes: ['all', 'coordinator'],
  } as PermissionConfig,
  DELETE: {
    module: 'student',
    action: 'delete',
    description: 'Eliminar estudiantes de forma definitiva (verifica matrículas)',
    allowedScopes: ['all'],
  } as PermissionConfig,
  UPLOAD_PICTURE: {
    module: 'student',
    action: 'upload-picture',
    description: 'Subir fotos de estudiantes',
    allowedScopes: ['all', 'coordinator'],
  } as PermissionConfig,
  DELETE_PICTURE: {
    module: 'student',
    action: 'delete-picture',
    description: 'Eliminar fotos de estudiantes',
    allowedScopes: ['all', 'coordinator'],
  } as PermissionConfig,
  GENERATE_REPORT: {
    module: 'student',
    action: 'generate-report',
    description: 'Generar reportes de estudiantes (estado académico, asistencia, etc)',
    allowedScopes: ['all', 'coordinator'],
  } as PermissionConfig,
  EXPORT: {
    module: 'student',
    action: 'export',
    description: 'Exportar datos de estudiantes',
    allowedScopes: ['all', 'coordinator'],
  } as PermissionConfig,
} as const;
