// src/services/coursesService.ts

import apiClient from './api';
import {
  ActiveCycleResponse,
  StudentListResponse,
  StudentLiteListResponse,
  StudentAttendanceListResponse,
  TeacherCoursesResponse,
  FullCycleResponse,
  ActiveCycleStructure,
  StudentWithGrades,
  StudentWithAttendance,
  TeacherCourse,
  FullCycleStructure,
} from '@/types/global';

/**
 * Servicio de Cursos y Estudiantes
 * Contiene todas las llamadas HTTP relacionadas con:
 * - Estructura de ciclos y grados
 * - Estudiantes matriculados
 * - Asistencia de estudiantes
 * - Cursos asignados a docentes
 */

export const coursesService = {
  /**
   * Obtiene la estructura del ciclo activo con grados, secciones y cursos
   * Filtra automáticamente según los permisos del usuario
   *
   * Admin: Ve TODO
   * Docente: Ve solo sus cursos
   * Coordinador: Ve su grado
   *
   * @returns {Promise<ActiveCycleStructure>} Estructura del ciclo activo
   *
   * @example
   * const cycle = await coursesService.getActiveCycleStructure();
   * console.log(cycle.grades[0].grade.sections[0].courseAssignments);
   */
  getActiveCycleStructure: async (): Promise<ActiveCycleStructure> => {
    try {
      const { data } = await apiClient.get<ActiveCycleResponse>(
        'api/global/active-cycle-structure'
      );
      return data.data;
    } catch (error) {
      throw new Error(
        `Error fetching active cycle structure: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Obtiene los estudiantes de una sección CON sus calificaciones
   * Incluye notas por bimestre de cada curso
   *
   * @param {number} sectionId - ID de la sección
   * @param {number} cycleId - ID del ciclo escolar
   * @returns {Promise<StudentWithGrades[]>} Lista de estudiantes con calificaciones
   *
   * @example
   * const students = await coursesService.getSectionStudents(1, 1);
   * students.forEach(s => {
   *   console.log(`${s.student.givenNames}: ${s.grades[0].value}`);
   * });
   */
  getSectionStudents: async (
    sectionId: number,
    cycleId: number
  ): Promise<StudentWithGrades[]> => {
    try {
      const { data } = await apiClient.get<StudentListResponse>(
        `api/global/sections/${sectionId}/students?cycleId=${cycleId}`
      );
      return data.data;
    } catch (error) {
      throw new Error(
        `Error fetching section students: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Obtiene los estudiantes de una sección SIN calificaciones (versión ligera)
   * Ideal para listados rápidos que no necesitan calificaciones
   *
   * @param {number} sectionId - ID de la sección
   * @param {number} cycleId - ID del ciclo escolar
   * @returns {Promise<Array>} Lista ligera de estudiantes (id, codeSIRE, nombres)
   *
   * @example
   * const studentsList = await coursesService.getSectionStudentsLite(1, 1);
   * console.log(studentsList.length); // Más rápido que getSectionStudents
   */
  getSectionStudentsLite: async (
    sectionId: number,
    cycleId: number
  ): Promise<
    Array<{
      id: number;
      student: {
        id: number;
        codeSIRE: string;
        givenNames: string;
        lastNames: string;
        gender?: string;
        birthDate?: string;
      };
    }>
  > => {
    try {
      const { data } = await apiClient.get<StudentLiteListResponse>(
        `api/global/sections/${sectionId}/students/lite?cycleId=${cycleId}`
      );
      return data.data;
    } catch (error) {
      throw new Error(
        `Error fetching lite section students: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Obtiene los estudiantes de una sección CON su asistencia de un bimestre específico
   * Incluye reporte consolidado y registro diario
   *
   * Filtra automáticamente según los permisos del usuario:
   * - Admin: Ve todo
   * - Docente: Ve solo sus estudiantes
   *
   * @param {number} sectionId - ID de la sección
   * @param {number} bimesterId - ID del bimestre
   * @returns {Promise<StudentWithAttendance[]>} Lista de estudiantes con asistencia
   *
   * @example
   * const attendance = await coursesService.getSectionStudentsWithAttendance(1, 1);
   * attendance.forEach(student => {
   *   console.log(`${student.student.givenNames}:`);
   *   console.log(`  Presente: ${student.attendanceCount.present}`);
   *   console.log(`  Ausente: ${student.attendanceCount.absent}`);
   *   console.log(`  Porcentaje: ${student.attendanceReport?.attendancePercentage}%`);
   * });
   */
  getSectionStudentsWithAttendance: async (
    sectionId: number,
    bimesterId: number
  ): Promise<StudentWithAttendance[]> => {
    try {
      const { data } = await apiClient.get<StudentAttendanceListResponse>(
        `api/global/sections/${sectionId}/students/attendance/${bimesterId}`
      );
      return data.data;
    } catch (error) {
      throw new Error(
        `Error fetching section students with attendance: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Obtiene los cursos asignados al docente logueado + sus estudiantes
   * Solo disponible para docentes
   *
   * @param {number} cycleId - ID del ciclo escolar
   * @returns {Promise<TeacherCourse[]>} Lista de cursos del docente con estudiantes
   *
   * @example
   * const myCourses = await coursesService.getMyCoursesWithStudents(1);
   * myCourses.forEach(course => {
   *   console.log(`${course.course.name} - ${course.course.code}`);
   *   console.log(`  Sección: ${course.section.name}`);
   *   console.log(`  Estudiantes: ${course.studentCount}`);
   * });
   */
  getMyCoursesWithStudents: async (cycleId: number): Promise<TeacherCourse[]> => {
    try {
      const { data } = await apiClient.get<TeacherCoursesResponse>(
        `api/global/my-courses?cycleId=${cycleId}`
      );
      return data.data;
    } catch (error) {
      throw new Error(
        `Error fetching my courses: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Obtiene la estructura COMPLETA del ciclo activo con estudiantes
   * Ciclo → Grados → Secciones → Estudiantes (con matriculas)
   *
   * Filtra automáticamente según los permisos del usuario:
   * - Admin: Ve TODO (todos los estudiantes de todas las secciones)
   * - Docente: Ve solo sus secciones asignadas
   * - Coordinador: Ve su grado completo
   * - Padre: Ve solo sus hijos
   *
   * @param {number} cycleId - ID del ciclo escolar
   * @returns {Promise<FullCycleStructure>} Estructura completa del ciclo con estudiantes
   *
   * @example
   * const fullCycle = await coursesService.getFullCycleStructure(1);
   *
   * // Admin ve todo
   * console.log(fullCycle.grades.length); // Todos los grados
   *
   * // Docente ve solo sus secciones
   * const myGrades = fullCycle.grades.map(g =>
   *   g.grade.sections.filter(s => s.enrollments.length > 0)
   * );
   */
  getFullCycleStructure: async (cycleId: number): Promise<FullCycleStructure> => {
    try {
      const { data } = await apiClient.get<FullCycleResponse>(
        `api/global/full-cycle-structure?cycleId=${cycleId}`
      );
      return data.data;
    } catch (error) {
      throw new Error(
        `Error fetching full cycle structure: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },


  /**
   * Obtiene los cursos asignados al docente (o todos si es admin) en una sección específica
   * 
   * Admin (scope: 'all'): Ve TODOS los cursos de la sección
   * Docente (scope: 'own'): Ve solo sus cursos en la sección
   * Coordinador (scope: 'grade'): Ve los cursos de su grado
   *
   * @param {number} sectionId - ID de la sección
   * @returns {Promise<Array>} Array de cursos con detalles del profesor
   *
   * @example
   * const courses = await coursesService.getTeacherCoursesInSection(5);
   * // Retorna:
   * // [
   * //   {
   * //     courseAssignmentId: 1,
   * //     courseId: 10,
   * //     courseName: "Matemáticas",
   * //     courseCode: "MAT-001",
   * //     teacher: { id: 1, givenNames: "Juan", lastNames: "Pérez" },
   * //     assignmentType: "titular"
   * //   },
   * //   {
   * //     courseAssignmentId: 2,
   * //     courseId: 11,
   * //     courseName: "Español",
   * //     courseCode: "ESP-001",
   * //     teacher: { id: 1, givenNames: "Juan", lastNames: "Pérez" },
   * //     assignmentType: "titular"
   * //   }
   * // ]
   */
  getTeacherCoursesInSection: async (sectionId: number) => {
    try {
      const { data } = await apiClient.get(
        `api/global/sections/${sectionId}/teacher-courses`
      );
      return data.data;
    } catch (error) {
      throw new Error(
        `Error fetching teacher courses in section: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },



  /**
   * UTILIDADES: Funciones auxiliares para procesar datos
   */

  /**
   * Extrae un estudiante específico con su información completa
   *
   * @param {StudentWithGrades[]} students - Lista de estudiantes
   * @param {number} studentId - ID del estudiante a buscar
   * @returns {StudentWithGrades | undefined} Estudiante encontrado o undefined
   */
  findStudent: (students: StudentWithGrades[], studentId: number) => {
    return students.find((s) => s.student.id === studentId);
  },

  /**
   * Calcula estadísticas de asistencia para un estudiante
   *
   * @param {StudentWithAttendance} student - Estudiante con asistencia
   * @returns {Object} Estadísticas de asistencia
   *
   * @example
   * const stats = coursesService.calculateAttendanceStats(student);
   * console.log(`Asistencia: ${stats.percentage}%`);
   */
  calculateAttendanceStats: (student: StudentWithAttendance) => {
    const { attendanceCount, attendanceReport } = student;

    return {
      totalDays: attendanceCount.total,
      present: attendanceCount.present,
      absent: attendanceCount.absent,
      justified: attendanceCount.justified,
      percentage: attendanceReport?.attendancePercentage ?? 0,
      isAtRisk: attendanceReport?.isAtRisk ?? false,
      needsIntervention: attendanceReport?.needsIntervention ?? false,
    };
  },

  /**
   * Filtra estudiantes por estado de riesgo de asistencia
   *
   * @param {StudentWithAttendance[]} students - Lista de estudiantes
   * @param {boolean} atRisk - true para obtener estudiantes en riesgo
   * @returns {StudentWithAttendance[]} Estudiantes filtrados
   *
   * @example
   * const atRisk = coursesService.filterByAttendanceRisk(students, true);
   * console.log(`Estudiantes en riesgo: ${atRisk.length}`);
   */
  filterByAttendanceRisk: (
    students: StudentWithAttendance[],
    atRisk: boolean = true
  ): StudentWithAttendance[] => {
    return students.filter(
      (s) => s.attendanceReport?.isAtRisk === atRisk
    );
  },

  /**
   * Ordena estudiantes por asistencia (mayor a menor)
   *
   * @param {StudentWithAttendance[]} students - Lista de estudiantes
   * @returns {StudentWithAttendance[]} Estudiantes ordenados
   *
   * @example
   * const sorted = coursesService.sortByAttendance(students);
   * console.log(sorted[0].student.givenNames); // Mejor asistencia
   */
  sortByAttendance: (students: StudentWithAttendance[]): StudentWithAttendance[] => {
    return [...students].sort((a, b) => {
      const percentA = a.attendanceReport?.attendancePercentage ?? 0;
      const percentB = b.attendanceReport?.attendancePercentage ?? 0;
      return percentB - percentA;
    });
  },

  /**
   * Obtiene el promedio de asistencia de un grupo
   *
   * @param {StudentWithAttendance[]} students - Lista de estudiantes
   * @returns {number} Porcentaje promedio de asistencia
   *
   * @example
   * const avgAttendance = coursesService.getGroupAttendanceAverage(students);
   * console.log(`Asistencia promedio: ${avgAttendance.toFixed(2)}%`);
   */
  getGroupAttendanceAverage: (students: StudentWithAttendance[]): number => {
    if (students.length === 0) return 0;

    const total = students.reduce(
      (sum, s) => sum + (s.attendanceReport?.attendancePercentage ?? 0),
      0
    );

    return total / students.length;
  },
};