/**
 * ====================================================================
 * USE ATTENDANCE VALIDATIONS - Validaciones previas (Hooks 1-8)
 * ====================================================================
 *
 * Hook para ejecutar las 8 validaciones previas antes de registrar:
 * 1. Bimestre (validar que existe y está activo)
 * 2. Feriado (validar que no es feriado)
 * 3. Semana académica (validar que no es BREAK)
 * 4. Maestro ausente (validar que maestro no está en ausencia)
 * 5. Configuración (cargar configuración activa)
 * 6. Estados permitidos (obtener estados que el rol puede usar)
 * 7. Ciclo escolar (validar que ciclo existe y está activo)
 * 8. Estudiantes (validar que hay estudiantes en sección)
 *
 * Ejecuta todas en paralelo y retorna resultados consolidados
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  validateBimesterByDate,
  validateHolidayByDate,
  validateAcademicWeekByDate,
  validateTeacherAbsenceByDate,
  getActiveAttendanceConfig,
  getAllowedAttendanceStatusesByRole,
  getActiveCycle,
} from '@/services/attendance.service';
import { parseApiError, ApiErrorResponse } from '@/middleware/api-handler';

/**
 * Resultado de una validación individual
 */
export interface ValidationResult {
  id: number;
  name: string;
  passed: boolean;
  message?: string;
  data?: Record<string, unknown>;
  error?: ApiErrorResponse;
}

/**
 * Estado de las validaciones
 */
export interface ValidationState {
  isValidating: boolean;
  isComplete: boolean;
  results: ValidationResult[];
  overallStatus: 'idle' | 'loading' | 'success' | 'error';
  globalError: ApiErrorResponse | null;
}

/**
 * Acciones de validación
 */
export interface ValidationActions {
  validate: (params: ValidationParams) => Promise<ValidationResult[]>;
  validateIndividual: (validationId: number, params: ValidationParams) => Promise<ValidationResult>;
  reset: () => void;
}

/**
 * Parámetros para validación
 */
export interface ValidationParams {
  cycleId: number;
  bimesterId?: number;
  date: string; // YYYY-MM-DD
  teacherId?: number;
  roleId?: number;
  sectionId?: number;
  studentCount?: number;
}

/**
 * Hook para validaciones previas
 * @returns [estado, acciones]
 */
