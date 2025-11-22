/**
 * ====================================================================
 * USE ATTENDANCE REPORT - Hook para reportes (TAB 3)
 * ====================================================================
 *
 * Hook para obtener y gestionar reportes de asistencia por estudiante
 * Incluye:
 * • Porcentaje de asistencia
 * • Indicador de riesgo
 * • Historial de registros
 * • Estadísticas consolidadas
 */

'use client';

import { useState, useCallback } from 'react';
import { getAttendanceReport } from '@/services/attendance.service';
import { parseApiError, ApiErrorResponse } from '@/middleware/api-handler';
import { AttendanceReport } from '@/types/attendance.types';

/**
 * Estado del hook de reportes
 */
export interface ReportState {
  report: AttendanceReport | null;
  reports: Map<number, AttendanceReport>;
  isLoading: boolean;
  error: ApiErrorResponse | null;
}

/**
 * Acciones del hook
 */
export interface ReportActions {
  loadReport: (enrollmentId: number) => Promise<AttendanceReport | null>;
  loadMultipleReports: (enrollmentIds: number[]) => Promise<AttendanceReport[]>;
  clearReport: () => void;
  clearAll: () => void;
}

/**
 * Hook para reportes de asistencia
 */
export function useAttendanceReport(): [ReportState, ReportActions] {
  const [state, setState] = useState<ReportState>({
    report: null,
    reports: new Map(),
    isLoading: false,
    error: null,
  });

  /**
   * Carga reporte de un estudiante
   */
  const loadReport = useCallback(async (enrollmentId: number): Promise<AttendanceReport | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const report = await getAttendanceReport(enrollmentId);

      setState(prev => ({
        ...prev,
        report,
        reports: new Map(prev.reports).set(enrollmentId, report),
        isLoading: false,
      }));

      return report;
    } catch (error) {
      const apiError = parseApiError(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError,
      }));
      return null;
    }
  }, []);

  /**
   * Carga múltiples reportes en paralelo
   */
  const loadMultipleReports = useCallback(
    async (enrollmentIds: number[]): Promise<AttendanceReport[]> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const promises = enrollmentIds.map(id => getAttendanceReport(id));
        const results = await Promise.allSettled(promises);

        const reports: AttendanceReport[] = [];
        const reportMap = new Map(state.reports);

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            reports.push(result.value);
            reportMap.set(enrollmentIds[index], result.value);
          }
        });

        setState(prev => ({
          ...prev,
          reports: reportMap,
          isLoading: false,
        }));

        return reports;
      } catch (error) {
        const apiError = parseApiError(error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: apiError,
        }));
        return [];
      }
    },
    [state.reports]
  );

  /**
   * Limpia reporte actual
   */
  const clearReport = useCallback(() => {
    setState(prev => ({
      ...prev,
      report: null,
      error: null,
    }));
  }, []);

  /**
   * Limpia todos los reportes
   */
  const clearAll = useCallback(() => {
    setState({
      report: null,
      reports: new Map(),
      isLoading: false,
      error: null,
    });
  }, []);

  const actions: ReportActions = {
    loadReport,
    loadMultipleReports,
    clearReport,
    clearAll,
  };

  return [state, actions];
}