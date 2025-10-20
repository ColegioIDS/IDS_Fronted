// src\hooks\useGlobal.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { coursesService } from '@/services/globalService';
import {
  ActiveCycleStructure,
  StudentWithGrades,
  StudentWithAttendance,
  TeacherCourse,
  FullCycleStructure,
} from '@/types/global';

/**
 * Hook para obtener la estructura del ciclo activo con cursos
 *
 * Características:
 * • Caché automático
 * • Re-validación en background
 * • Manejo de loading/error
 * • Stale time: 5 minutos
 *
 * @returns {UseQueryResult} { data, isLoading, error, refetch, ... }
 *
 * @example
 * const { data: cycle, isLoading, error } = useGlobal.getActiveCycleStructure();
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * return <CycleView cycle={data} />;
 */
export const useGlobal = {
  /**
   * Obtiene estructura del ciclo activo
   */
  getActiveCycleStructure: (): UseQueryResult<ActiveCycleStructure, Error> => {
    return useQuery({
      queryKey: ['courses', 'active-cycle-structure'],
      queryFn: () => coursesService.getActiveCycleStructure(),
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (antes: cacheTime)
      retry: 2,
      enabled: true,
    });
  },

  /**
   * Obtiene estudiantes de una sección con calificaciones
   *
   * @param {number} sectionId - ID de la sección
   * @param {number} cycleId - ID del ciclo
   * @param {boolean} enabled - Si la query debe ejecutarse
   */
  getSectionStudents: (
    sectionId: number,
    cycleId: number,
    enabled: boolean = true
  ): UseQueryResult<StudentWithGrades[], Error> => {
    return useQuery({
      queryKey: ['courses', 'section-students', sectionId, cycleId],
      queryFn: () => coursesService.getSectionStudents(sectionId, cycleId),
      staleTime: 1000 * 60 * 3, // 3 minutos
      gcTime: 1000 * 60 * 15, // 15 minutos
      retry: 2,
      enabled: enabled && !!sectionId && !!cycleId,
    });
  },

  /**
   * Obtiene estudiantes de una sección (versión ligera)
   *
   * @param {number} sectionId - ID de la sección
   * @param {number} cycleId - ID del ciclo
   * @param {boolean} enabled - Si la query debe ejecutarse
   */
  getSectionStudentsLite: (
    sectionId: number,
    cycleId: number,
    enabled: boolean = true
  ): UseQueryResult<
    Array<{
      id: number;
      student: any;
    }>,
    Error
  > => {
    return useQuery({
      queryKey: ['courses', 'section-students-lite', sectionId, cycleId],
      queryFn: () => coursesService.getSectionStudentsLite(sectionId, cycleId),
      staleTime: 1000 * 60 * 2, // 2 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos
      retry: 2,
      enabled: enabled && !!sectionId && !!cycleId,
    });
  },

  /**
   * Obtiene estudiantes de una sección con asistencia
   *
   * @param {number} sectionId - ID de la sección
   * @param {number} bimesterId - ID del bimestre
   * @param {boolean} enabled - Si la query debe ejecutarse
   */
  getSectionStudentsWithAttendance: (
    sectionId: number,
    bimesterId: number,
    enabled: boolean = true
  ): UseQueryResult<StudentWithAttendance[], Error> => {
    return useQuery({
      queryKey: ['courses', 'section-attendance', sectionId, bimesterId],
      queryFn: () =>
        coursesService.getSectionStudentsWithAttendance(sectionId, bimesterId),
      staleTime: 1000 * 60 * 5, // 5 minutos (asistencia cambia frecuentemente)
      gcTime: 1000 * 60 * 20, // 20 minutos
      retry: 2,
      enabled: enabled && !!sectionId && !!bimesterId,
    });
  },

  /**
   * Obtiene cursos asignados al docente en una sección específica
   *
   * Admin (scope: 'all'): Ve TODOS los cursos de la sección
   * Docente (scope: 'own'): Ve solo sus cursos en la sección
   *
   * @param {number} sectionId - ID de la sección
   * @param {boolean} enabled - Si la query debe ejecutarse
   * @returns {UseQueryResult} Array de cursos con detalles del profesor
   *
   * @example
   * const { data: courses, isLoading } = useGlobal.getTeacherCoursesInSection(5);
   * // Retorna:
   * // [
   * //   {
   * //     courseAssignmentId: 1,
   * //     courseId: 10,
   * //     courseName: "Matemáticas",
   * //     courseCode: "MAT-001",
   * //     teacher: { id: 1, givenNames: "Juan", lastNames: "Pérez" },
   * //     assignmentType: "titular"
   * //   }
   * // ]
   */
  getTeacherCoursesInSection: (
    sectionId: number,
    enabled: boolean = true
  ): UseQueryResult<
    Array<{
      courseAssignmentId: number;
      courseId: number;
      courseName: string;
      courseCode: string;
      teacher: {
        id: number;
        givenNames: string;
        lastNames: string;
      };
      assignmentType: string;
    }>,
    Error
  > => {
    return useQuery({
      queryKey: ['courses', 'teacher-courses-in-section', sectionId],
      queryFn: () => coursesService.getTeacherCoursesInSection(sectionId),
      staleTime: 1000 * 60 * 3, // 3 minutos
      gcTime: 1000 * 60 * 15, // 15 minutos
      retry: 2,
      enabled: enabled && !!sectionId,
    });
  },

  /**
   * Obtiene cursos asignados al docente logueado
   *
   * @param {number} cycleId - ID del ciclo
   * @param {boolean} enabled - Si la query debe ejecutarse
   */
  getMyCoursesWithStudents: (
    cycleId: number,
    enabled: boolean = true
  ): UseQueryResult<TeacherCourse[], Error> => {
    return useQuery({
      queryKey: ['courses', 'my-courses', cycleId],
      queryFn: () => coursesService.getMyCoursesWithStudents(cycleId),
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos
      retry: 2,
      enabled: enabled && !!cycleId,
    });
  },

  /**
   * Obtiene estructura completa del ciclo con estudiantes
   *
   * @param {number} cycleId - ID del ciclo
   * @param {boolean} enabled - Si la query debe ejecutarse
   */
  getFullCycleStructure: (
    cycleId: number,
    enabled: boolean = true
  ): UseQueryResult<FullCycleStructure, Error> => {
    return useQuery({
      queryKey: ['courses', 'full-cycle', cycleId],
      queryFn: () => coursesService.getFullCycleStructure(cycleId),
      staleTime: 1000 * 60 * 10, // 10 minutos
      gcTime: 1000 * 60 * 60, // 1 hora
      retry: 2,
      enabled: enabled && !!cycleId,
    });
  },
};

