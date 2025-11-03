// src/hooks/useStudentScope.ts
'use client';

import { useAuth } from '@/context/AuthContext';

export type StudentScope = 'ALL' | 'GRADE' | 'SECTION';

interface StudentScopeFilter {
  scope: StudentScope;
  gradeId?: number;
  sectionId?: number;
}

/**
 * Hook para determinar el scope de acceso del usuario a estudiantes
 * basado en su rol y permisos
 * 
 * Scope levels:
 * - ALL: Admin, Director, Coordinador General (ver todos los estudiantes)
 * - GRADE: Coordinador de Grado (ver estudiantes del grado asignado)
 * - SECTION: Maestro, Docente (ver estudiantes de la sección asignada)
 * 
 * @returns {StudentScopeFilter} Filtro de scope con nivel y IDs asociados
 */
export const useStudentScope = (): StudentScopeFilter => {
  const { user, role } = useAuth();

  if (!user) {
    return { scope: 'SECTION' }; // Default restrictivo
  }

  const roleName = role?.name?.toLowerCase() || '';

  // Admin y Director ven todos los estudiantes
  if (['admin', 'director', 'administrador'].includes(roleName)) {
    return { scope: 'ALL' };
  }

  // Coordinador General ve todos
  if (['coordinador', 'coordinador_general', 'coordinador general'].includes(roleName)) {
    return { scope: 'ALL' };
  }

  // Coordinador de Grado ve por grado
  // Nota: La asignación de grado debe venir del backend en user metadata o role
  if (
    ['coordinador_grado', 'coordinador grado', 'grade_coordinator'].includes(roleName)
  ) {
    return {
      scope: 'GRADE',
      // gradeId would come from user metadata or server session
    };
  }

  // Docente/Maestro ve por sección
  if (
    ['maestro', 'docente', 'teacher', 'profesor'].includes(roleName)
  ) {
    return {
      scope: 'SECTION',
      // sectionId would come from user metadata or server session
    };
  }

  // Default: scope restrictivo
  return { scope: 'SECTION' };
};

/**
 * Hook para filtrar estudiantes según el scope del usuario
 */
export const useFilterStudentsByScope = () => {
  const scope = useStudentScope();

  return {
    scope,
    shouldShowAllStudents: scope.scope === 'ALL',
    shouldFilterByGrade: scope.scope === 'GRADE',
    shouldFilterBySection: scope.scope === 'SECTION',
    gradeId: scope.gradeId,
    sectionId: scope.sectionId,
  };
};
