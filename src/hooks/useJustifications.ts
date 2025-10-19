// src/hooks/useJustifications.ts

'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';
import justificationService from '@/services/justificationService';
import {
  StudentJustification,
  CreateJustificationDto,
  ApproveJustificationDto,
  RejectJustificationDto,
  BulkApproveJustificationDto,
  JustificationStats,
} from '@/types/justification';

// ============================================
// VALIDATION SCHEMAS (Zod)
// ============================================

const createJustificationSchema = z.object({
  enrollmentId: z.number().int().positive('ID de matrícula inválido'),
  startDate: z.string().datetime('Fecha de inicio inválida'),
  endDate: z.string().datetime('Fecha de fin inválida'),
  type: z.enum(['medical', 'personal', 'administrative', 'other'], {
    errorMap: () => ({ message: 'Tipo de justificativo inválido' }),
  }),
  reason: z
    .string()
    .min(10, 'La razón debe tener al menos 10 caracteres')
    .max(500, 'La razón no puede exceder 500 caracteres'),
  description: z.string().optional(),
  documentUrl: z.string().url('URL de documento inválida').optional(),
  documentType: z.enum(['pdf', 'image', 'doc']).optional(),
  documentName: z.string().optional(),
});

const approveJustificationSchema = z.object({
  approvalNotes: z.string().optional(),
  autoUpdateAttendance: z.boolean().default(true),
});

const rejectJustificationSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, 'La razón de rechazo debe tener al menos 10 caracteres')
    .max(500, 'La razón no puede exceder 500 caracteres'),
});

type UseJustificationsError = {
  message: string;
  code?: string;
  details?: any;
};

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useJustifications = () => {
  // Estados principales
  const [justifications, setJustifications] = useState<StudentJustification[]>([]);
  const [pendingJustifications, setPendingJustifications] = useState<StudentJustification[]>([]);
  const [currentJustification, setCurrentJustification] = useState<StudentJustification | null>(null);
  const [stats, setStats] = useState<JustificationStats | null>(null);

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UseJustificationsError | null>(null);

  // ============================================
  // HELPERS
  // ============================================

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown): UseJustificationsError => {
    let error: UseJustificationsError;

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
  // CREAR JUSTIFICATIVO
  // ============================================

  const createJustification = useCallback(
    async (dto: CreateJustificationDto) => {
      resetError();
      setLoading(true);

      try {
        // Validar con Zod
        const validated = createJustificationSchema.parse(dto);

        // Validar que endDate > startDate
        if (new Date(validated.endDate) <= new Date(validated.startDate)) {
          throw new Error('La fecha de fin debe ser mayor a la fecha de inicio');
        }

        const data = await justificationService.createJustification(validated);
        setCurrentJustification(data);

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

  // ============================================
  // OBTENER JUSTIFICATIVOS
  // ============================================

  const getPendingJustifications = useCallback(
    async (page: number = 1, limit: number = 10) => {
      resetError();
      setLoading(true);

      try {
        const data = await justificationService.getPendingJustifications(page, limit);
        setPendingJustifications(data);

        // Actualizar stats
        setStats({
          total: data.length,
          pending: data.filter((j) => j.status === 'pending').length,
          approved: data.filter((j) => j.status === 'approved').length,
          rejected: data.filter((j) => j.status === 'rejected').length,
          pendingApproval: data.filter((j) => j.status === 'pending'),
        });

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

  const getJustifications = useCallback(
    async (filters?: any, page: number = 1, limit: number = 10) => {
      resetError();
      setLoading(true);

      try {
        const data = await justificationService.getJustifications(filters, page, limit);
        setJustifications(data);
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

  const getJustificationById = useCallback(
    async (id: number) => {
      resetError();
      setLoading(true);

      try {
        const data = await justificationService.getJustificationById(id);
        setCurrentJustification(data);
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

  const getJustificationsByEnrollment = useCallback(
    async (enrollmentId: number, page: number = 1, limit: number = 10) => {
      resetError();
      setLoading(true);

      try {
        const data = await justificationService.getJustificationsByEnrollment(enrollmentId, page, limit);
        setJustifications(data);
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

  // ============================================
  // APROBAR/RECHAZAR
  // ============================================

  const approveJustification = useCallback(
    async (id: number, dto: ApproveJustificationDto = {}) => {
      resetError();
      setLoading(true);

      try {
        // Validar con Zod
        const validated = approveJustificationSchema.parse(dto);

        const data = await justificationService.approveJustification(id, validated);

        // Actualizar en estado
        setJustifications((prev) =>
          prev.map((item) => (item.id === id ? data : item))
        );
        setPendingJustifications((prev) =>
          prev.filter((item) => item.id !== id)
        );

        if (currentJustification?.id === id) {
          setCurrentJustification(data);
        }

        return data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError, currentJustification]
  );

  const rejectJustification = useCallback(
    async (id: number, dto: RejectJustificationDto) => {
      resetError();
      setLoading(true);

      try {
        // Validar con Zod
        const validated = rejectJustificationSchema.parse(dto);

        const data = await justificationService.rejectJustification(id, validated);

        // Actualizar en estado
        setJustifications((prev) =>
          prev.map((item) => (item.id === id ? data : item))
        );
        setPendingJustifications((prev) =>
          prev.filter((item) => item.id !== id)
        );

        if (currentJustification?.id === id) {
          setCurrentJustification(data);
        }

        return data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError, currentJustification]
  );

  // ============================================
  // OPERACIONES BULK
  // ============================================

  const bulkApproveJustifications = useCallback(
    async (justificationIds: number[], autoUpdateAttendance: boolean = true) => {
      if (!justificationIds.length) {
        throw new Error('Debe proporcionar al menos una justificación');
      }

      resetError();
      setLoading(true);

      try {
        const dto: BulkApproveJustificationDto = {
          justificationIds,
          autoUpdateAttendance,
        };

        const response = await justificationService.bulkApproveJustifications(dto);

        // Actualizar estado local
        setPendingJustifications((prev) =>
          prev.filter((item) => !justificationIds.includes(item.id))
        );

        return response;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError]
  );

  // ============================================
  // DESCARGAR DOCUMENTO
  // ============================================

  const downloadDocument = useCallback(
    async (id: number, filename?: string) => {
      resetError();
      setLoading(true);

      try {
        const blob = await justificationService.downloadJustificationDocument(id);

        // Crear URL y descargar
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `justificativo-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        handleError(err);
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
    justifications,
    pendingJustifications,
    currentJustification,
    stats,
    loading,
    error,

    // Crear
    createJustification,

    // Obtener
    getPendingJustifications,
    getJustifications,
    getJustificationById,
    getJustificationsByEnrollment,

    // Aprobar/Rechazar
    approveJustification,
    rejectJustification,
    bulkApproveJustifications,

    // Descargar
    downloadDocument,

    // Utilidades
    resetError,
    clearCurrent: () => setCurrentJustification(null),
    clearList: () => setJustifications([]),
  };
};

export default useJustifications;