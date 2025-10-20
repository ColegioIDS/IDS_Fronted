// src/hooks/useAttendanceSystem.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useGlobal } from './useGlobal';
import { useAttendance } from './useAttendance';
import {
  StudentWithAttendance,
  AttendanceCount,
} from '@/types/global';
import { coursesService } from '@/services/globalService';

/**
 * ============================================
 * HOOK COMPOSADO: ASISTENCIA COMPLETA
 * ============================================
 *
 * Integra:
 * • Estructura de ciclos, grados, secciones
 * • Cursos asignados al docente por sección ← NUEVO
 * • Estudiantes con datos académicos
 * • Registro y gestión de asistencia
 * • Reportes y estadísticas
 *
 * @param {number} sectionId - ID de la sección
 * @param {number} bimesterId - ID del bimestre
 * @param {number} cycleId - ID del ciclo (default: 1)
 *
 * @example
 * const {
 *   courses,        // ← NUEVO
 *   students,
 *   selectedStudent,
 *   groupStatistics,
 *   actions
 * } = useAttendanceSystem(sectionId, bimesterId, cycleId);
 */

interface AttendanceSystemState {
  selectedSection: {
    id: number;
    name: string;
    grade: string;
  } | null;
  selectedBimester: {
    id: number;
    name: string;
  } | null;
  selectedStudent: StudentWithAttendance | null;
  selectedCourse: {
    courseAssignmentId: number;
    courseId: number;
    courseName: string;
    courseCode: string;
  } | null;
  filterRisk: boolean;
  sortBy: 'name' | 'attendance' | 'risk';
}