export function useAttendanceValidations(): [ValidationState, ValidationActions] {
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    isComplete: false,
    results: [],
    overallStatus: 'idle',
    globalError: null,
  });

  /**
   * Valida el ciclo escolar
   */
  const validateCycle = useCallback(async (): Promise<ValidationResult> => {
    const id = 7;
    const name = 'Ciclo Escolar';

    try {
      const cycle = await getActiveCycle();

      if (!cycle || !cycle.isActive) {
        return {
          id,
          name,
          passed: false,
          message: 'No hay ciclo escolar activo',
          error: parseApiError(new Error('Ciclo no activo')),
        };
      }

      return {
        id,
        name,
        passed: true,
        message: `Ciclo "${cycle.name}" activo`,
        data: cycle,
      };
    } catch (error) {
      return {
        id,
        name,
        passed: false,
        message: 'Error al validar ciclo',
        error: parseApiError(error),
      };
    }
  }, []);

  /**
   * Valida el bimestre
   */
  const validateBimester = useCallback(async (cycleId: number, date: string): Promise<ValidationResult> => {
    const id = 1;
    const name = 'Bimestre';

    try {
      const bimester = await validateBimesterByDate(cycleId, date);

      if (!bimester) {
        return {
          id,
          name,
          passed: false,
          message: 'No hay bimestre para esta fecha',
        };
      }

      return {
        id,
        name,
        passed: true,
        message: `Bimestre "${bimester.name}"`,
        data: bimester,
      };
    } catch (error) {
      return {
        id,
        name,
        passed: false,
        message: 'Error al validar bimestre',
        error: parseApiError(error),
      };
    }
  }, []);

  /**
   * Valida feriado
   */
  const validateHoliday = useCallback(async (bimesterId: number, date: string): Promise<ValidationResult> => {
    const id = 2;
    const name = 'Feriado';

    try {
      const holiday = await validateHolidayByDate(bimesterId, date);

      // Si la respuesta tiene 'id' o 'name', es un feriado real
      if (holiday && Object.keys(holiday).length > 0 && 'id' in holiday) {
        const holidayName = (holiday as Record<string, unknown>).name as string || 'Feriado';
        return {
          id,
          name,
          passed: false,
          message: `Es feriado: ${holidayName}`,
          data: holiday,
        };
      }

      return {
        id,
        name,
        passed: true,
        message: 'No es feriado - Día hábil ✓',
      };
    } catch (error) {
      return {
        id,
        name,
        passed: false,
        message: 'Error al validar feriado',
        error: parseApiError(error),
      };
    }
  }, []);

  /**
   * Valida semana académica
   */
  const validateWeek = useCallback(async (bimesterId: number, date: string): Promise<ValidationResult> => {
    const id = 3;
    const name = 'Semana Académica';

    try {
      const week = await validateAcademicWeekByDate(bimesterId, date);

      // Si la respuesta está vacía o no tiene 'id', no hay semana en esa fecha
      if (!week || Object.keys(week).length === 0 || !('id' in week)) {
        return {
          id,
          name,
          passed: false,
          message: 'Fecha fuera de semana académica',
        };
      }

      if ((week as Record<string, unknown>).weekType === 'BREAK') {
        const weekNumber = (week as Record<string, unknown>).number;
        return {
          id,
          name,
          passed: false,
          message: `Semana BREAK #${weekNumber} - No se puede registrar`,
          data: week,
        };
      }

      const weekNumber = (week as Record<string, unknown>).number;
      const weekType = (week as Record<string, unknown>).weekType;
      return {
        id,
        name,
        passed: true,
        message: `Semana ${weekType} #${weekNumber} ✓`,
        data: week,
      };
    } catch (error) {
      return {
        id,
        name,
        passed: false,
        message: 'Error al validar semana',
        error: parseApiError(error),
      };
    }
  }, []);

  /**
   * Valida ausencia del maestro
   */
  const validateTeacherAbsence = useCallback(
    async (teacherId: number, date: string): Promise<ValidationResult> => {
      const id = 4;
      const name = 'Ausencia del Maestro';

      try {
        const absence = await validateTeacherAbsenceByDate(teacherId, date);

        if (absence) {
          return {
            id,
            name,
            passed: false,
            message: `Maestro en ausencia: ${absence.reason}`,
            data: absence,
          };
        }

        return {
          id,
          name,
          passed: true,
          message: 'Maestro presente',
        };
      } catch (error) {
        return {
          id,
          name,
          passed: false,
          message: 'Error al validar ausencia',
          error: parseApiError(error),
        };
      }
    },
    []
  );

  /**
   * Valida configuración
   */
  const validateConfig = useCallback(async (): Promise<ValidationResult> => {
    const id = 5;
    const name = 'Configuración';

    try {
      const config = await getActiveAttendanceConfig();

      if (!config) {
        return {
          id,
          name,
          passed: false,
          message: 'Configuración no encontrada',
        };
      }

      return {
        id,
        name,
        passed: true,
        message: 'Configuración cargada',
        data: config,
      };
    } catch (error) {
      return {
        id,
        name,
        passed: false,
        message: 'Error al cargar configuración',
        error: parseApiError(error),
      };
    }
  }, []);

  /**
   * Valida estados permitidos
   */
  const validateAllowedStatuses = useCallback(async (roleId: number): Promise<ValidationResult> => {
    const id = 6;
    const name = 'Estados Permitidos';

    try {
      const statuses = await getAllowedAttendanceStatusesByRole(roleId);

      if (!statuses || statuses.length === 0) {
        return {
          id,
          name,
          passed: false,
          message: 'No hay estados permitidos para este rol',
        };
      }

      return {
        id,
        name,
        passed: true,
        message: `${statuses.length} estados disponibles`,
        data: { statuses },
      };
    } catch (error) {
      return {
        id,
        name,
        passed: false,
        message: 'Error al cargar estados',
        error: parseApiError(error),
      };
    }
  }, []);

  /**
   * Valida que hay estudiantes
   */
  const validateStudents = useCallback(async (studentCount: number = 0): Promise<ValidationResult> => {
    const id = 8;
    const name = 'Estudiantes';

    if (studentCount === 0) {
      return {
        id,
        name,
        passed: false,
        message: 'No hay estudiantes en esta sección',
      };
    }

    return {
      id,
      name,
      passed: true,
      message: `${studentCount} estudiantes`,
      data: { count: studentCount },
    };
  }, []);

  /**
   * Ejecuta todas las validaciones en paralelo
   */
  const validate = useCallback(
    async (params: ValidationParams): Promise<ValidationResult[]> => {
      setState(prev => ({
        ...prev,
        isValidating: true,
        overallStatus: 'loading',
        globalError: null,
      }));

      try {
        const [cycle, bimester, holiday, week, absence, config, statuses, students] =
          await Promise.all([
            validateCycle(),
            params.bimesterId ? validateBimester(params.cycleId, params.date) : Promise.resolve(null),
            params.bimesterId ? validateHoliday(params.bimesterId, params.date) : Promise.resolve(null),
            params.bimesterId ? validateWeek(params.bimesterId, params.date) : Promise.resolve(null),
            params.teacherId ? validateTeacherAbsence(params.teacherId, params.date) : Promise.resolve(null),
            validateConfig(),
            params.roleId ? validateAllowedStatuses(params.roleId) : Promise.resolve(null),
            validateStudents(params.studentCount),
          ]);

        const results = [cycle, bimester, holiday, week, absence, config, statuses, students].filter(
          Boolean
        ) as ValidationResult[];

        const allPassed = results.every(r => r.passed);

        setState(prev => ({
          ...prev,
          results,
          isValidating: false,
          isComplete: true,
          overallStatus: allPassed ? 'success' : 'error',
        }));

        return results;
      } catch (error) {
        const apiError = parseApiError(error);
        setState(prev => ({
          ...prev,
          isValidating: false,
          overallStatus: 'error',
          globalError: apiError,
        }));
        return [];
      }
    },
    [
      validateCycle,
      validateBimester,
      validateHoliday,
      validateWeek,
      validateTeacherAbsence,
      validateConfig,
      validateAllowedStatuses,
      validateStudents,
    ]
  );

  /**
   * Valida una sola validación
   */
  const validateIndividual = useCallback(
    async (validationId: number, params: ValidationParams): Promise<ValidationResult> => {
      switch (validationId) {
        case 1:
          return validateBimester(params.cycleId, params.date);
        case 2:
          return validateHoliday(params.bimesterId || params.cycleId, params.date);
        case 3:
          return validateWeek(params.bimesterId || params.cycleId, params.date);
        case 4:
          return validateTeacherAbsence(params.teacherId || 0, params.date);
        case 5:
          return validateConfig();
        case 6:
          return validateAllowedStatuses(params.roleId || 0);
        case 7:
          return validateCycle();
        case 8:
          return validateStudents(params.studentCount);
        default:
          return {
            id: validationId,
            name: 'Desconocida',
            passed: false,
            message: 'Validación no encontrada',
          };
      }
    },
    [
      validateCycle,
      validateBimester,
      validateHoliday,
      validateWeek,
      validateTeacherAbsence,
      validateConfig,
      validateAllowedStatuses,
      validateStudents,
    ]
  );

  /**
   * Reset
   */
  const reset = useCallback(() => {
    setState({
      isValidating: false,
      isComplete: false,
      results: [],
      overallStatus: 'idle',
      globalError: null,
    });
  }, []);

  const actions: ValidationActions = useMemo(
    () => ({
      validate,
      validateIndividual,
      reset,
    }),
    [validate, validateIndividual, reset]
  );

  return [state, actions];
}