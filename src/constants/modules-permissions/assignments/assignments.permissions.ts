// src/constants/modules-permissions/assignments/assignments.permissions.ts

/**
 * Permisos del módulo ASSIGNMENT (Tareas)
 * Gestiona operaciones sobre tareas (Assignment table):
 * - Creación de tareas por docentes
 * - Actualización de tareas
 * - Eliminación de tareas
 * - Lectura de tareas
 */
export const ASSIGNMENTS_PERMISSIONS = {
  READ: {
    module: 'assignment',
    action: 'read',
    description: 'Listar tareas con filtros (por curso, bimestre, estado, etc)',
  },

  READ_CASCADE: {
    module: 'assignment',
    action: 'read-cascade',
    description: 'Obtener datos en cascada (ciclo, bimestres, semanas, grados, secciones, cursos)',
  },

  CREATE: {
    module: 'assignment',
    action: 'create',
    description: 'Crear nuevas tareas en cursos asignados',
  },

  UPDATE: {
    module: 'assignment',
    action: 'update',
    description: 'Actualizar tareas existentes (título, descripción, fecha, etc)',
  },

  DELETE: {
    module: 'assignment',
    action: 'delete',
    description: 'Eliminar tareas',
  },
};

/**
 * Permisos del módulo SUBMISSION (Entregas/Calificaciones)
 * Gestiona operaciones sobre entregas de tareas (AssignmentSubmission table):
 * - Ver entregas de estudiantes
 * - Calificar entregas
 * - Envío de entregas por estudiantes
 */
export const SUBMISSIONS_PERMISSIONS = {
  READ: {
    module: 'submission',
    action: 'read',
    description: 'Ver entregas de estudiantes y sus calificaciones',
  },

  CREATE: {
    module: 'submission',
    action: 'create',
    description: 'Estudiantes envían/crean entregas de tareas',
  },

  GRADE: {
    module: 'submission',
    action: 'grade',
    description: 'Calificar entregas de estudiantes (individual o lote)',
  },

  DELETE: {
    module: 'submission',
    action: 'delete',
    description: 'Eliminar entregas',
  },
};