/**
 * Hook composable para múltiples queries
 *
 * @example
 * const {
 *   data: { cycle, students },
 *   isLoading,
 *   error
 * } = useGlobal.useCycleWithStudents(sectionId, cycleId);
 */
export const useGlobalComposed = {
  /**
   * Obtiene ciclo + estudiantes simultáneamente
   */
  useCycleWithStudents: (sectionId: number, cycleId: number) => {
    const cycle = useGlobal.getActiveCycleStructure();
    const students = useGlobal.getSectionStudents(sectionId, cycleId);

    return {
      data: {
        cycle: cycle.data,
        students: students.data,
      },
      isLoading: cycle.isLoading || students.isLoading,
      error: cycle.error || students.error,
      refetch: async () => {
        await Promise.all([cycle.refetch(), students.refetch()]);
      },
    };
  },

  /**
   * Obtiene estudiantes + asistencia simultáneamente
   */
  useStudentsWithAttendance: (sectionId: number, bimesterId: number) => {
    const students = useGlobal.getSectionStudentsLite(sectionId, 1); // cycleId = 1 por defecto
    const attendance = useGlobal.getSectionStudentsWithAttendance(
      sectionId,
      bimesterId
    );

    return {
      data: {
        students: students.data,
        attendance: attendance.data,
      },
      isLoading: students.isLoading || attendance.isLoading,
      error: students.error || attendance.error,
      refetch: async () => {
        await Promise.all([students.refetch(), attendance.refetch()]);
      },
    };
  },

  /**
   * Obtiene cursos + estudiantes de una sección simultáneamente
   * Útil para asistencia por clase
   */
  useCoursesAndStudents: (sectionId: number, cycleId: number) => {
    const courses = useGlobal.getTeacherCoursesInSection(sectionId);
    const students = useGlobal.getSectionStudentsLite(sectionId, cycleId);

    return {
      data: {
        courses: courses.data,
        students: students.data,
      },
      isLoading: courses.isLoading || students.isLoading,
      error: courses.error || students.error,
      refetch: async () => {
        await Promise.all([courses.refetch(), students.refetch()]);
      },
    };
  },
};