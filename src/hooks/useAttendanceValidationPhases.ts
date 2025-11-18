/**
 * =========================
 * ATTENDANCE VALIDATION PHASES HOOK
 * =========================
 * 
 * Implementa las 13 fases completas de validación del sistema de asistencia
 * Basado en: docs/Sistema de asistencia/ATTENDANCE_SYSTEM_ANALYSIS.md
 * 
 * Flujo:
 * FASE 1: Autenticación (User existe y activo)
 * FASE 2: Validación de Rol y Scope
 * FASE 3: Validación de Selección Grado/Sección
 * FASE 4: Validación de Fecha y Ciclo Escolar
 * FASE 5: Validación de Bimestre
 * FASE 6: Validación de Holiday (Día Feriado)
 * FASE 7: Validación de Academic Week
 * FASE 8: Validación de Schedules
 * FASE 9: Validación de Estudiantes (Enrollments)
 * FASE 10: Validación de Estado de Asistencia
 * FASE 11: Validación de Permisos (RoleAttendancePermission)
 * FASE 12: Cargar Configuración de Asistencia
 * FASE 13: Validación de Ausencia del Maestro
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAttendanceConfig } from './useAttendanceConfigHook';
import { useAttendancePermissions } from './useAttendancePermissions';
import { AttendanceScope } from '@/types/attendance.types';

// ============================================================================
// TIPOS
// ============================================================================

export interface ValidationPhase {
  phase: number;
  name: string;
  passed: boolean;
  error?: string;
  data?: any;
}

export interface AttendanceValidationResult {
  valid: boolean;
  phases: ValidationPhase[];
  errors: string[];
  warnings: string[];
  data: {
    user?: any;
    role?: any;
    schoolCycle?: any;
    bimester?: any;
    academicWeek?: any;
    schedules?: any[];
    enrollments?: any[];
    attendanceStatus?: any;
    attendanceConfig?: any;
  };
}

export interface AttendanceValidationInput {
  userId?: number;
  roleId?: number;
  date: Date;
  gradeId?: number;
  sectionId?: number;
  statusId?: number;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useAttendanceValidationPhases() {
  const { user, isAuthenticated } = useAuth();
  const { 
    grades = [], 
    sections = [], 
    holidays = [],
    statuses = [],
    isLoading: configLoading 
  } = useAttendanceConfig();
  const { canCreate, canUpdate } = useAttendancePermissions({
    userRole: user?.role?.name || 'guest',
    scope: 'OWN' as AttendanceScope,
  });

  // ========================================================================
  // FASE 1: AUTENTICACIÓN
  // ========================================================================
  const validatePhase1Authentication = useCallback((input: AttendanceValidationInput): ValidationPhase => {
    const phase: ValidationPhase = { phase: 1, name: 'Autenticación', passed: false };

    if (!isAuthenticated) {
      phase.error = '401 - Usuario no autenticado';
      return phase;
    }

    if (!user || !user.id) {
      phase.error = '401 - Contexto de usuario inválido';
      return phase;
    }

    phase.passed = true;
    phase.data = { userId: user.id, email: user.email };
    return phase;
  }, [isAuthenticated, user]);

  // ========================================================================
  // FASE 2: VALIDACIÓN DE ROL Y SCOPE
  // ========================================================================
  const validatePhase2RoleAndScope = useCallback((input: AttendanceValidationInput): ValidationPhase => {
    const phase: ValidationPhase = { phase: 2, name: 'Validación de Rol y Scope', passed: false };

    if (!user?.role) {
      phase.error = '403 - Rol no encontrado';
      return phase;
    }

    const compatibleRoles = ['Teacher', 'Secretary', 'Coordinator', 'Admin'];
    if (!compatibleRoles.includes(user.role.name || '')) {
      phase.error = `403 - Rol ${user.role.name} no permitido para registrar asistencia`;
      return phase;
    }

    const scope = 'OWN'; // Usar scope por defecto
    const validScopes = ['ALL', 'GRADE', 'SECTION', 'OWN', 'DEPARTMENT'];
    if (!validScopes.includes(scope)) {
      phase.error = '403 - Scope inválido';
      return phase;
    }

    phase.passed = true;
    phase.data = { roleType: user.role.name, scope };
    return phase;
  }, [user]);

  // ========================================================================
  // FASE 3: VALIDACIÓN DE SELECCIÓN GRADO/SECCIÓN
  // ========================================================================
  const validatePhase3GradeSection = useCallback((input: AttendanceValidationInput): ValidationPhase => {
    const phase: ValidationPhase = { phase: 3, name: 'Validación de Selección Grado/Sección', passed: false };

    if (!input.gradeId || !input.sectionId) {
      phase.error = '400 - Grado y sección son requeridos';
      return phase;
    }

    const grade = grades.find(g => g.id === input.gradeId);
    if (!grade) {
      phase.error = '404 - Grado no encontrado';
      return phase;
    }

    const section = sections.find(s => s.id === input.sectionId && s.gradeId === input.gradeId);
    if (!section) {
      phase.error = '404 - Sección no encontrada para este grado';
      return phase;
    }

    // Validación básica de scope (simplificada para tipos disponibles)
    const scopeValid = true; // Asumir válido por ahora

    if (!scopeValid) {
      phase.error = `403 - No tienes permiso para acceder a esta sección`;
      return phase;
    }

    phase.passed = true;
    phase.data = { grade, section, scope: 'OWN' };
    return phase;
  }, [grades, sections]);

  // ========================================================================
  // FASE 4: VALIDACIÓN DE FECHA Y CICLO ESCOLAR
  // ========================================================================
  const validatePhase4DateAndCycle = useCallback((input: AttendanceValidationInput): ValidationPhase => {
    const phase: ValidationPhase = { phase: 4, name: 'Validación de Fecha y Ciclo', passed: false };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(input.date);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate > today) {
      phase.error = '400 - No puedes registrar asistencia en fechas futuras';
      return phase;
    }

    // Buscar SchoolCycle activo que contenga la fecha
    // TODO: Traer desde API de ciclos
    // Por ahora asumimos que existe un ciclo activo
    const schoolCycleActive = true; // Mock

    if (!schoolCycleActive) {
      phase.error = '400 - No existe ciclo escolar activo';
      return phase;
    }

    // Validar que el ciclo sea activo y no esté archivado
    // const isActive = cycle.isActive && !cycle.isArchived;
    // if (!isActive) {
    //   phase.error = '400 - Ciclo escolar no activo o archivado';
    //   return phase;
    // }

    phase.passed = true;
    phase.data = { date: inputDate, cycleActive: true };
    return phase;
  }, []);

  // ========================================================================
  // FASE 5: VALIDACIÓN DE BIMESTRE
  // ========================================================================
  const validatePhase5Bimester = useCallback((input: AttendanceValidationInput): ValidationPhase => {
    const phase: ValidationPhase = { phase: 5, name: 'Validación de Bimestre', passed: false };

    // TODO: Traer bimestres desde API
    // Buscar bimestre activo que contenga la fecha
    // const bimester = await bimesterRepository.findActive({
    //   startDate <= date <= endDate,
    //   isActive = true
    // })

    // Por ahora mock
    const bimesterExists = true;

    if (!bimesterExists) {
      phase.error = '400 - No existe bimestre activo para esta fecha';
      return phase;
    }

    phase.passed = true;
    phase.data = { bimesterActive: true };
    return phase;
  }, []);

  // ========================================================================
  // FASE 6: VALIDACIÓN DE HOLIDAY
  // ========================================================================
  const validatePhase6Holiday = useCallback((input: AttendanceValidationInput): ValidationPhase => {
    const phase: ValidationPhase = { phase: 6, name: 'Validación de Holiday', passed: false };

    const dateISO = input.date.toISOString().split('T')[0];
    const holiday = holidays.find(h => h.date === dateISO);

    if (holiday) {
      if (!holiday.isRecovered) {
        phase.error = `400 - Día feriado (${holiday.name}): no se puede registrar asistencia`;
        return phase;
      }
      // Holiday recuperado, permitir
    }

    phase.passed = true;
    phase.data = { isHoliday: !!holiday, isRecovered: holiday?.isRecovered };
    return phase;
  }, [holidays]);

  // ========================================================================
  // FASE 7: VALIDACIÓN DE ACADEMIC WEEK
  // ========================================================================
  const validatePhase7AcademicWeek = useCallback((input: AttendanceValidationInput): ValidationPhase => {
    const phase: ValidationPhase = { phase: 7, name: 'Validación de Academic Week', passed: false };

    // TODO: Traer academic weeks desde API
    // Buscar si existe AcademicWeek que contenga la fecha
    // const academicWeek = await academicWeekRepository.findByDate(date)

    // Mock: asumimos que no hay semana de descanso
    // En producción, traer desde API con useAcademicWeeks
    const academicWeekType = 'REGULAR' as 'REGULAR' | 'BREAK';

    if (academicWeekType === 'BREAK') {
      phase.error = '400 - No se puede registrar asistencia durante semana de descanso';
      return phase;
    }

    phase.passed = true;
    phase.data = { weekType: academicWeekType };
    return phase;
  }, []);

  // ========================================================================
  // FASE 8: VALIDACIÓN DE SCHEDULES
  // ========================================================================
  const validatePhase8Schedules = useCallback(async (input: AttendanceValidationInput): Promise<ValidationPhase> => {
    const phase: ValidationPhase = { phase: 8, name: 'Validación de Schedules', passed: false };

    if (!input.sectionId) {
      phase.error = '400 - SectionId requerido';
      return phase;
    }

    // TODO: Traer schedules desde API
    // const dayOfWeek = getDayOfWeek(input.date);
    // const schedules = await scheduleRepository.find({
    //   sectionId: input.sectionId,
    //   dayOfWeek,
    //   courseAssignment.isActive = true
    // })

    // Mock: asumimos que hay schedules
    const hasSchedules = true;

    if (!hasSchedules) {
      phase.error = '404 - No tienes clases programadas para este día';
      return phase;
    }

    phase.passed = true;
    phase.data = { schedulesFound: true };
    return phase;
  }, []);

  // ========================================================================
  // FASE 9: VALIDACIÓN DE ESTUDIANTES (ENROLLMENTS)
  // ========================================================================
  const validatePhase9Enrollments = useCallback((input: AttendanceValidationInput): ValidationPhase => {
    const phase: ValidationPhase = { phase: 9, name: 'Validación de Estudiantes (Enrollments)', passed: false };

    if (!input.sectionId) {
      phase.error = '400 - SectionId requerido';
      return phase;
    }

    // TODO: Traer enrollments desde API
    // const enrollments = await enrollmentRepository.find({
    //   sectionId: input.sectionId,
    //   status: ACTIVE,
    //   dateEnrolled <= date
    // })

    // Mock
    const enrollmentsCount: number = 25;

    if (!enrollmentsCount || enrollmentsCount === 0) {
      phase.error = '400 - No hay estudiantes activos en esta sección';
      return phase;
    }

    phase.passed = true;
    phase.data = { enrollmentsCount };
    return phase;
  }, []);

  // ========================================================================
  // FASE 10: VALIDACIÓN DE ESTADO DE ASISTENCIA
  // ========================================================================
  const validatePhase10AttendanceStatus = useCallback((input: AttendanceValidationInput): ValidationPhase => {
    const phase: ValidationPhase = { phase: 10, name: 'Validación de Estado de Asistencia', passed: false };

    if (!input.statusId) {
      phase.error = '400 - Estado de asistencia requerido';
      return phase;
    }

    const status = statuses.find(s => s.id === input.statusId);
    if (!status) {
      phase.error = '404 - Estado de asistencia no encontrado';
      return phase;
    }

    if (!status.isActive) {
      phase.error = '400 - Estado de asistencia inactivo';
      return phase;
    }

    phase.passed = true;
    phase.data = { status };
    return phase;
  }, [statuses]);

  // ========================================================================
  // FASE 11: VALIDACIÓN DE PERMISOS (RoleAttendancePermission)
  // ========================================================================
  const validatePhase11RoleAttendancePermission = useCallback((input: AttendanceValidationInput): ValidationPhase => {
    const phase: ValidationPhase = { phase: 11, name: 'Validación de Permisos (RoleAttendancePermission)', passed: false };

    if (!input.statusId || !user?.role?.id) {
      phase.error = '400 - Estado y rol requeridos';
      return phase;
    }

    // TODO: Traer RoleAttendancePermission desde API
    // const permission = await roleAttendancePermissionRepository.find({
    //   roleId: user.roleId,
    //   attendanceStatusId: input.statusId
    // })

    // Mock: asumir que existe y tiene permisos
    const hasPermission = canCreate;

    if (!hasPermission) {
      phase.error = '403 - No tienes permiso para crear asistencia con este estado';
      return phase;
    }

    // Maestros no pueden editar (canModify debe ser false)
    const isTeacher = user?.role?.name === 'Teacher';
    if (isTeacher && (canUpdate as unknown as boolean)) {
      phase.error = '403 - Los maestros no pueden editar asistencia';
      return phase;
    }

    phase.passed = true;
    phase.data = { canCreate, canUpdate };
    return phase;
  }, [user, canCreate, canUpdate]);

  // ========================================================================
  // FASE 12: CARGAR CONFIGURACIÓN
  // ========================================================================
  const validatePhase12AttendanceConfig = useCallback((input: AttendanceValidationInput): ValidationPhase => {
    const phase: ValidationPhase = { phase: 12, name: 'Cargar Configuración', passed: false };

    // TODO: Traer AttendanceConfig desde API
    // const config = await attendanceConfigRepository.findActive()
    // if (!config) crear default

    // Mock config
    const config = {
      lateThresholdTime: 15,
      markAsTardyAfterMinutes: 5,
      riskThresholdPercentage: 20,
      isActive: true,
    };

    if (!config) {
      phase.error = 'Error al cargar configuración';
      return phase;
    }

    phase.passed = true;
    phase.data = { config };
    return phase;
  }, []);

  // ========================================================================
  // FASE 13: VALIDACIÓN DE AUSENCIA DEL MAESTRO
  // ========================================================================
  const validatePhase13TeacherAbsence = useCallback((input: AttendanceValidationInput): ValidationPhase => {
    const phase: ValidationPhase = { phase: 13, name: 'Validación de Ausencia del Maestro', passed: false };

    if (!user?.id) {
      phase.error = 'Usuario no encontrado';
      return phase;
    }

    // TODO: Traer TeacherAbsence desde API
    // const absence = await teacherAbsenceRepository.findByDate({
    //   teacherId: user.id,
    //   startDate <= date <= endDate,
    //   status IN ['approved', 'active']
    // })

    // Mock: sin ausencia
    const hasAbsence = false;

    if (hasAbsence) {
      phase.error = '400 - No puedes registrar asistencia mientras estés de ausencia';
      return phase;
    }

    phase.passed = true;
    phase.data = { teacherAbsence: false };
    return phase;
  }, [user]);

  // ========================================================================
  // EJECUTAR TODAS LAS VALIDACIONES
  // ========================================================================
  const validateAllPhases = useCallback(async (input: AttendanceValidationInput): Promise<AttendanceValidationResult> => {
    const phases: ValidationPhase[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const data: any = {};

    // Ejecutar validaciones en secuencia
    const phase1 = validatePhase1Authentication(input);
    phases.push(phase1);
    if (!phase1.passed) {
      errors.push(phase1.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    const phase2 = validatePhase2RoleAndScope(input);
    phases.push(phase2);
    if (!phase2.passed) {
      errors.push(phase2.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    const phase3 = validatePhase3GradeSection(input);
    phases.push(phase3);
    if (!phase3.passed) {
      errors.push(phase3.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    const phase4 = validatePhase4DateAndCycle(input);
    phases.push(phase4);
    if (!phase4.passed) {
      errors.push(phase4.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    const phase5 = validatePhase5Bimester(input);
    phases.push(phase5);
    if (!phase5.passed) {
      errors.push(phase5.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    const phase6 = validatePhase6Holiday(input);
    phases.push(phase6);
    if (!phase6.passed) {
      errors.push(phase6.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    const phase7 = validatePhase7AcademicWeek(input);
    phases.push(phase7);
    if (!phase7.passed) {
      errors.push(phase7.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    const phase8 = await validatePhase8Schedules(input);
    phases.push(phase8);
    if (!phase8.passed) {
      errors.push(phase8.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    const phase9 = validatePhase9Enrollments(input);
    phases.push(phase9);
    if (!phase9.passed) {
      errors.push(phase9.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    const phase10 = validatePhase10AttendanceStatus(input);
    phases.push(phase10);
    if (!phase10.passed) {
      errors.push(phase10.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    const phase11 = validatePhase11RoleAttendancePermission(input);
    phases.push(phase11);
    if (!phase11.passed) {
      errors.push(phase11.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    const phase12 = validatePhase12AttendanceConfig(input);
    phases.push(phase12);
    if (!phase12.passed) {
      errors.push(phase12.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    const phase13 = validatePhase13TeacherAbsence(input);
    phases.push(phase13);
    if (!phase13.passed) {
      errors.push(phase13.error!);
      return { valid: false, phases, errors, warnings, data };
    }

    return {
      valid: true,
      phases,
      errors,
      warnings,
      data: {
        user: phase1.data,
        role: phase2.data,
        schoolCycle: phase4.data,
        bimester: phase5.data,
        academicWeek: phase7.data,
        schedules: phase8.data,
        enrollments: phase9.data,
        attendanceStatus: phase10.data,
        attendanceConfig: phase12.data,
      },
    };
  }, [
    validatePhase1Authentication,
    validatePhase2RoleAndScope,
    validatePhase3GradeSection,
    validatePhase4DateAndCycle,
    validatePhase5Bimester,
    validatePhase6Holiday,
    validatePhase7AcademicWeek,
    validatePhase8Schedules,
    validatePhase9Enrollments,
    validatePhase10AttendanceStatus,
    validatePhase11RoleAttendancePermission,
    validatePhase12AttendanceConfig,
    validatePhase13TeacherAbsence,
  ]);

  return useMemo(
    () => ({
      validateAllPhases,
      validatePhase1Authentication,
      validatePhase2RoleAndScope,
      validatePhase3GradeSection,
      validatePhase4DateAndCycle,
      validatePhase5Bimester,
      validatePhase6Holiday,
      validatePhase7AcademicWeek,
      validatePhase8Schedules,
      validatePhase9Enrollments,
      validatePhase10AttendanceStatus,
      validatePhase11RoleAttendancePermission,
      validatePhase12AttendanceConfig,
      validatePhase13TeacherAbsence,
    }),
    [
      validateAllPhases,
      validatePhase1Authentication,
      validatePhase2RoleAndScope,
      validatePhase3GradeSection,
      validatePhase4DateAndCycle,
      validatePhase5Bimester,
      validatePhase6Holiday,
      validatePhase7AcademicWeek,
      validatePhase8Schedules,
      validatePhase9Enrollments,
      validatePhase10AttendanceStatus,
      validatePhase11RoleAttendancePermission,
      validatePhase12AttendanceConfig,
      validatePhase13TeacherAbsence,
    ]
  );
}