export const useAttendanceSystem = (
  sectionId: number,
  bimesterId: number,
  cycleId: number = 1
) => {
  // ============================================
  // HOOKS COMPOSADOS
  // ============================================

  // Obtener estudiantes con asistencia
  const studentsQuery = useGlobal.getSectionStudentsWithAttendance(
    sectionId,
    bimesterId,
    !!sectionId && !!bimesterId
  );

  // ✅ NUEVO: Obtener cursos asignados al docente en esta sección
  const coursesQuery = useGlobal.getTeacherCoursesInSection(
    sectionId,
    !!sectionId
  );

  const attendanceHook = useAttendance();

  // ============================================
  // ESTADOS LOCALES
  // ============================================

  const [state, setState] = useState<AttendanceSystemState>({
    selectedSection: null,
    selectedBimester: null,
    selectedStudent: null,
    selectedCourse: null,
    filterRisk: false,
    sortBy: 'name',
  });

  // ============================================
  // DERIVADOS Y CÁLCULOS
  // ============================================

  /**
   * Estudiantes filtrados y ordenados
   */
  const processedStudents = useMemo(() => {
    if (!studentsQuery.data) return [];

    let filtered = [...studentsQuery.data];

    // Filtrar por riesgo
    if (state.filterRisk) {
      filtered = coursesService.filterByAttendanceRisk(filtered, true);
    }

    // Ordenar
    switch (state.sortBy) {
      case 'attendance':
        filtered = coursesService.sortByAttendance(filtered);
        break;
      case 'risk':
        filtered.sort((a, b) => {
          const aRisk = a.attendanceReport?.isAtRisk ? 1 : 0;
          const bRisk = b.attendanceReport?.isAtRisk ? 1 : 0;
          return bRisk - aRisk;
        });
        break;
      case 'name':
      default:
        filtered.sort((a, b) =>
          a.student.lastNames.localeCompare(b.student.lastNames)
        );
    }

    return filtered;
  }, [studentsQuery.data, state.filterRisk, state.sortBy]);

  /**
   * Estadísticas del grupo
   */
  const groupStatistics = useMemo(() => {
    if (!studentsQuery.data || studentsQuery.data.length === 0) {
      return {
        totalStudents: 0,
        averageAttendance: 0,
        studentsAtRisk: 0,
        studentsWithIntervention: 0,
        highestAttendance: 0,
        lowestAttendance: 0,
      };
    }

    const attendances = studentsQuery.data
      .map((s) => s.attendanceReport?.attendancePercentage ?? 0)
      .filter((a) => a > 0);

    return {
      totalStudents: studentsQuery.data.length,
      averageAttendance: coursesService.getGroupAttendanceAverage(studentsQuery.data),
      studentsAtRisk: studentsQuery.data.filter(
        (s) => s.attendanceReport?.isAtRisk
      ).length,
      studentsWithIntervention: studentsQuery.data.filter(
        (s) => s.attendanceReport?.needsIntervention
      ).length,
      highestAttendance: attendances.length ? Math.max(...attendances) : 0,
      lowestAttendance: attendances.length ? Math.min(...attendances) : 0,
    };
  }, [studentsQuery.data]);

  /**
   * Estudiante seleccionado con detalles
   */
  const selectedStudentDetails = useMemo(() => {
    if (!state.selectedStudent) return null;

    return {
      ...state.selectedStudent,
      stats: coursesService.calculateAttendanceStats(state.selectedStudent),
      riskLevel: state.selectedStudent.attendanceReport?.isAtRisk
        ? 'high'
        : state.selectedStudent.attendanceReport?.needsIntervention
          ? 'medium'
          : 'low',
    };
  }, [state.selectedStudent]);

  // ============================================
  // ACCIONES DE SELECCIÓN
  // ============================================

  const selectStudent = useCallback((student: StudentWithAttendance | null) => {
    setState((prev) => ({ ...prev, selectedStudent: student }));
  }, []);

  const selectCourse = useCallback((course: any | null) => {
    setState((prev) => ({ ...prev, selectedCourse: course }));
  }, []);

  const toggleFilterRisk = useCallback(() => {
    setState((prev) => ({ ...prev, filterRisk: !prev.filterRisk }));
  }, []);

  const setSortBy = useCallback(
    (sortBy: AttendanceSystemState['sortBy']) => {
      setState((prev) => ({ ...prev, sortBy }));
    },
    []
  );

  // ============================================
  // ACCIONES DE ASISTENCIA
  // ============================================

  /**
   * Registrar asistencia para un estudiante
   */
  const recordAttendance = useCallback(
    async (enrollmentId: number, statusCode: string, notes?: string) => {
      try {
        const today = new Date().toISOString();

        await attendanceHook.createAttendance({
          enrollmentId,
          date: today,
          statusCode,
          notes,
        });

        // Refrescar datos
        await studentsQuery.refetch();

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error registrando asistencia',
        };
      }
    },
    [attendanceHook, studentsQuery]
  );

  /**
   * Registrar asistencia para múltiples estudiantes
   */
  const recordBulkAttendance = useCallback(
    async (
      enrollmentIds: number[],
      statusCode: string,
      startDate: string,
      endDate: string,
      notes?: string
    ) => {
      try {
        await attendanceHook.bulkApplyStatus(
          enrollmentIds,
          statusCode,
          startDate,
          endDate,
          notes
        );

        // Refrescar datos
        await studentsQuery.refetch();

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error en registro masivo',
        };
      }
    },
    [attendanceHook, studentsQuery]
  );

  /**
   * Actualizar registro de asistencia
   */
  const updateAttendanceRecord = useCallback(
    async (
      recordId: number,
      statusCode: string,
      notes?: string,
      reason?: string
    ) => {
      try {
        await attendanceHook.updateAttendance(
          recordId,
          { statusCode, notes },
          reason
        );

        // Refrescar datos
        await studentsQuery.refetch();

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error actualizando asistencia',
        };
      }
    },
    [attendanceHook, studentsQuery]
  );

  /**
   * Justificar inasistencia
   */
  const justifyAbsence = useCallback(
    async (enrollmentId: number, startDate: string, endDate: string, reason: string) => {
      try {
        // Crear registro justificado
        await recordBulkAttendance(
          [enrollmentId],
          'IJ', // Inasistencia Justificada
          startDate,
          endDate,
          reason
        );

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error justificando inasistencia',
        };
      }
    },
    [recordBulkAttendance]
  );

  // ============================================
  // ACCIONES DE FILTRO Y EXPORTACIÓN
  // ============================================

  /**
   * Obtener estudiantes en riesgo
   */
  const getAtRiskStudents = useCallback(() => {
    if (!studentsQuery.data) return [];
    return coursesService.filterByAttendanceRisk(studentsQuery.data, true);
  }, [studentsQuery.data]);

  /**
   * Obtener reporte en JSON
   */
  const exportReport = useCallback(() => {
    if (!studentsQuery.data) return null;

    return {
      generatedAt: new Date().toISOString(),
      sectionId,
      bimesterId,
      course: state.selectedCourse,
      totalStudents: studentsQuery.data.length,
      statistics: groupStatistics,
      students: studentsQuery.data.map((s) => ({
        codeSIRE: s.student.codeSIRE,
        name: `${s.student.givenNames} ${s.student.lastNames}`,
        attendance: s.attendanceReport?.attendancePercentage ?? 0,
        present: s.attendanceCount.present,
        absent: s.attendanceCount.absent,
        justified: s.attendanceCount.justified,
        isAtRisk: s.attendanceReport?.isAtRisk,
        needsIntervention: s.attendanceReport?.needsIntervention,
      })),
    };
  }, [studentsQuery.data, sectionId, bimesterId, groupStatistics, state.selectedCourse]);

  /**
   * Obtener CSV para descargar
   */
  const exportToCSV = useCallback(() => {
    const report = exportReport();
    if (!report) return null;

    const headers = [
      'Código SIRE',
      'Nombre',
      'Asistencia %',
      'Presente',
      'Ausente',
      'Justificado',
      'En Riesgo',
      'Requiere Intervención',
    ];

    const rows = report.students.map((s) => [
      s.codeSIRE,
      s.name,
      s.attendance.toFixed(2),
      s.present,
      s.absent,
      s.justified,
      s.isAtRisk ? 'Sí' : 'No',
      s.needsIntervention ? 'Sí' : 'No',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }, [exportReport]);

  // ============================================
  // RETORNO
  // ============================================

  return {
    // Estados de datos
    students: processedStudents,
    selectedStudent: selectedStudentDetails,
    groupStatistics,
    atRiskStudents: getAtRiskStudents(),

    // ✅ NUEVO: Cursos disponibles en la sección
    courses: coursesQuery.data || [],
    selectedCourse: state.selectedCourse,

    // Estados de carga
    isLoading:
      studentsQuery.isLoading ||
      coursesQuery.isLoading ||
      attendanceHook.loading,
    error: studentsQuery.error || coursesQuery.error || attendanceHook.error,

    // Filtros y opciones
    filters: {
      filterRisk: state.filterRisk,
      sortBy: state.sortBy,
    },
    toggleFilterRisk,
    setSortBy,

    // Selección
    selectStudent,
    selectCourse, // ✅ NUEVO

    // Acciones de asistencia
    recordAttendance,
    recordBulkAttendance,
    updateAttendanceRecord,
    justifyAbsence,

    // Exportación
    exportReport,
    exportToCSV,

    // Refetch manual
    refetch: async () => {
      await Promise.all([studentsQuery.refetch(), coursesQuery.refetch()]);
    },
  };
};

export default useAttendanceSystem;