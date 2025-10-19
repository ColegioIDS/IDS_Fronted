// src/hooks/useReports.ts

'use client';

import { useState, useCallback, useRef } from 'react';
import reportService from '@/services/reportService';
import {
  StudentAttendanceReport,
  ReportWithStudent,
  AttendanceStats,
  BimesterSummary,
  AtRiskStudent,
  InterventionStudent,
  StudentReportDetail,
} from '@/types/report';

// ============================================
// TYPES
// ============================================

type UseReportsError = {
  message: string;
  code?: string;
  details?: any;
};

type ReportCache = {
  [key: string]: {
    data: any;
    timestamp: number;
  };
};

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useReports = (cacheTimeout: number = 5 * 60 * 1000) => {
  // Estados principales
  const [report, setReport] = useState<StudentAttendanceReport | null>(null);
  const [reports, setReports] = useState<ReportWithStudent[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<StudentAttendanceReport[]>([]);
  const [interventionStudents, setInterventionStudents] = useState<StudentAttendanceReport[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [bimesterSummary, setBimesterSummary] = useState<BimesterSummary | null>(null);
  const [detailedReport, setDetailedReport] = useState<StudentReportDetail | null>(null);

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UseReportsError | null>(null);

  // Cache
  const cacheRef = useRef<ReportCache>({});

  // ============================================
  // HELPERS
  // ============================================

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown): UseReportsError => {
    let error: UseReportsError;

    if (err instanceof Error) {
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

  /**
   * Genera clave de caché
   */
  const getCacheKey = useCallback((prefix: string, ...args: any[]): string => {
    return `${prefix}:${args.join(':')}`;
  }, []);

  /**
   * Obtiene del caché si está vigente
   */
  const getCached = useCallback(
    (key: string): any | null => {
      const cached = cacheRef.current[key];
      if (!cached) return null;

      const now = Date.now();
      if (now - cached.timestamp > cacheTimeout) {
        delete cacheRef.current[key];
        return null;
      }

      return cached.data;
    },
    [cacheTimeout]
  );

  /**
   * Guarda en caché
   */
  const setCache = useCallback((key: string, data: any) => {
    cacheRef.current[key] = {
      data,
      timestamp: Date.now(),
    };
  }, []);

  /**
   * Limpia el caché
   */
  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  // ============================================
  // OBTENER REPORTES
  // ============================================

  const getStudentReport = useCallback(
    async (enrollmentId: number, bimesterId: number, courseId?: number, useCache: boolean = true) => {
      resetError();

      const cacheKey = getCacheKey('report', enrollmentId, bimesterId, courseId);

      // Intentar obtener del caché
      if (useCache) {
        const cached = getCached(cacheKey);
        if (cached) {
          setReport(cached);
          return cached;
        }
      }

      setLoading(true);

      try {
        const data = await reportService.getStudentReport(enrollmentId, bimesterId, courseId);
        setReport(data);
        setCache(cacheKey, data);

        return data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError, getCacheKey, getCached, setCache]
  );

  const getDetailedStudentReport = useCallback(
    async (enrollmentId: number, bimesterId: number) => {
      resetError();

      const cacheKey = getCacheKey('detailed-report', enrollmentId, bimesterId);

      // Intentar obtener del caché
      const cached = getCached(cacheKey);
      if (cached) {
        setDetailedReport(cached);
        return cached;
      }

      setLoading(true);

      try {
        const data = await reportService.getDetailedStudentReport(enrollmentId, bimesterId);
        setDetailedReport(data);
        setCache(cacheKey, data);

        return data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError, getCacheKey, getCached, setCache]
  );

  const getBimesterReports = useCallback(
    async (bimesterId: number, page: number = 1, limit: number = 10) => {
      resetError();
      setLoading(true);

      try {
        const data = await reportService.getBimesterReports(bimesterId, page, limit);
        setReports(data);

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
  // ESTUDIANTES EN RIESGO
  // ============================================

  const getAtRiskStudents = useCallback(
    async (page: number = 1, limit: number = 10) => {
      resetError();

      const cacheKey = getCacheKey('at-risk', page, limit);

      // Intentar obtener del caché
      const cached = getCached(cacheKey);
      if (cached) {
        setAtRiskStudents(cached);
        return cached;
      }

      setLoading(true);

      try {
        const data = await reportService.getAtRiskStudents(page, limit);
        setAtRiskStudents(data);
        setCache(cacheKey, data);

        return data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError, getCacheKey, getCached, setCache]
  );

  const getStudentsNeedingIntervention = useCallback(
    async (page: number = 1, limit: number = 10) => {
      resetError();

      const cacheKey = getCacheKey('intervention', page, limit);

      // Intentar obtener del caché
      const cached = getCached(cacheKey);
      if (cached) {
        setInterventionStudents(cached);
        return cached;
      }

      setLoading(true);

      try {
        const data = await reportService.getStudentsNeedingIntervention(page, limit);
        setInterventionStudents(data);
        setCache(cacheKey, data);

        return data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError, getCacheKey, getCached, setCache]
  );

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  const getAttendanceStats = useCallback(
    async (bimesterId?: number) => {
      resetError();

      const cacheKey = getCacheKey('stats', bimesterId);

      // Intentar obtener del caché
      const cached = getCached(cacheKey);
      if (cached) {
        setStats(cached);
        return cached;
      }

      setLoading(true);

      try {
        const data = await reportService.getAttendanceStats(bimesterId);
        setStats(data);
        setCache(cacheKey, data);

        return data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError, getCacheKey, getCached, setCache]
  );

  const getBimesterSummary = useCallback(
    async (bimesterId: number) => {
      resetError();

      const cacheKey = getCacheKey('summary', bimesterId);

      // Intentar obtener del caché
      const cached = getCached(cacheKey);
      if (cached) {
        setBimesterSummary(cached);
        return cached;
      }

      setLoading(true);

      try {
        const data = await reportService.getBimesterSummary(bimesterId);
        setBimesterSummary(data);
        setCache(cacheKey, data);

        return data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError, getCacheKey, getCached, setCache]
  );

  // ============================================
  // RECALCULAR
  // ============================================

  const recalculateReport = useCallback(
    async (enrollmentId: number, bimesterId: number) => {
      resetError();
      setLoading(true);

      try {
        const data = await reportService.recalculateReport(enrollmentId, bimesterId);
        setReport(data);

        // Invalidar caché
        const cacheKey = getCacheKey('report', enrollmentId, bimesterId);
        setCache(cacheKey, data);

        return data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetError, handleError, getCacheKey, setCache]
  );

  // ============================================
  // EXPORTAR
  // ============================================

  const exportToJSON = useCallback(
    async (bimesterId: number) => {
      resetError();
      setLoading(true);

      try {
        const blob = await reportService.exportReportsJSON(bimesterId);

        // Descargar
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reportes-${bimesterId}.json`;
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

  const exportToCSV = useCallback(
    async (bimesterId: number) => {
      resetError();
      setLoading(true);

      try {
        const blob = await reportService.exportReportsCSV(bimesterId);

        // Descargar
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reportes-${bimesterId}.csv`;
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
    report,
    reports,
    atRiskStudents,
    interventionStudents,
    stats,
    bimesterSummary,
    detailedReport,
    loading,
    error,

    // Obtener reportes
    getStudentReport,
    getDetailedStudentReport,
    getBimesterReports,

    // Estudiantes en riesgo
    getAtRiskStudents,
    getStudentsNeedingIntervention,

    // Estadísticas
    getAttendanceStats,
    getBimesterSummary,

    // Recalcular
    recalculateReport,

    // Exportar
    exportToJSON,
    exportToCSV,

    // Utilidades
    resetError,
    clearCache,
    clearReport: () => setReport(null),
  };
};

export default useReports;