// src/hooks/useAttendance.ts

'use client';

import { useState, useCallback, useRef } from 'react';
import { z } from 'zod';
import attendanceService from '@/services/attendanceService';
import {
  StudentAttendance,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  BulkCreateAttendanceDto,
  BulkDeleteAttendanceDto,
  BulkApplyStatusDto,
  AttendanceChangeRecord,
  BulkAttendanceResponse,
} from '@/types/attendance';

// ============================================
// VALIDATION SCHEMAS (Zod)
// ============================================

const createAttendanceSchema = z.object({
  enrollmentId: z.number().int().positive('ID de matrícula inválido'),
  date: z.string().datetime('Fecha inválida'),
  statusCode: z.enum(['A', 'I', 'IJ', 'TI', 'TJ'], {
    errorMap: () => ({ message: 'Código de estado inválido' }),
  }),
  courseAssignmentId: z.number().int().optional(),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
  arrivalTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido').optional(),
  minutesLate: z.number().int().nonnegative().optional(),
});

const updateAttendanceSchema = createAttendanceSchema.partial().omit({ enrollmentId: true });

type UseAttendanceError = {
  message: string;
  code?: string;
  details?: any;
};

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useAttendance = () => {
  // Estados principales
  const [attendance, setAttendance] = useState<StudentAttendance | null>(null);
  const [attendanceList, setAttendanceList] = useState<StudentAttendance[]>([]);
  const [history, setHistory] = useState<AttendanceChangeRecord[]>([]);

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UseAttendanceError | null>(null);

  // Estados de bulk operations
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Ref para cancelar operaciones
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================
  // HELPERS
  // ============================================

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown): UseAttendanceError => {
    let error: UseAttendanceError;

    if (err instanceof z.ZodError) {
      error = {
        message: 'Validación fallida',
        code: 'VALIDATION_ERROR',
        details: err.errors,
      };
    } else if (err instanceof Error) {
      error = {
        message: err.message,
        code: 'SERVICE_ERROR',
      };
    } else {
      error = {
        message: 'Error desconocido',
        code: 'UNKNOWN_ERROR',
      };
    }

    setError(error);
    return error;
  }, []);

  // ============================================
  // OPERACIONES SIMPLES
  // ============================================

  /**
   * Obtiene la asistencia de un estudiante
   */
  const getStudentAttendance = useCallback(
    async (enrollmentId: number, page: number = 1, limit: number = 10) => {
      resetError();
      setLoading(true);

      try {
        const data = await attendanceService.getStudentAttendance(enrollmentId, page, limit);
        setAttendanceList(data);
        return data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError]
  );

  /**
   * Crea un nuevo registro de asistencia
   */
  const createAttendance = useCallback(
    async (dto: CreateAttendanceDto) => {
      resetError();
      setLoading(true);

      try {
        // Validar con Zod
        const validated = createAttendanceSchema.parse(dto);

        const data = await attendanceService.createAttendance(validated);
        setAttendance(data);

        // Actualizar lista si existe
        setAttendanceList((prev) => [data, ...prev]);

        return data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError]
  );

  /**
   * Actualiza un registro de asistencia
   */
  const updateAttendance = useCallback(
    async (id: number, dto: UpdateAttendanceDto, reason?: string) => {
      resetError();
      setLoading(true);

      try {
        // Validar con Zod
        const validated = updateAttendanceSchema.parse(dto);

        const data = await attendanceService.updateAttendance(id, validated, reason);
        setAttendance(data);

        // Actualizar en lista
        setAttendanceList((prev) =>
          prev.map((item) => (item.id === id ? data : item))
        );

        return data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError]
  );

  /**
   * Obtiene el historial de cambios
   */
  const getHistory = useCallback(async (id: number) => {
    resetError();
    setLoading(true);

    try {
      const data = await attendanceService.getAttendanceHistory(id);
      setHistory(data);
      return data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [resetError, handleError]);

  // ============================================
  // OPERACIONES BULK
  // ============================================

  /**
   * Crea múltiples registros de asistencia
   */
  const bulkCreate = useCallback(
    async (attendances: CreateAttendanceDto[]) => {
      resetError();
      setBulkError(null);
      setLoading(true);
      setBulkProgress({ current: 0, total: attendances.length });

      try {
        // Validar cada registro
        const validated = attendances.map((item) => {
          const result = createAttendanceSchema.safeParse(item);
          if (!result.success) {
            throw new Error(`Validación fallida: ${result.error.message}`);
          }
          return result.data;
        });

        const dto: BulkCreateAttendanceDto = { attendances: validated };
        const response = await attendanceService.bulkCreateAttendance(dto);

        // Actualizar progreso
        setBulkProgress({ current: validated.length, total: validated.length });

        return response;
      } catch (err) {
        const error = handleError(err);
        setBulkError(error.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  /**
   * Actualiza múltiples registros de asistencia
   */
  const bulkUpdate = useCallback(
    async (updates: Array<{ id: number } & UpdateAttendanceDto>) => {
      resetError();
      setBulkError(null);
      setLoading(true);

      try {
        const dto = { updates };
        const response = await attendanceService.bulkUpdateAttendance(dto);
        return response;
      } catch (err) {
        const error = handleError(err);
        setBulkError(error.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  /**
   * Elimina múltiples registros
   */
  const bulkDelete = useCallback(
    async (ids: number[]) => {
      if (!ids.length) {
        throw new Error('Debe proporcionar al menos un ID');
      }

      resetError();
      setBulkError(null);
      setLoading(true);

      try {
        const dto: BulkDeleteAttendanceDto = { ids };
        const response = await attendanceService.bulkDeleteAttendance(dto);

        // Actualizar lista local
        setAttendanceList((prev) => prev.filter((item) => !ids.includes(item.id)));

        return response;
      } catch (err) {
        const error = handleError(err);
        setBulkError(error.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError]
  );

  /**
   * Aplica un estado a múltiples estudiantes
   */
  const bulkApplyStatus = useCallback(
    async (
      enrollmentIds: number[],
      statusCode: string,
      startDate: string,
      endDate: string,
      notes?: string
    ) => {
      if (!enrollmentIds.length) {
        throw new Error('Debe proporcionar al menos un estudiante');
      }

      resetError();
      setBulkError(null);
      setLoading(true);

      try {
        const dto: BulkApplyStatusDto = {
          enrollmentIds,
          statusCode,
          startDate,
          endDate,
          notes,
        };

        const response = await attendanceService.bulkApplyStatus(dto);
        return response;
      } catch (err) {
        const error = handleError(err);
        setBulkError(error.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError]
  );

  // ============================================
  // RETORNO
  // ============================================

  return {
    // Estados
    attendance,
    attendanceList,
    history,
    loading,
    error,
    bulkProgress,
    bulkError,

    // Acciones simples
    getStudentAttendance,
    createAttendance,
    updateAttendance,
    getHistory,

    // Acciones bulk
    bulkCreate,
    bulkUpdate,
    bulkDelete,
    bulkApplyStatus,

    // Utilidades
    resetError,
    clearAttendance: () => setAttendance(null),
    clearList: () => setAttendanceList([]),
  };
};

export default useAttendance;